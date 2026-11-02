const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const first = "11111111-1111-4111-8111-111111111111", second = "22222222-2222-4222-8222-222222222222", attempt = "33333333-3333-4333-8333-333333333333";

function storage(seed = {}) { const values = new Map(Object.entries(seed)); return { getItem: key => values.has(key) ? values.get(key) : null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key), dump: () => Object.fromEntries(values) }; }
function submission(fetch) {
  const order = JSON.stringify([{ type: "custom-kit", level: "nursery", kitName: "Nursery", books: [{ id: first }], quantity: 1 }, { type: "standard-kit", level: "lkg", books: [{ id: second }], quantity: 2 }]);
  const details = JSON.stringify({ customerType: "school", contactName: "Test Contact", organisationName: "Test School", mobile: "9876543210", whatsappSameAsMobile: true, city: "Bengaluru", state: "Karnataka", preferredContact: "call", existingCustomer: "Not sure" });
  const localStorage = storage({ cambridgeOrder: order }), sessionStorage = storage({ cambridgeRequestDetails: details });
  const window = { CPC_CATALOGUE_CONFIG: { supabaseUrl: "https://example.supabase.co" }, crypto: { randomUUID: () => attempt } };
  vm.runInNewContext(read("js/request-submission.js"), { window, localStorage, sessionStorage, fetch, URL, JSON, String, Number, Array, Object, Set, Map, Math, Boolean, RegExp, Error, Promise });
  return { api: window.CambridgeRequestSubmission, localStorage, sessionStorage };
}

async function rejected(api) { try { await api.submitLive(); assert.fail("Expected submission to reject"); } catch (error) { return error.message; } }

test("submission errors preserve drafts and reuse the idempotency key", async () => {
  const requests = [];
  const module = submission(async (_url, options) => { requests.push(options); throw new Error("network unavailable"); });
  const before = { local: module.localStorage.dump(), session: module.sessionStorage.dump() };
  assert.equal(await rejected(module.api), "Unable to connect. Please check your internet connection and try again. Your selection has been saved.");
  const afterFirst = { local: module.localStorage.dump(), session: module.sessionStorage.dump() };
  await rejected(module.api);
  assert.deepEqual(afterFirst.local, before.local);
  assert.equal(afterFirst.session.cambridgeRequestDetails, before.session.cambridgeRequestDetails);
  assert.equal(afterFirst.session.cpcRequirementAttemptKey, attempt);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].headers["Idempotency-Key"], attempt);
  assert.equal(requests[1].headers["Idempotency-Key"], attempt);
  assert.deepEqual(JSON.parse(requests[0].body).items.map(item => item.type), ["custom-kit", "standard-kit"]);
});

test("429 response shows Retry-After minutes without clearing stored data", async () => {
  const module = submission(async () => ({ status: 429, ok: false, headers: { get: key => key === "Retry-After" ? "600" : null }, json: async () => ({ ok: false, error: "Too many new requirements from this network. Please try again later." }) }));
  const before = { local: module.localStorage.dump(), session: module.sessionStorage.dump() };
  assert.equal(await rejected(module.api), "Too many new requirements from this network. Please try again in 10 minutes. Your selection has been saved.");
  assert.deepEqual(module.localStorage.dump(), before.local);
  assert.equal(module.sessionStorage.dump().cambridgeRequestDetails, before.session.cambridgeRequestDetails);
  assert.equal(module.sessionStorage.dump().cpcRequirementAttemptKey, attempt);
});

test("429 without a valid Retry-After value uses generic retry guidance", async () => {
  const module = submission(async () => ({ status: 429, ok: false, headers: { get: () => "not-a-number" }, json: async () => ({ ok: false }) }));
  assert.equal(await rejected(module.api), "Too many new requirements from this network. Please try again later. Your selection has been saved.");
});

test("review submission ignores a second click while the first request is pending", async () => {
  const review = read("review-request.html"), script = review.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/)[1];
  const reviewPage = { innerHTML: "", addEventListener() {} }, button = { disabled: false, textContent: "Send Requirement →" }, status = { textContent: "" }, body = { classList: { add() {}, remove() {} } };
  let calls = 0, cleared = 0, resolve;
  const pending = new Promise(done => { resolve = done; });
  const document = { body, getElementById: id => ({ reviewPage, sendRequestButton: button, submissionStatus: status })[id] || null, querySelector() { return null; } };
  const window = { CambridgeCatalogueBootstrap: null, CambridgeRequestSubmission: { async submitLive() { calls += 1; return pending; }, clearSubmittedDraft() { cleared += 1; } } };
  const store = storage();
  const context = { window, document, localStorage: store, sessionStorage: store, navigator: {}, JSON, String, Number, Array, Object, Promise, Error, RegExp, Boolean };
  vm.runInNewContext(script, context);
  const firstClick = context.sendRequest(), secondClick = context.sendRequest();
  assert.equal(calls, 1);
  resolve({ reference: "CPC-TEST" });
  await Promise.all([firstClick, secondClick]);
  assert.equal(cleared, 1);
});
