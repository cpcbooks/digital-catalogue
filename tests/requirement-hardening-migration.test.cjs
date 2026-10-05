const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = file => fs.readFileSync(path.resolve(__dirname, "..", file), "utf8");
const migration = read("supabase/migrations/20261005000000_harden_requirement_submission.sql");
const hotfix = read("supabase/migrations/20261005170000_fix_requirement_rpc_json_location.sql");
const runtimeHotfix = read("supabase/migrations/20261005180000_fix_requirement_rpc_id_ambiguity.sql");
const edge = read("supabase/functions/submit-catalogue-request/index.ts");

test("explicitly secures Kit configuration tables and submission RPC execution", () => {
  for (const table of ["early_learning_kit_rules", "standard_kit_definitions", "standard_kit_publications"]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security;`));
  }
  assert.match(migration, /revoke all on table public\.early_learning_kit_rules, public\.standard_kit_definitions, public\.standard_kit_publications from public, anon, authenticated;/);
  assert.match(migration, /revoke all on function public\.submit_catalogue_request\(jsonb\) from public, anon, authenticated;/);
  assert.match(migration, /grant execute on function public\.submit_catalogue_request\(jsonb\) to service_role;/);
});

test("keeps nullable eligibility compatible and gives Custom Kits a truthful fallback", () => {
  assert.match(migration, /add column if not exists custom_kit_eligible boolean;/);
  assert.doesNotMatch(migration, /custom_kit_eligible boolean not null/i);
  assert.match(migration, /publication\.custom_kit_eligible is false/);
  assert.match(migration, /initcap\(level\)\|\|' Custom Kit'/);
});

test("requires an enabled exact Standard Kit definition", () => {
  assert.match(migration, /where stage_code=level and enabled/);
  assert.match(migration, /raise exception 'Standard Kit is unavailable'/);
  assert.match(migration, /configured_ids is null or configured_ids is distinct from ids/);
  assert.match(migration, /raise exception 'Standard Kit composition is invalid'/);
});

test("keeps one notes field and validates the public customer DTO", () => {
  assert.doesNotMatch(edge, /existingCambridgeCustomer","notes/);
  assert.match(edge, /customerTypes=new Set\(\["school","dealer","individual","other"\]\)/);
  assert.match(edge, /mobile=\/\^\[6-9\]\\d\{9\}\$\//);
  assert.match(edge, /customer\.preferredContact==="email"/);
  assert.match(edge, /customer\.preferredContact==="whatsapp"/);
  assert.match(edge, /existingCustomers=new Set\(\["Yes","No","Not sure"\]\)/);
});

test("subtracts location allow-listed keys from JSONB, not the location key text", () => {
  for (const source of [migration, hotfix, runtimeHotfix]) {
    assert.match(source, /\(\(customer->'location'\) - array\['city','district','state','pincode'\]\)/);
    assert.doesNotMatch(source, /customer->'location'\s*-\s*array/);
  }
});

test("does not shadow request or publication IDs with a PL/pgSQL loop variable", () => {
  for (const source of [migration, hotfix, runtimeHotfix]) {
    assert.doesNotMatch(source, /\bid text;/);
    assert.match(source, /select requests\.id,requests\.reference into request_id,reference/);
    assert.match(source, /publications\.id=\(item->>'publicationId'\)::uuid/);
    assert.match(source, /foreach publication_id_text in array ids loop/);
  }
});
