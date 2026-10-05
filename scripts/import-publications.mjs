#!/usr/bin/env node
/**
 * Deterministic publication importer. Dry-run is the default.
 *
 * Usage:
 *   node scripts/import-publications.mjs data/development-publications/development-early-learning-001.json
 *   SUPABASE_URL=... SUPABASE_PUBLISHABLE_KEY=... node scripts/import-publications.mjs manifest.json --compare-remote
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-publications.mjs manifest.json --apply
 */
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SECTIONS = new Set(["Early Learning", "School Learning", "College and University", "Competitive Exams"]);
const BOOK_TYPES = new Set(["Textbook", "Reader", "Semester Book", "Workbook", "Writing Book", "Activity Book", "Drawing Book", "Rhymes Book", "Guide", "Combined Guide", "Question Bank", "Assessment Book"]);
const MEDIA = new Set(["English", "Kannada"]);
const EARLY_STAGES = new Set(["Playgroup", "Nursery", "LKG", "UKG"]);
const LIFECYCLES = new Set(["LIKELY_REAL", "DEVELOPMENT_ONLY", "AMBIGUOUS"]);
const STATIC_TYPE_TO_BOOK_TYPE = Object.freeze({ Reader: "Reader", Writing: "Writing Book", Numbers: "Activity Book", Activity: "Activity Book", "Drawing & Colouring": "Drawing Book", Rhymes: "Rhymes Book" });

function text(value) { return typeof value === "string" ? value.trim() : ""; }
function equal(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function optionalText(record, key) { return text(record[key]) || null; }

export function parseArgs(args) {
  const [manifestPath, ...flags] = args;
  if (!manifestPath || manifestPath.startsWith("-")) throw new Error("Pass a manifest path.");
  const known = new Set(["--apply", "--compare-remote"]);
  if (flags.some(flag => !known.has(flag))) throw new Error("Unknown flag. Use --compare-remote and/or --apply.");
  return { manifestPath, apply: flags.includes("--apply"), compareRemote: flags.includes("--compare-remote") || flags.includes("--apply") };
}

export async function readManifest(manifestPath) {
  const raw = (await fs.readFile(manifestPath, "utf8")).replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

export async function staticRecords(staticPath = "js/catalogue-data.js") {
  const sandbox = { window: {} };
  vm.runInNewContext(await fs.readFile(staticPath, "utf8"), sandbox, { filename: staticPath });
  return sandbox.window.CAMBRIDGE_CATALOGUE || [];
}

function issue(errors, record, message) { errors.push(`${record?.sourceStaticId || "manifest"}: ${message}`); }

export function validateManifest(manifest, staticCatalogue) {
  const errors = [];
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) errors.push("Manifest must be an object.");
  if (manifest?.manifestVersion !== 1) errors.push("manifestVersion must be 1.");
  if (!text(manifest?.importBatch)) errors.push("importBatch is required.");
  if (manifest?.applicationCategory !== "early-learning") errors.push("applicationCategory must be early-learning for this manifest.");
  if (!Array.isArray(manifest?.records) || !manifest.records.length) errors.push("records must be a non-empty array.");
  const ids = new Set(), sourceIds = new Set(), sourceById = new Map((staticCatalogue || []).map(record => [record.id, record]));
  for (const record of manifest?.records || []) {
    if (!record || typeof record !== "object" || Array.isArray(record)) { errors.push("Each record must be an object."); continue; }
    if (!UUID.test(text(record.id))) issue(errors, record, "id must be a UUID.");
    if (ids.has(record.id)) issue(errors, record, "duplicate UUID."); ids.add(record.id);
    if (!text(record.sourceStaticId)) issue(errors, record, "sourceStaticId is required.");
    if (sourceIds.has(record.sourceStaticId)) issue(errors, record, "duplicate sourceStaticId."); sourceIds.add(record.sourceStaticId);
    if (!LIFECYCLES.has(record.lifecycle)) issue(errors, record, "invalid lifecycle.");
    if (!text(record.title) || !SECTIONS.has(record.catalogueSection)) issue(errors, record, "title and valid catalogueSection are required.");
    if (!Array.isArray(record.classStage) || !record.classStage.length || record.classStage.some(stage => !EARLY_STAGES.has(stage))) issue(errors, record, "classStage must contain supported Early Learning stages.");
    if (!BOOK_TYPES.has(record.bookType)) issue(errors, record, "invalid bookType.");
    if (!Object.hasOwn(STATIC_TYPE_TO_BOOK_TYPE, record.sourceType) || STATIC_TYPE_TO_BOOK_TYPE[record.sourceType] !== record.bookType) issue(errors, record, "bookType must use the reviewed static type mapping.");
    if (record.medium !== undefined && record.medium !== null && !MEDIA.has(record.medium)) issue(errors, record, "invalid medium.");
    if (record.mrp !== undefined && (!Number.isFinite(record.mrp) || record.mrp < 0)) issue(errors, record, "MRP must be a non-negative number when supplied.");
    if (record.isbn !== undefined && (!text(record.isbn) || text(record.isbn).length > 32)) issue(errors, record, "ISBN must be non-empty and at most 32 characters when supplied.");
    if (record.sku !== undefined && (!text(record.sku) || text(record.sku).length > 100)) issue(errors, record, "SKU must be non-empty and at most 100 characters when supplied.");
    if (typeof record.customKitEligible !== "boolean") issue(errors, record, "customKitEligible must be explicit.");
    const source = sourceById.get(record.sourceStaticId);
    if (!source) { issue(errors, record, "source static record was not found."); continue; }
    const sourceMedium = optionalText(source, "medium"), manifestMedium = optionalText(record, "medium");
    if (source.title !== record.title || (source.series || null) !== (record.series || null) || !equal(source.class, record.classStage) || (source.subject || null) !== (record.subject || null) || sourceMedium !== manifestMedium || source.type !== record.sourceType || source.category !== "early-learning") issue(errors, record, "source-derived metadata does not match current static catalogue.");
  }
  return { valid: errors.length === 0, errors };
}

export function publicationPayload(record) {
  const payload = { id: record.id, catalogue_section: record.catalogueSection, title: record.title, class_stage: record.classStage, book_type: record.bookType, status: "Active", custom_kit_eligible: record.customKitEligible };
  for (const [from, to] of [["series", "series"], ["subject", "subject"], ["medium", "medium"], ["mrp", "mrp"], ["isbn", "isbn"], ["sku", "sku"]]) if (record[from] !== undefined && record[from] !== null && record[from] !== "") payload[to] = record[from];
  return payload;
}

function comparable(record) {
  return Object.fromEntries(["id", "catalogue_section", "title", "class_stage", "book_type", "status", "series", "subject", "medium", "mrp", "isbn", "sku"].map(key => [key, record[key] ?? null]));
}
export function planImport(records, remoteRows = [], schemaSupportsEligibility = true) {
  const byId = new Map(remoteRows.map(row => [row.id, row]));
  return records.map(record => {
    const payload = publicationPayload(record), current = byId.get(record.id);
    if (schemaSupportsEligibility === false) return { record, action: "ERROR", detail: "Target schema lacks publications.custom_kit_eligible; deploy the prepared migration first." };
    const schemaNote = schemaSupportsEligibility === null ? " custom_kit_eligible support is unverified; use --compare-remote before apply." : "";
    if (current) return { record, action: equal(comparable(current), comparable(payload)) && current.custom_kit_eligible === payload.custom_kit_eligible ? "UNCHANGED" : "UPDATE", detail: "Matched canonical UUID." + schemaNote, payload };
    const duplicate = remoteRows.find(row => text(row.title).toLocaleLowerCase() === text(record.title).toLocaleLowerCase() && row.catalogue_section === record.catalogueSection);
    if (duplicate) return { record, action: "CONFLICT", detail: `Possible existing title match: ${duplicate.id}.` + schemaNote, payload };
    return { record, action: "CREATE", detail: "No canonical UUID or obvious title match found." + schemaNote, payload };
  });
}

async function remoteRows(url, key) {
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/publications?select=id,title,series,class_stage,subject,medium,book_type,status,custom_kit_eligible`, { headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" } });
  if (!response.ok) {
    const body = await response.text();
    if (/custom_kit_eligible/i.test(body)) return { rows: [], schemaSupportsEligibility: false };
    throw new Error(`Remote comparison failed (${response.status}).`);
  }
  return { rows: await response.json(), schemaSupportsEligibility: true };
}

async function writeRows(url, key, plans) {
  for (const plan of plans.filter(plan => plan.action === "CREATE" || plan.action === "UPDATE")) {
    const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/publications?on_conflict=id`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(plan.payload) });
    if (!response.ok) throw new Error(`Write failed for ${plan.record.sourceStaticId} (${response.status}).`);
  }
}

export async function execute(options, dependencies = {}) {
  const manifest = await (dependencies.readManifest || readManifest)(options.manifestPath);
  const staticCatalogue = await (dependencies.staticRecords || staticRecords)();
  const validation = validateManifest(manifest, staticCatalogue);
  if (!validation.valid) return { mode: "dry-run", validation, plans: [] };
  let rows = [], schemaSupportsEligibility = null, compared = false;
  if (options.compareRemote) {
    const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return { mode: "dry-run", validation, plans: planImport(manifest.records, [], false), compared: false, note: "Remote comparison was not performed: SUPABASE_URL and a read key are required." };
    ({ rows, schemaSupportsEligibility } = await (dependencies.remoteRows || remoteRows)(url, key)); compared = true;
  }
  const plans = planImport(manifest.records, rows, schemaSupportsEligibility);
  if (!options.apply) return { mode: "dry-run", validation, plans, compared };
  if (!compared) throw new Error("--apply requires a remote comparison.");
  if (plans.some(plan => plan.action === "ERROR" || plan.action === "CONFLICT")) throw new Error("Refusing apply: resolve ERROR or CONFLICT plans first.");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("--apply requires SUPABASE_SERVICE_ROLE_KEY from the environment.");
  await (dependencies.writeRows || writeRows)(process.env.SUPABASE_URL, serviceKey, plans);
  return { mode: "apply", validation, plans, compared };
}

function print(result) {
  for (const plan of result.plans) console.log(`${plan.action}\t${plan.record.sourceStaticId}\t${plan.detail}`);
  if (result.validation.errors.length) for (const error of result.validation.errors) console.error(`ERROR\t${error}`);
  console.log(`${result.mode.toUpperCase()}: ${result.plans.length} record(s); remote comparison ${result.compared ? "performed" : "not performed"}.`);
}

if (path.resolve(process.argv[1] || "") === path.resolve(fileURLToPath(import.meta.url))) {
  try { print(await execute(parseArgs(process.argv.slice(2)))); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
