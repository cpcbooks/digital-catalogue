const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const importerPromise = import(pathToFileURL(path.resolve("scripts/import-publications.mjs")).href);
const manifestPath = path.resolve("data/development-publications/development-early-learning-001.json");

async function prepared() {
  const importer = await importerPromise;
  const manifest = await importer.readManifest(manifestPath);
  const source = await (async () => {
    const result = await importer.execute({ manifestPath, apply: false, compareRemote: false });
    return result.validation;
  })();
  return { importer, manifest, source };
}

test("development publication manifest is valid with stable explicit UUIDs", async () => {
  const { manifest, source } = await prepared();
  assert.equal(manifest.records.length, 10);
  assert.equal(source.valid, true);
  assert.equal(new Set(manifest.records.map(record => record.id)).size, 10);
});

test("manifest validation rejects duplicate IDs, duplicate source IDs, malformed stages and commercial values", async () => {
  const { importer, manifest } = await prepared();
  const broken = structuredClone(manifest);
  broken.records[0].id = "not-a-uuid";
  broken.records[1].id = broken.records[0].id;
  broken.records[2].sourceStaticId = broken.records[0].sourceStaticId;
  broken.records[3].classStage = ["Reception"];
  broken.records[4].mrp = -1;
  broken.records[5].isbn = "";
  broken.records[6].sku = "";
  const result = importer.validateManifest(broken, []);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes("duplicate UUID")));
  assert.ok(result.errors.some(error => error.includes("id must be a UUID")));
  assert.ok(result.errors.some(error => error.includes("duplicate sourceStaticId")));
  assert.ok(result.errors.some(error => error.includes("classStage")));
  assert.ok(result.errors.some(error => error.includes("MRP")));
});

test("manifest metadata must remain aligned with its static source record", async () => {
  const { importer, manifest } = await prepared();
  const broken = structuredClone(manifest);
  broken.records[0].title = "Transcription error";
  const result = importer.validateManifest(broken, await importer.staticRecords());
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes("source-derived metadata")));
});

test("optional commercial fields may be omitted and explicit false eligibility is preserved", async () => {
  const { importer, manifest } = await prepared();
  const last = manifest.records.at(-1);
  const payload = importer.publicationPayload(last);
  assert.equal(last.customKitEligible, false);
  assert.equal(payload.custom_kit_eligible, false);
  assert.equal(Object.hasOwn(payload, "mrp"), false);
  assert.equal(Object.hasOwn(payload, "isbn"), false);
  assert.equal(Object.hasOwn(payload, "sku"), false);
});

test("planning is UUID-idempotent and default execution never writes", async () => {
  const { importer, manifest } = await prepared();
  const payload = importer.publicationPayload(manifest.records[0]);
  assert.equal(importer.planImport([manifest.records[0]], [{ ...payload, series: null, medium: null, mrp: null, isbn: null, sku: null }])[0].action, "UNCHANGED");
  assert.equal(importer.parseArgs(["manifest.json"]).apply, false);
  let writes = 0;
  await importer.execute({ manifestPath, apply: false, compareRemote: false }, { writeRows: async () => { writes++; } });
  assert.equal(writes, 0);
});

test("preflight reports the custom-kit eligibility schema prerequisite", async () => {
  const { importer, manifest } = await prepared();
  const plan = importer.planImport([manifest.records.at(-1)], [], false)[0];
  assert.equal(plan.action, "ERROR");
  assert.match(plan.detail, /custom_kit_eligible/);
});
