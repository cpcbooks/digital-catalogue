const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const edge = fs.readFileSync(path.join(root, "supabase", "functions", "submit-catalogue-request", "index.ts"), "utf8");

test("rejects direct Edge submissions without a server-verified Turnstile token before the RPC", () => {
  assert.match(edge, /Access-Control-Allow-Headers[^\n]*x-turnstile-token/);
  assert.match(edge, /if\(!token\|\|token!==token\.trim\(\)\|\|token\.length>MAX_TURNSTILE_TOKEN\)return "invalid"/);
  assert.match(edge, /const challenge=await verifyTurnstile\(req\.headers\.get\("x-turnstile-token"\),key\)/);
  assert.ok(edge.indexOf("const challenge=await verifyTurnstile") < edge.indexOf("supabase.rpc"));
});

test("uses Siteverify with bounded timeout and verifies the fixed action and configured hostname", () => {
  assert.match(edge, /https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/siteverify/);
  assert.match(edge, /TURNSTILE_SECRET/);
  assert.match(edge, /TURNSTILE_EXPECTED_HOSTNAME/);
  assert.match(edge, /AbortSignal\.timeout\(TURNSTILE_TIMEOUT_MS\)/);
  assert.match(edge, /result\.hostname===hostname&&result\.action===TURNSTILE_ACTION/);
  assert.doesNotMatch(edge, /remoteip/);
});

test("renders an explicit challenge immediately above the disabled send action and identifies its privacy purpose", () => {
  const review = fs.readFileSync(path.join(root, "review-request.html"), "utf8");
  const privacy = fs.readFileSync(path.join(root, "privacy.html"), "utf8");
  assert.match(review, /id="turnstileWidget"/);
  assert.match(review, /id="sendRequestButton" disabled/);
  assert.match(review, /action:"send-requirement"/);
  assert.match(review, /turnstile\.reset/);
  assert.match(review, /challenges\.cloudflare\.com\/turnstile\/v0\/api\.js/);
  assert.match(privacy, /Draft for owner\/legal review:/);
  assert.match(privacy, /Cloudflare Turnstile/);
});
