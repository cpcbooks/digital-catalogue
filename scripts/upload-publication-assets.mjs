#!/usr/bin/env node
/** Safe bulk importer for CPC publication images. Admin CLI only. */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

export const PILOT_SKUS = ["CPC00015", "CPC00016", "CPC00017", "CPC00018", "CPC00019"];
export const IMAGE_TYPES = new Map([[".jpg", "image/jpeg"], [".jpeg", "image/jpeg"], [".png", "image/png"], [".webp", "image/webp"]]);
const text = value => String(value ?? "");
const encodePath = value => value.split("/").map(encodeURIComponent).join("/");
const publicUrl = (url, bucket, storagePath) => `${url}/storage/v1/object/public/${bucket}/${encodePath(storagePath)}`;
const csv = value => `"${text(value).replaceAll('"', '""')}"`;

export function parseArgs(args) {
  const options = { dryRun: true, pilot: false, apply: false, input: "", report: "", confirm: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--input") options.input = args[++index] || "";
    else if (argument === "--report") options.report = args[++index] || "";
    else if (argument === "--pilot") options.pilot = true;
    else if (argument === "--apply") { options.apply = true; options.dryRun = false; }
    else if (argument === "--confirm-upload") options.confirm = true;
    else if (argument === "--help" || argument === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (!options.help && !options.input) throw new Error("Pass --input <folders-or-zip>.");
  if (options.apply && !options.confirm) throw new Error("--apply requires --confirm-upload.");
  return options;
}
export function usage() { return "Usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload-publication-assets.mjs --input <folders-or-zip> [--pilot] [--report report.csv] [--apply --confirm-upload]"; }
async function hashFile(file) { return crypto.createHash("sha256").update(await fs.readFile(file)).digest("hex"); }
async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : entry.isFile() ? [target] : [];
  }))).flat();
}
function skuFolder(relativeFile) { return relativeFile.split(path.sep).find(part => /^(CPC\d{5})\s+.+/i.test(part)) || ""; }
function assetType(file, folderImages) {
  const name = path.basename(file, path.extname(file)).toLowerCase();
  if (/(^|[-_ .])(back|rear)([-_ .]|$)/.test(name)) return "back_cover";
  if (/(^|[-_ .])(front|cover)([-_ .]|$)/.test(name)) return "cover";
  if (/(^|[-_ .])(sample|inside|page)([-_ .]|$)/.test(name)) return "sample_page";
  return folderImages === 1 ? "cover" : "";
}

/** Reads only image files held beneath folders named "SKU Book Title". */
export async function discoverImages(root) {
  const groups = new Map();
  for (const file of await walk(root)) {
    if (!IMAGE_TYPES.has(path.extname(file).toLowerCase())) continue;
    const relative = path.relative(root, file), folder = skuFolder(relative);
    if (!folder) continue;
    const sku = folder.slice(0, 8).toUpperCase();
    groups.set(sku, [...(groups.get(sku) || []), { file, relative: relative.split(path.sep).join("/"), folder }]);
  }
  const candidates = [];
  for (const [sku, files] of groups) for (const image of files) candidates.push({ ...image, sku, assetType: assetType(image.file, files.length), hash: await hashFile(image.file) });
  return candidates.sort((a, b) => a.sku.localeCompare(b.sku) || a.relative.localeCompare(b.relative));
}
function storagePath(publicationId, candidate, samplePosition) {
  const extension = path.extname(candidate.file).toLowerCase();
  if (candidate.assetType === "cover") return `${publicationId}/front${extension}`;
  if (candidate.assetType === "back_cover") return `${publicationId}/back${extension}`;
  return `${publicationId}/samples/${String(samplePosition).padStart(2, "0")}${extension}`;
}
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "ignore", windowsHide: true });
    child.once("error", reject);
    child.once("exit", code => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)));
  });
}
export async function prepareInput(input) {
  const stat = await fs.stat(input);
  if (stat.isDirectory()) return { root: path.resolve(input), cleanup: async () => {} };
  if (path.extname(input).toLowerCase() !== ".zip") throw new Error("--input must be a directory or .zip archive.");
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "cpc-publication-images-"));
  try { await run("tar", ["-xf", path.resolve(input), "-C", root]); return { root, cleanup: async () => fs.rm(root, { recursive: true, force: true }) }; }
  catch (error) { await fs.rm(root, { recursive: true, force: true }); throw new Error(`Could not extract ZIP with tar: ${error.message}`); }
}

export class SupabaseClient {
  constructor({ url, key, bucket = "publication-assets", fetchFn = fetch }) { this.url = text(url).replace(/\/$/, ""); this.key = key; this.bucket = bucket; this.fetch = fetchFn; }
  headers(extra = {}) { return { apikey: this.key, Authorization: `Bearer ${this.key}`, ...extra }; }
  async request(url, options = {}, allow404 = false) {
    const response = await this.fetch(url, options), body = await response.text();
    if (allow404 && response.status === 404) return null;
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${body}`);
    return body ? JSON.parse(body) : null;
  }
  publicationsForSkus(skus) { return skus.length ? this.request(`${this.url}/rest/v1/publications?sku=in.(${skus.map(encodeURIComponent).join(",")})&select=id,sku,title`, { headers: this.headers({ Accept: "application/json" }) }) : []; }
  assetsForPublication(id) { return this.request(`${this.url}/rest/v1/publication_assets?publication_id=eq.${encodeURIComponent(id)}&select=id,asset_type,storage_path,is_primary,active`, { headers: this.headers({ Accept: "application/json" }) }); }
  storageInfo(storagePath) { return this.request(`${this.url}/storage/v1/object/info/${this.bucket}/${encodePath(storagePath)}`, { headers: this.headers() }, true); }
  upload(storagePath, bytes, mime) { return this.request(`${this.url}/storage/v1/object/${this.bucket}/${encodePath(storagePath)}`, { method: "POST", headers: this.headers({ "Content-Type": mime, "cache-control": "3600", "x-upsert": "false" }), body: bytes }); }
  async download(storagePath) {
    const response = await this.fetch(`${this.url}/storage/v1/object/${this.bucket}/${encodePath(storagePath)}`, { headers: this.headers() });
    if (!response.ok) throw new Error(`Download verification failed for ${storagePath}: ${response.status} ${await response.text()}`);
    return Buffer.from(await response.arrayBuffer());
  }
  register(payload) { return this.request(`${this.url}/rest/v1/publication_assets`, { method: "POST", headers: this.headers({ "Content-Type": "application/json", Prefer: "return=representation" }), body: JSON.stringify(payload) }); }
}

/** Builds a read-only plan. It never patches existing asset metadata. */
export async function planUpload({ candidates, client, skus }) {
  const selected = candidates.filter(candidate => !skus || skus.includes(candidate.sku));
  const publications = await client.publicationsForSkus([...new Set(selected.map(candidate => candidate.sku))]);
  const bySku = new Map(publications.map(publication => [publication.sku, publication]));
  const duplicateKeys = new Set(), seen = new Set(), samplePositions = new Map(), plan = [];
  for (const candidate of selected) { const key = candidate.assetType === "sample_page" ? `${candidate.sku}:sample:${candidate.relative}` : `${candidate.sku}:${candidate.assetType || "unclassified"}`; if (seen.has(key)) duplicateKeys.add(key); seen.add(key); }
  for (const candidate of selected) {
    const publication = bySku.get(candidate.sku);
    const row = { sku: candidate.sku, title: publication?.title || "", publicationId: publication?.id || "", source: candidate.relative, sha256: candidate.hash, assetType: candidate.assetType || "", storagePath: "", collision: "", storageAction: "", databaseAction: "", status: "" };
    const key = candidate.assetType === "sample_page" ? `${candidate.sku}:sample:${candidate.relative}` : `${candidate.sku}:${candidate.assetType || "unclassified"}`;
    if (!candidate.assetType) { row.status = "ERROR_UNCLASSIFIED_IMAGE"; row.collision = "NOT_CHECKED"; }
    else if (duplicateKeys.has(key)) { row.status = "ERROR_DUPLICATE_INPUT"; row.collision = "DUPLICATE_INPUT"; }
    else if (!publication) { row.status = "ERROR_PUBLICATION_NOT_FOUND"; row.collision = "PUBLICATION_NOT_FOUND"; }
    else {
      const sampleKey = `${candidate.sku}:${candidate.assetType}`, samplePosition = candidate.assetType === "sample_page" ? (samplePositions.get(sampleKey) || 0) + 1 : 0;
      samplePositions.set(sampleKey, samplePosition); row.storagePath = storagePath(publication.id, candidate, samplePosition);
      const assets = await client.assetsForPublication(publication.id);
      if (assets.some(asset => asset.storage_path === row.storagePath)) { row.status = "SKIP_REGISTERED"; row.collision = "REGISTERED_PATH"; row.storageAction = "SKIP"; row.databaseAction = "SKIP"; }
      else if (assets.some(asset => asset.asset_type === candidate.assetType && asset.active !== false)) { row.status = "SKIP_ASSET_TYPE_EXISTS"; row.collision = "ACTIVE_ASSET_TYPE"; row.storageAction = "SKIP"; row.databaseAction = "SKIP"; }
      else if (await client.storageInfo(row.storagePath)) { row.status = "SKIP_STORAGE_EXISTS"; row.collision = "STORAGE_OBJECT"; row.storageAction = "SKIP"; row.databaseAction = "SKIP"; }
      else { row.status = "READY"; row.collision = "CLEAR"; row.storageAction = "UPLOAD"; row.databaseAction = "INSERT"; }
    }
    plan.push(row);
  }
  return plan;
}
export async function applyPlan(plan, candidates, client) {
  const sources = new Map(candidates.map(candidate => [candidate.relative, candidate]));
  for (const row of plan.filter(item => item.status === "READY")) {
    const candidate = sources.get(row.source), bytes = await fs.readFile(candidate.file);
    await client.upload(row.storagePath, bytes, IMAGE_TYPES.get(path.extname(candidate.file).toLowerCase()));
    if (!await client.storageInfo(row.storagePath)) throw new Error(`Upload verification failed for ${row.storagePath}`);
    if (crypto.createHash("sha256").update(await client.download(row.storagePath)).digest("hex") !== row.sha256) throw new Error(`Upload checksum verification failed for ${row.storagePath}`);
    await client.register({ publication_id: row.publicationId, asset_type: row.assetType, storage_path: row.storagePath, url: publicUrl(client.url, client.bucket, row.storagePath), is_primary: row.assetType === "cover", sort_order: row.assetType === "back_cover" ? 1 : 0, active: true });
    if (!(await client.assetsForPublication(row.publicationId)).some(asset => asset.storage_path === row.storagePath)) throw new Error(`Registration verification failed for ${row.storagePath}`);
    row.status = "UPLOADED_AND_REGISTERED";
  }
  return plan;
}
export async function writeReport(reportPath, plan) {
  const columns = ["sku", "publication_id", "title", "source", "sha256", "asset_type", "storage_path", "collision", "storage_action", "database_action", "status"];
  const field = { publication_id: "publicationId", asset_type: "assetType", storage_path: "storagePath", storage_action: "storageAction", database_action: "databaseAction" };
  const body = [columns.join(","), ...plan.map(row => columns.map(column => csv(row[field[column] || column] || "")).join(","))].join("\n") + "\n";
  await fs.mkdir(path.dirname(path.resolve(reportPath)), { recursive: true }); await fs.writeFile(reportPath, body, "utf8");
}
async function main() {
  const options = parseArgs(process.argv.slice(2)); if (options.help) { console.log(usage()); return; }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for publication and collision validation. Keep it outside Git.");
  const client = new SupabaseClient({ url: process.env.SUPABASE_URL || "https://ysaxagxortpxyifyaydx.supabase.co", key, bucket: process.env.SUPABASE_ASSET_BUCKET || "publication-assets" });
  const input = await prepareInput(options.input);
  try {
    const discovered = await discoverImages(input.root);
    const candidates = options.pilot ? discovered.filter(candidate => candidate.assetType === "cover") : discovered;
    const plan = await planUpload({ candidates, client, skus: options.pilot ? PILOT_SKUS : null });
    if (!plan.length) throw new Error("No supported images were found in SKU Book Title folders.");
    if (options.report) await writeReport(options.report, plan);
    if (options.apply && plan.some(row => row.status.startsWith("ERROR_"))) throw new Error("Refusing to apply a plan containing validation errors.");
    if (options.apply) await applyPlan(plan, candidates, client);
    if (options.apply && options.report) await writeReport(options.report, plan);
    console.table(plan.map(({ sku, publicationId, assetType, storagePath, status }) => ({ sku, publicationId, assetType, storagePath, status })));
    if (plan.some(row => row.status.startsWith("ERROR_"))) process.exitCode = 1;
  } finally { await input.cleanup(); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(`Upload plan failed: ${error.message}`); process.exitCode = 1; });
