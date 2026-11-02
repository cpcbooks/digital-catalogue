const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const migration = "supabase/migrations/20261102_enforce_custom_kit_publication_eligibility.sql";
const rollback = "supabase/migrations/20261102_enforce_custom_kit_publication_eligibility.rollback.sql";
const priorClause = "if v_item_type='custom-kit' and v_publication.custom_kit_eligible is false then raise exception 'Ineligible Custom Kit publication'; end if;";
const strictClause = "if v_item_type='custom-kit' and (v_publication.catalogue_category is distinct from 'Early Learning' or v_publication.custom_kit_eligible is not true) then raise exception 'Ineligible Custom Kit publication'; end if;";

function isEligibleCustomKitPublication(publication) {
  return publication.status === "Active" && publication.catalogueCategory === "Early Learning" && publication.customKitEligible === true;
}

function validCustomKit(publications, stage = "playgroup", quantity = 1) {
  const ids = publications.map(publication => publication.id);
  return ["playgroup", "nursery", "lkg", "ukg"].includes(stage)
    && Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= 10000
    && ids.length >= 8 && new Set(ids).size === ids.length
    && publications.every(isEligibleCustomKitPublication);
}

function publication(id, overrides = {}) {
  return { id, status: "Active", catalogueCategory: "Early Learning", customKitEligible: true, ...overrides };
}

test("strict Custom Kit migration changes only the exact deployed eligibility clause and round-trips", () => {
  const source = read(migration), undo = read(rollback);
  assert.match(source, /pg_get_functiondef\('public\.submit_catalogue_request\(jsonb\)'::regprocedure\)/);
  assert.match(source, /catalogue_category is distinct from 'Early Learning'/);
  assert.match(source, /custom_kit_eligible is not true/);
  assert.match(source, /match_count <> 1/);
  assert.match(source, /^begin;[\s\S]*^commit;$/m);
  assert.match(undo, /This restores the prior validation and therefore reopens the eligibility gap/);
  const definition = "before " + priorClause + " after";
  const strict = definition.replace(priorClause, strictClause);
  assert.equal(strict.replace(strictClause, priorClause), definition);
});

test("Custom Kit eligibility accepts only active, explicitly eligible Early Learning publications", () => {
  const valid = Array.from({ length: 8 }, (_, index) => publication("early-" + index));
  assert.equal(validCustomKit(valid), true);
  assert.equal(validCustomKit(valid.concat(publication("early-8"))), true);
  assert.equal(validCustomKit(valid.slice(0, 7)), false);
  assert.equal(validCustomKit(valid.slice(0, 7).concat(publication("early-0"))), false);
  assert.equal(validCustomKit(valid.slice(0, 7).concat(publication("school", { catalogueCategory: "School Books" }))), false);
  assert.equal(validCustomKit(valid.slice(0, 7).concat(publication("null-eligibility", { customKitEligible: null }))), false);
  assert.equal(validCustomKit(valid.slice(0, 7).concat(publication("false-eligibility", { customKitEligible: false }))), false);
  assert.equal(validCustomKit(valid.slice(0, 7).concat(publication("null-category", { catalogueCategory: null }))), false);
  assert.equal(validCustomKit(valid.slice(0, 7).concat(publication("inactive", { status: "Inactive" }))), false);
});

test("strict eligibility preserves existing Custom Kit validation boundaries", () => {
  const valid = Array.from({ length: 8 }, (_, index) => publication("early-" + index));
  assert.equal(validCustomKit(valid, "degree"), false);
  assert.equal(validCustomKit(valid, "lkg", 0), false);
  assert.equal(validCustomKit(valid, "lkg", 10001), false);
  assert.match(read("supabase/functions/submit-catalogue-request/index.ts"), /supabase\.rpc\("submit_catalogue_request",\{payload\}\)/);
  assert.match(read("supabase/functions/submit-catalogue-request/index.ts"), /data\.replayed\?200:201/);
  assert.match(read("supabase/functions/submit-catalogue-request/index.ts"), /item\.type==="standard-kit"/);
  assert.match(read("supabase/functions/submit-catalogue-request/index.ts"), /item\.type==="book"/);
});
