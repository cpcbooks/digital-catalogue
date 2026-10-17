const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const migration = fs.readFileSync(path.join(root, "supabase", "migrations", "20261017000000_prepare_requirement_retention.sql"), "utf8");
const schema = fs.readFileSync(path.join(root, "docs", "05-database-schema.md"), "utf8");

test("retention migration prepares a server-controlled anchor without deleting existing requests", () => {
  assert.match(migration, /add column if not exists last_meaningful_business_interaction_at timestamptz/);
  assert.match(migration, /set last_meaningful_business_interaction_at = created_at/);
  assert.match(migration, /alter column last_meaningful_business_interaction_at set default current_timestamp/);
  assert.doesNotMatch(migration.slice(0, migration.indexOf("create or replace function public.preview_or_purge_catalogue_requests")), /delete\s+from\s+public\.requests/i);
});

test("retention controls only advance actual interactions and constrain legal holds", () => {
  assert.match(migration, /record_catalogue_request_interaction[\s\S]*greatest\(r\.last_meaningful_business_interaction_at, p_occurred_at\)/);
  assert.match(migration, /p_occurred_at >= r\.created_at/);
  assert.match(migration, /legal_hold_reason_code in \('legal', 'dispute', 'regulatory'\)/);
  assert.match(migration, /set_catalogue_request_legal_hold[\s\S]*if p_hold is null then[\s\S]*case when p_hold then p_reason_code else null end/);
});

test("retention preview and purge are bounded, held-request-safe, and delete only the documented cascade parent", () => {
  assert.match(migration, /p_batch_limit not between 1 and 1000/);
  assert.match(migration, /last_meaningful_business_interaction_at < current_timestamp - interval '12 months'/);
  assert.match(migration, /legal_hold = false/);
  assert.match(migration, /order by r\.last_meaningful_business_interaction_at asc, r\.id asc/);
  assert.match(migration, /limit p_batch_limit/);
  assert.match(migration, /delete from public\.requests as r[\s\S]*using candidates as c/);
  assert.match(migration, /return query select v_count, 0/);
  assert.match(schema, /REQUESTS \|\|--o\{ REQUEST_ITEMS[^\n]*delete cascade[\s\S]*REQUEST_ITEMS \|\|--o\{ REQUEST_KIT_COMPONENTS[^\n]*delete cascade/);
});

test("retention controls are not executable by public or service-role RPC callers", () => {
  for (const signature of [
    "record_catalogue_request_interaction(uuid, timestamptz)",
    "set_catalogue_request_legal_hold(uuid, boolean, text)",
    "preview_or_purge_catalogue_requests(integer, boolean)"
  ]) {
    assert.match(migration, new RegExp(`revoke all on function public\\.${signature.replace(/[().]/g, "\\$&")} from public, anon, authenticated, service_role;`));
  }
});

test("the trusted submission routine keeps idempotency and stops duplicating customer snapshots", () => {
  assert.match(migration, /perform pg_advisory_xact_lock\(hashtextextended\(payload->>'idempotencyKey',0\)\)/);
  assert.match(migration, /where r\.idempotency_key=\(payload->>'idempotencyKey'\)::uuid/);
  assert.match(migration, /customer_snapshot\)[\s\S]*'\{\}'::jsonb\)/);
  assert.doesNotMatch(migration, /jsonb_build_object\('customerType',v_customer/);
});
