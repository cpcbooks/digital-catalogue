#!/usr/bin/env node
/** Safe, approval-gated importer for CPC publication images. */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

export const PILOT_SKUS = ["CPC00015", "CPC00016", "CPC00017", "CPC00018", "CPC00019"];
export const EXCLUDED_UNREGISTERED_SKUS = new Set(["CPC00428", "CPC00429", "CPC00430"]);
export const IMAGE_TYPES = new Map([[".jpg", "image/jpeg"], [".jpeg", "image/jpeg"], [".png", "image/png"], [".webp", "image/webp"]]);
const IMAGE_LIKE_EXTENSIONS = new Set([...IMAGE_TYPES.keys(), ".gif", ".bmp", ".tif", ".tiff"]);
const field = { publication_id: "publicationId", asset_type: "assetType", storage_path: "storagePath", sort_order: "sortOrder", storage_action: "storageAction", database_action: "databaseAction" };
const text = value => String(value ?? "");
const encodePath = value => value.split("/").map(encodeURIComponent).join("/");
const hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const publicUrl = (url, bucket, storagePath) => `${url}/storage/v1/object/public/${bucket}/${encodePath(storagePath)}`;
const csv = value => `"${text(value).replaceAll('"', '""')}"`;

export function parseArgs(args) {
  const options = { input: "", report: "", pilot: false, apply: false, confirm: false };
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--input") options.input = args[++i] || "";
    else if (args[i] === "--report") options.report = args[++i] || "";
    else if (args[i] === "--pilot") options.pilot = true;
    else if (args[i] === "--apply") options.apply = true;
    else if (args[i] === "--confirm-upload") options.confirm = true;
    else if (args[i] === "--help" || args[i] === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${args[i]}`);
  }
  if (!options.help && !options.input) throw new Error("Pass --input <folders-or-zip>.");
  if (options.apply && !options.confirm) throw new Error("--apply requires --confirm-upload.");
  return options;
}
export function usage() { return "Usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload-publication-assets.mjs --input CPC_Publication_Images.zip [--pilot] [--report report.csv] [--apply --confirm-upload]"; }

async function walk(root) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  return (await Promise.all(entries.map(async entry => {
    const target = path.join(root, entry.name);
    return entry.isDirectory() ? walk(target) : entry.isFile() ? [target] : [];
  }))).flat();
}
function skuFolder(relative) { return relative.split(path.sep).find(part => /^(CPC\d{5})\s+.+/i.test(part)) || ""; }
function assetType(file, imageCount) {
  const name = path.basename(file, path.extname(file)).toLowerCase();
  if (/(^|[-_ .])(back|rear)([-_ .]|$)/.test(name)) return "back_cover";
  if (/(^|[-_ .])(front|cover)([-_ .]|$)/.test(name)) return "cover";
  if (/(^|[-_ .])(sample|inside|page)([-_ .]|$)/.test(name)) return "sample_page";
  return imageCount === 1 ? "cover" : "";
}
function sampleName(candidate) {
  const extension = path.extname(candidate.file).toLowerCase();
  const base = path.basename(candidate.file, path.extname(candidate.file)).toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return `samples/${base}${extension}`;
}
function sampleOrder(candidate, sameSkuSamples) {
  const lastNumber = path.basename(candidate.file, path.extname(candidate.file)).match(/(\d+)(?!.*\d)/)?.[1];
  if (lastNumber) return Number(lastNumber);
  return 10000 + sameSkuSamples.findIndex(item => item.relative === candidate.relative);
}
function storagePath(publicationId, candidate, samples) {
  const extension = path.extname(candidate.file).toLowerCase();
  if (candidate.assetType === "cover") return `${publicationId}/front${extension}`;
  if (candidate.assetType === "back_cover") return `${publicationId}/back${extension}`;
  return `${publicationId}/${sampleName(candidate)}`;
}

export async function discoverImages(root) {
  const groups = new Map(), invalid = [];
  for (const file of await walk(root)) {
    const extension = path.extname(file).toLowerCase();
    const relative = path.relative(root, file), folder = skuFolder(relative);
    if (!folder) continue;
    const sku = folder.slice(0, 8).toUpperCase();
    if (!IMAGE_TYPES.has(extension)) {
      if (IMAGE_LIKE_EXTENSIONS.has(extension)) invalid.push({ file, relative: relative.split(path.sep).join("/"), sku, assetType: "", invalid: true, hash: hash(await fs.readFile(file)) });
      continue;
    }
    groups.set(sku, [...(groups.get(sku) || []), { file, relative: relative.split(path.sep).join("/") }]);
  }
  const output = [];
  for (const [sku, files] of groups) for (const item of files) output.push({ ...item, sku, assetType: assetType(item.file, files.length), hash: hash(await fs.readFile(item.file)) });
  return [...output, ...invalid].sort((a, b) => a.sku.localeCompare(b.sku) || a.relative.localeCompare(b.relative));
}
function run(command, args) { return new Promise((resolve, reject) => { const child = spawn(command, args, { stdio: "ignore", windowsHide: true }); child.once("error", reject); child.once("exit", code => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`))); }); }
export async function prepareInput(input) {
  if ((await fs.stat(input)).isDirectory()) return { root: path.resolve(input), cleanup: async () => {} };
  if (path.extname(input).toLowerCase() !== ".zip") throw new Error("--input must be a directory or .zip archive.");
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "cpc-publication-images-"));
  try { await run("tar", ["-xf", path.resolve(input), "-C", root]); return { root, cleanup: () => fs.rm(root, { recursive: true, force: true }) }; }
  catch (error) { await fs.rm(root, { recursive: true, force: true }); throw new Error(`Could not extract ZIP with tar: ${error.message}`); }
}

export class SupabaseClient {
  constructor({ url, key, bucket = "publication-assets", fetchFn = fetch }) { this.url = url.replace(/\/$/, ""); this.key = key; this.bucket = bucket; this.fetch = fetchFn; }
  headers(extra = {}) { return { apikey: this.key, Authorization: `Bearer ${this.key}`, ...extra }; }
  async request(url, options = {}, allow404 = false) { const response = await this.fetch(url, options), body = await response.text(); if (allow404 && response.status === 404) return null; if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${body}`); return body ? JSON.parse(body) : null; }
  publicationsForSkus(skus) { return skus.length ? this.request(`${this.url}/rest/v1/publications?sku=in.(${skus.map(encodeURIComponent).join(",")})&select=id,sku,title`, { headers: this.headers({ Accept: "application/json" }) }) : []; }
  assetsForPublication(id) { return this.request(`${this.url}/rest/v1/publication_assets?publication_id=eq.${encodeURIComponent(id)}&select=id,asset_type,storage_path,is_primary,active,sort_order`, { headers: this.headers({ Accept: "application/json" }) }); }
  storageInfo(storagePath) { return this.request(`${this.url}/storage/v1/object/info/${this.bucket}/${encodePath(storagePath)}`, { headers: this.headers() }, true); }
  async download(storagePath) { const response = await this.fetch(`${this.url}/storage/v1/object/${this.bucket}/${encodePath(storagePath)}`, { headers: this.headers() }); if (!response.ok) throw new Error(`Download verification failed for ${storagePath}: ${response.status} ${await response.text()}`); return Buffer.from(await response.arrayBuffer()); }
  upload(storagePath, bytes, mime) { return this.request(`${this.url}/storage/v1/object/${this.bucket}/${encodePath(storagePath)}`, { method: "POST", headers: this.headers({ "Content-Type": mime, "cache-control": "3600", "x-upsert": "false" }), body: bytes }); }
  register(payload) { return this.request(`${this.url}/rest/v1/publication_assets`, { method: "POST", headers: this.headers({ "Content-Type": "application/json", Prefer: "return=representation" }), body: JSON.stringify(payload) }); }
}

function baseRow(candidate, publication) { return { sku: candidate.sku, title: publication?.title || "", publicationId: publication?.id || "", source: candidate.relative, sha256: candidate.hash, assetType: candidate.assetType || "", storagePath: "", sortOrder: "", collision: "", storageAction: "", databaseAction: "", status: "", detail: "" }; }
function skip(row, status, collision) { row.status = status; row.collision = collision; row.storageAction = "SKIP"; row.databaseAction = "SKIP"; return row; }
async function matchingObject(client, row) { return (await client.storageInfo(row.storagePath)) && hash(await client.download(row.storagePath)) === row.sha256; }

/** Read-only planner. It never updates an existing object or asset row. */
export async function planUpload({ candidates, client, skus, requiredSkus = [] }) {
  const selected = candidates.filter(candidate => !skus || skus.includes(candidate.sku));
  const publications = await client.publicationsForSkus([...new Set([...selected.map(item => item.sku), ...requiredSkus])]);
  const bySku = new Map(publications.map(item => [item.sku, item]));
  const seen = new Set(), duplicate = new Set(), plan = [];
  for (const candidate of selected) { const key = candidate.assetType === "sample_page" ? `${candidate.sku}:${sampleName(candidate)}` : `${candidate.sku}:${candidate.assetType || "unclassified"}`; if (seen.has(key)) duplicate.add(key); seen.add(key); }
  for (const candidate of selected) {
    const publication = bySku.get(candidate.sku), row = baseRow(candidate, publication);
    const key = candidate.assetType === "sample_page" ? `${candidate.sku}:${sampleName(candidate)}` : `${candidate.sku}:${candidate.assetType || "unclassified"}`;
    if (candidate.invalid) { row.status = "ERROR_UNSUPPORTED_FILE_TYPE"; row.collision = "NOT_CHECKED"; }
    else if (!candidate.assetType) { row.status = "ERROR_UNCLASSIFIED_IMAGE"; row.collision = "NOT_CHECKED"; }
    else if (duplicate.has(key)) { row.status = "ERROR_DUPLICATE_INPUT"; row.collision = "DUPLICATE_INPUT"; }
    else if (EXCLUDED_UNREGISTERED_SKUS.has(candidate.sku)) skip(row, "SKIP_EXCLUDED_UNREGISTERED_SKU", "UNREGISTERED_SKU");
    else if (!publication) { row.status = "ERROR_PUBLICATION_NOT_FOUND"; row.collision = "PUBLICATION_NOT_FOUND"; }
    else {
      const samples = selected.filter(item => item.sku === candidate.sku && item.assetType === "sample_page");
      row.storagePath = storagePath(publication.id, candidate, samples); row.sortOrder = candidate.assetType === "sample_page" ? sampleOrder(candidate, samples) : candidate.assetType === "back_cover" ? 1 : 0;
      const assets = await client.assetsForPublication(publication.id);
      if (assets.some(asset => asset.storage_path === row.storagePath)) skip(row, "SKIP_REGISTERED", "REGISTERED_PATH");
      else if (candidate.assetType !== "sample_page" && assets.some(asset => asset.asset_type === candidate.assetType && asset.active !== false)) skip(row, "SKIP_ASSET_TYPE_EXISTS", "ACTIVE_ASSET_TYPE");
      else if (await client.storageInfo(row.storagePath)) {
        if (await matchingObject(client, row)) { row.status = "RECOVER_REGISTRATION"; row.collision = "UNREGISTERED_OBJECT_MATCHES_SOURCE"; row.storageAction = "SKIP"; row.databaseAction = "INSERT"; }
        else { row.status = "ERROR_STORAGE_CHECKSUM_MISMATCH"; row.collision = "STORAGE_OBJECT"; }
      } else { row.status = "READY"; row.collision = "CLEAR"; row.storageAction = "UPLOAD"; row.databaseAction = "INSERT"; }
    }
    plan.push(row);
  }
  for (const sku of requiredSkus) if (!selected.some(candidate => candidate.sku === sku && candidate.assetType === "cover")) plan.push({ sku, title: bySku.get(sku)?.title || "", publicationId: bySku.get(sku)?.id || "", source: "", sha256: "", assetType: "cover", storagePath: "", sortOrder: 0, collision: "NOT_CHECKED", storageAction: "SKIP", databaseAction: "SKIP", status: "ERROR_MISSING_PILOT_COVER", detail: "Pilot requires one front cover for this SKU." });
  return plan.sort((a, b) => a.sku.localeCompare(b.sku) || a.source.localeCompare(b.source));
}

async function revalidate(row, candidate, client) {
  const assets = await client.assetsForPublication(row.publicationId);
  if (assets.some(asset => asset.storage_path === row.storagePath)) return skip(row, "SKIP_REGISTERED", "REGISTERED_PATH");
  if (row.assetType !== "sample_page" && assets.some(asset => asset.asset_type === row.assetType && asset.active !== false)) return skip(row, "SKIP_ASSET_TYPE_EXISTS", "ACTIVE_ASSET_TYPE");
  const exists = await client.storageInfo(row.storagePath);
  if (row.status === "READY" && exists) {
    if (await matchingObject(client, row)) { row.status = "RECOVER_REGISTRATION"; row.collision = "UNREGISTERED_OBJECT_MATCHES_SOURCE"; row.storageAction = "SKIP"; return true; }
    row.status = "ERROR_COLLISION_CHANGED"; row.collision = "STORAGE_OBJECT"; row.detail = "Destination appeared with different bytes before upload."; return false;
  }
  if (row.status === "RECOVER_REGISTRATION" && (!exists || !await matchingObject(client, row))) { row.status = "ERROR_RECOVERY_CHECKSUM_MISMATCH"; row.detail = "Existing object changed or disappeared before registration recovery."; return false; }
  return true;
}
export async function applyPlan(plan, candidates, client) {
  const sources = new Map(candidates.map(candidate => [candidate.relative, candidate]));
  for (const row of plan.filter(item => item.status === "READY" || item.status === "RECOVER_REGISTRATION")) {
    const candidate = sources.get(row.source);
    try {
      if (!await revalidate(row, candidate, client) || row.status === "SKIP_REGISTERED" || row.status === "SKIP_ASSET_TYPE_EXISTS") continue;
      if (row.status === "READY") {
        await client.upload(row.storagePath, await fs.readFile(candidate.file), IMAGE_TYPES.get(path.extname(candidate.file).toLowerCase()));
        if (!await client.storageInfo(row.storagePath) || !await matchingObject(client, row)) throw new Error("Uploaded object is missing or checksum differs.");
      }
      await client.register({ publication_id: row.publicationId, asset_type: row.assetType, storage_path: row.storagePath, url: publicUrl(client.url, client.bucket, row.storagePath), is_primary: row.assetType === "cover", sort_order: Number(row.sortOrder), active: true });
      if (!(await client.assetsForPublication(row.publicationId)).some(asset => asset.storage_path === row.storagePath)) throw new Error("Inserted asset row was not returned by verification.");
      row.status = "UPLOADED_AND_REGISTERED"; row.detail = "Storage SHA-256 and publication_assets registration verified.";
    } catch (error) {
      let recoverable = false;
      try { recoverable = Boolean(await client.storageInfo(row.storagePath)) && await matchingObject(client, row); } catch { /* The original failure is the reportable outcome. */ }
      row.status = recoverable ? "ERROR_REGISTRATION_FAILED_RECOVERABLE" : "ERROR_UPLOAD_OR_VERIFICATION";
      row.detail = error.message;
    }
  }
  return plan;
}
export async function writeReport(reportPath, plan) {
  const columns = ["sku", "publication_id", "title", "source", "sha256", "asset_type", "storage_path", "sort_order", "collision", "storage_action", "database_action", "status", "detail"];
  const body = [columns.join(","), ...plan.map(row => columns.map(column => csv(row[field[column] || column] ?? "")).join(","))].join("\n") + "\n";
  await fs.mkdir(path.dirname(path.resolve(reportPath)), { recursive: true }); await fs.writeFile(reportPath, body, "utf8");
}
async function main() {
  const options = parseArgs(process.argv.slice(2)); if (options.help) return console.log(usage());
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required. Keep it outside Git.");
  const client = new SupabaseClient({ url: process.env.SUPABASE_URL || "https://ysaxagxortpxyifyaydx.supabase.co", key, bucket: process.env.SUPABASE_ASSET_BUCKET || "publication-assets" });
  const input = await prepareInput(options.input);
  try {
    const all = await discoverImages(input.root), candidates = options.pilot ? all.filter(item => PILOT_SKUS.includes(item.sku) && (item.assetType === "cover" || !item.assetType)) : all;
    const plan = await planUpload({ candidates, client, skus: options.pilot ? PILOT_SKUS : null, requiredSkus: options.pilot ? PILOT_SKUS : [] });
    if (!plan.length) throw new Error("No supported images were found in SKU Book Title folders.");
    if (options.apply && plan.some(row => row.status.startsWith("ERROR_"))) throw new Error("Refusing to apply a plan containing validation errors.");
    if (options.apply) await applyPlan(plan, candidates, client);
    if (options.report) await writeReport(options.report, plan);
    console.table(plan.map(({ sku, publicationId, assetType, storagePath, status }) => ({ sku, publicationId, assetType, storagePath, status })));
    if (plan.some(row => row.status.startsWith("ERROR_"))) process.exitCode = 1;
  } finally { await input.cleanup(); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(`Upload plan failed: ${error.message}`); process.exitCode = 1; });
