const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = path.resolve(__dirname, "..");
const migration = fs.readFileSync(path.join(root, "supabase", "migrations", "20261017100000_prepare_catalogue_request_rate_limit.sql"), "utf8");
const helperModule = pathToFileURL(path.join(root, "supabase", "functions", "submit-catalogue-request", "rate-limit-foundation.mjs")).href;

test("rate-limit migration stores only opaque fingerprints, idempotency keys, digests, and timestamps", () => {
  assert.match(migration, /create table if not exists private\.catalogue_request_rate_limit_attempts/);
  assert.match(migration, /fingerprint text not null check \(fingerprint ~ '\^\[0-9a-f\]\{64\}\$'\)/);
  assert.match(migration, /payload_digest text not null check \(payload_digest ~ '\^\[0-9a-f\]\{64\}\$'\)/);
  assert.match(migration, /expires_at = attempted_at \+ interval '24 hours'/);
  assert.doesNotMatch(migration, /\bip\b|forwarded|contact|customer|payload jsonb/i);
});

test("rate-limit claim serializes UUID retries and fingerprint windows", () => {
  assert.match(migration, /pg_advisory_xact_lock\(pg_catalog\.hashtextextended\(p_idempotency_key::text, 0\)\)/);
  assert.match(migration, /pg_advisory_xact_lock\(pg_catalog\.hashtextextended\(p_fingerprint, 0\)\)/);
  assert.match(migration, /v_attempt_count >= 8/);
  assert.match(migration, /a\.attempted_at >= v_now - interval '10 minutes'/);
  assert.match(migration, /return pg_catalog\.jsonb_build_object\('decision', 'limited'\)/);
});

test("rate-limit claim distinguishes retry from changed-payload UUID reuse", () => {
  assert.match(migration, /if v_existing_digest = p_payload_digest then[\s\S]*'retry'/);
  assert.match(migration, /'idempotency_payload_mismatch'/);
  assert.match(migration, /idempotency_key uuid not null unique/);
});

test("rate-limit cleanup is bounded and protected from public roles", () => {
  assert.match(migration, /p_batch_limit not between 1 and 1000/);
  assert.match(migration, /where a\.expires_at <= current_timestamp[\s\S]*order by a\.expires_at asc, a\.id asc[\s\S]*limit p_batch_limit[\s\S]*for update skip locked/);
  for (const signature of [
    "claim_catalogue_request_rate_limit(text, uuid, text)",
    "cleanup_catalogue_request_rate_limit_attempts(integer)"
  ]) {
    assert.match(migration, new RegExp(`revoke all on function public\\.${signature.replace(/[().]/g, "\\$&")} from public, anon, authenticated;`));
    assert.match(migration, new RegExp(`grant execute on function public\\.${signature.replace(/[().]/g, "\\$&")} to service_role;`));
  }
  assert.match(migration, /security definer\s+set search_path to ''/i);
});

test("Edge helper canonicalizes addresses, produces stable opaque HMACs, and fails closed", async () => {
  const helper = await import(helperModule);
  const secret = "synthetic-rate-limit-secret-at-least-32-bytes";
  assert.equal(helper.canonicalIp("001.002.003.004"), "1.2.3.4");
  assert.equal(helper.canonicalIp("2001:0db8:0:0:0:0:0:1"), "2001:db8::1");
  assert.equal(helper.canonicalIp("198.51.100.1, 203.0.113.2"), null);
  assert.equal(helper.canonicalIp("[2001:db8::1]"), null);
  assert.equal(await helper.fingerprintCanonicalIp(secret, "001.002.003.004"), await helper.fingerprintCanonicalIp(secret, "1.2.3.4"));
  await assert.rejects(helper.fingerprintCanonicalIp(secret, "198.51.100.1, 203.0.113.2"), /Canonical IP/);
  assert.deepEqual(helper.rateLimitDecision({ decision: "limited" }), { kind: "limited", status: 429, retryAfterSeconds: 600 });
  assert.deepEqual(helper.rateLimitDecision(null, new Error("storage unavailable")), { kind: "unavailable", status: 503 });
});

test("payload digests are key-order independent and reject changed payloads", async () => {
  const helper = await import(helperModule);
  const secret = "synthetic-rate-limit-secret-at-least-32-bytes";
  const first = await helper.digestValidatedPayload(secret, { items: ["a"], customer: { name: "Synthetic" } });
  const reordered = await helper.digestValidatedPayload(secret, { customer: { name: "Synthetic" }, items: ["a"] });
  const changed = await helper.digestValidatedPayload(secret, { customer: { name: "Synthetic" }, items: ["b"] });
  assert.equal(first, reordered);
  assert.notEqual(first, changed);
});
