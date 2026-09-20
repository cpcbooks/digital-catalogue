#!/usr/bin/env node
/**
 * CPC publication asset importer.
 *
 * Uploads explicitly mapped local files to the public Supabase Storage bucket
 * and upserts publication_assets metadata. This is an admin/development tool;
 * never expose the service-role key to browser code or commit it to Git.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload-publication-assets.mjs assets.json
 *
 * Manifest example:
 * [
 *   {
 *     "publicationId": "22a9f39f-fd15-43dd-af31-caf2190ae48f",
 *     "assetType": "cover",
 *     "file": "/absolute/path/10th LBA Science - Front.png",
 *     "isPrimary": true,
 *     "sortOrder": 0
 *   }
 * ]
 */
import fs from "node:fs/promises";
import path from "node:path";

const SUPABASE_URL = (process.env.SUPABASE_URL || "https://ysaxagxortpxyifyaydx.supabase.co").replace(/\/$/, "");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const BUCKET = process.env.SUPABASE_ASSET_BUCKET || "publication-assets";
const manifestPath = process.argv[2];

if (!SERVICE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required. Do not put it in the manifest or repository.");
if (!manifestPath) throw new Error("Pass a JSON manifest path: node scripts/upload-publication-assets.mjs assets.json");

const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".pdf": "application/pdf" };
const EXT = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "application/pdf": ".pdf" };
const allowedTypes = new Set(["cover", "back_cover", "sample_page", "sample_pdf"]);

function headers(extra = {}) {
  return { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, ...extra };
}

async function jsonRequest(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${body}`);
  return body ? JSON.parse(body) : null;
}

async function assertPublication(publicationId) {
  const url = `${SUPABASE_URL}/rest/v1/publications?id=eq.${encodeURIComponent(publicationId)}&select=id,title,isbn&limit=1`;
  const rows = await jsonRequest(url, { headers: headers({ Accept: "application/json" }) });
  if (!rows?.length) throw new Error(`Publication not found: ${publicationId}`);
  return rows[0];
}

function storageName(item, mime) {
  if (item.storageName) return item.storageName;
  const ext = EXT[mime];
  if (item.assetType === "cover") return `cover${ext}`;
  if (item.assetType === "back_cover") return `back-cover${ext}`;
  if (item.assetType === "sample_pdf") return `sample${ext}`;
  return `samples/${String(item.sortOrder ?? 0).padStart(2, "0")}${ext}`;
}

async function upload(item) {
  if (!item.publicationId || !item.file || !allowedTypes.has(item.assetType)) throw new Error(`Invalid manifest item: ${JSON.stringify(item)}`);
  const publication = await assertPublication(item.publicationId);
  const ext = path.extname(item.file).toLowerCase();
  const mime = MIME[ext];
  if (!mime) throw new Error(`Unsupported file type for ${item.file}`);
  const bytes = await fs.readFile(item.file);
  const relativePath = `${item.publicationId}/${storageName(item, mime)}`;
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${relativePath.split("/").map(encodeURIComponent).join("/")}`;
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: headers({ "Content-Type": mime, "x-upsert": "true", "cache-control": "3600" }),
    body: bytes
  });
  if (!response.ok) throw new Error(`Storage upload failed for ${relativePath}: ${response.status} ${await response.text()}`);

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${relativePath.split("/").map(encodeURIComponent).join("/")}`;
  const existingUrl = `${SUPABASE_URL}/rest/v1/publication_assets?publication_id=eq.${encodeURIComponent(item.publicationId)}&asset_type=eq.${encodeURIComponent(item.assetType)}&storage_path=eq.${encodeURIComponent(relativePath)}&select=id`;
  const existing = await jsonRequest(existingUrl, { headers: headers({ Accept: "application/json" }) });
  const payload = {
    publication_id: item.publicationId,
    asset_type: item.assetType,
    storage_path: relativePath,
    url: publicUrl,
    is_primary: Boolean(item.isPrimary),
    sort_order: Number(item.sortOrder ?? 0),
    active: true
  };
  if (existing?.length) {
    await jsonRequest(`${SUPABASE_URL}/rest/v1/publication_assets?id=eq.${existing[0].id}`, {
      method: "PATCH", headers: headers({ "Content-Type": "application/json", Prefer: "return=representation" }), body: JSON.stringify(payload)
    });
  } else {
    await jsonRequest(`${SUPABASE_URL}/rest/v1/publication_assets`, {
      method: "POST", headers: headers({ "Content-Type": "application/json", Prefer: "return=representation" }), body: JSON.stringify(payload)
    });
  }
  console.log(`✓ ${publication.title}: ${item.assetType} → ${relativePath}`);
}

// Windows editors may prefix UTF-8 JSON with U+FEFF. JSON.parse rejects it,
// so remove only that optional byte-order mark before parsing the manifest.
const manifestText = (await fs.readFile(manifestPath, "utf8")).replace(/^\uFEFF/, "");
const manifest = JSON.parse(manifestText);
if (!Array.isArray(manifest) || !manifest.length) throw new Error("Manifest must be a non-empty JSON array.");
for (const item of manifest) await upload(item);
console.log(`Imported ${manifest.length} publication asset(s).`);
