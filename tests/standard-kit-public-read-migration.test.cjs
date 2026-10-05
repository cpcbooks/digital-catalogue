const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const migration = fs.readFileSync(path.join(root, "supabase", "migrations", "20261005230000_prepare_development_standard_kit.sql"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "data", "development-publications", "development-early-learning-001.json"), "utf8"));
const frontendSources = fs.readdirSync(path.join(root, "js"))
  .filter(file => file.endsWith(".js"))
  .map(file => fs.readFileSync(path.join(root, "js", file), "utf8"));
const selectedStaticIds = [
  "el-abc-book",
  "el-my-book-alphabet",
  "el-my-book-words",
  "el-capital-letter-writing",
  "el-numbers-0-9",
  "el-counting-1-20",
  "el-kannada-varnamale",
  "el-akshar-jyothi"
];
const selected = selectedStaticIds.map(staticId => manifest.records.find(record => record.sourceStaticId === staticId));

test("permits anon reads only for enabled Standard Kit configuration", () => {
  assert.match(migration, /grant select \(stage_code, display_name, enabled\) on table public\.standard_kit_definitions to anon;/);
  assert.match(migration, /grant select \(stage_code, position, publication_id\) on table public\.standard_kit_publications to anon;/);
  assert.match(migration, /on public\.standard_kit_definitions[\s\S]*for select[\s\S]*to anon[\s\S]*using \(enabled\);/);
  assert.match(migration, /on public\.standard_kit_publications[\s\S]*for select[\s\S]*to anon[\s\S]*from public\.standard_kit_definitions as d[\s\S]*d\.stage_code = standard_kit_publications\.stage_code[\s\S]*and d\.enabled/);
  assert.match(migration, /revoke insert, update, delete on table public\.standard_kit_definitions, public\.standard_kit_publications from public, anon, authenticated;/);
  assert.doesNotMatch(migration, /grant (?:insert|update|delete|all) on table public\.standard_kit_(?:definitions|publications).*?(?:to anon|to authenticated|to public)/i);
  assert.doesNotMatch(migration, /for (?:insert|update|delete|all)\b/i);
});

test("defines the exact development-only LKG composition without changing publications", () => {
  assert.equal(selected.length, 8);
  assert.ok(selected.every(Boolean));
  assert.ok(selected.every(record => record.customKitEligible === true));
  assert.match(migration, /DEVELOPMENT ONLY: replace this LKG composition during final item-master cutover/);
  assert.match(migration, /\('lkg', 'Development LKG Standard Kit', true\)/);
  assert.deepEqual(
    [...migration.matchAll(/\('lkg', (\d+), '([0-9a-f-]{36})'\)/g)].map(match => ({ position: Number(match[1]), id: match[2] })),
    selected.map((record, index) => ({ position: index + 1, id: record.id }))
  );
  assert.doesNotMatch(migration, /78f6dd34-4548-420a-a08c-d892ffc6f495|el-numbers-activities-0-50/);
  assert.doesNotMatch(migration, /(?:insert into|update) public\.publications/i);
  for (const record of selected) {
    for (const source of frontendSources) assert.doesNotMatch(source, new RegExp(record.id));
  }
});
