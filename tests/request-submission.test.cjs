const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createBrowserSandbox, createStorage, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");
const { clonePublications } = require("./fixtures/publications.cjs");

function submissionWithState(order, details = {}, legacyDetails = null, options = {}) {
  const storage = createStorage({
    cambridgeOrder: JSON.stringify(order),
    ...(legacyDetails === null ? {} : { cambridgeRequestDetails: JSON.stringify(legacyDetails) })
  });
  const sessionStorage = createStorage({ cambridgeRequestDetails: JSON.stringify(details) });
  const sandbox = createBrowserSandbox({ localStorage: storage, sessionStorage, fetch: options.fetch });
  if (options.config !== null) sandbox.window.CPC_CATALOGUE_CONFIG = { supabaseUrl: options.supabaseUrl || "https://ysaxagxortpxyifyaydx.supabase.co", turnstileSiteKey: options.turnstileSiteKey === undefined ? "test-sitekey" : options.turnstileSiteKey };
  sandbox.window.CAMBRIDGE_CATALOGUE = clonePublications();
  loadBrowserScript(sandbox, "js/request-submission.js");
  return { submission: sandbox.window.CambridgeRequestSubmission, localStorage: storage, sessionStorage };
}

test("builds the current request payload from canonical catalogue information", () => {
  const book = clonePublications()[4];
  const { submission } = submissionWithState([{ ...book, title: "Stale browser title", quantity: 2 }], {
    contactName: "Synthetic Test User",
    mobile: "0000000000",
    email: "test@example.invalid",
    whatsappSameAsMobile: true,
    preferredContact: "call"
  });
  const payload = submission.buildPayload();
  assert.equal(payload.items.length, 1);
  assert.equal(payload.items[0].type, "book");
  assert.equal(payload.items[0].publicationId, book.id);
  assert.equal(payload.items[0].quantity, 2);
  assert.equal(payload.customer.whatsapp, "0000000000");
});

test("builds a custom-kit-shaped backend payload supported by the current request module", () => {
  const books = clonePublications().slice(1, 3);
  const { submission } = submissionWithState([{
    id: "KIT-SYNTHETIC",
    type: "custom-kit",
    title: "Synthetic LKG Kit",
    kitName: "My Starter Kit",
    class: ["LKG"],
    level: "lkg",
    quantity: 1,
    books
  }]);
  const payload = submission.buildBackendPayload();
  assert.equal(payload.items[0].type, "custom-kit");
  assert.equal(payload.items[0].publicationIds.length, 2);
  assert.equal(payload.items[0].level, "lkg");
  assert.equal(payload.items[0].kitName, "My Starter Kit");
});

test("preserves a CPC-controlled Standard Kit and its constituent titles in request payloads", () => {
  const books = clonePublications().slice(1, 3);
  const { submission } = submissionWithState([{ id: "STANDARD-NURSERY", type: "standard-kit", title: "Cambridge Nursery Standard Kit", class: ["Nursery"], level: "nursery", quantity: 1, books }]);
  const payload = submission.buildPayload();
  assert.equal(payload.items[0].type, "standard-kit");
  assert.equal(payload.items[0].publicationIds.length, 2);
  assert.equal(submission.buildBackendPayload().items[0].type, "standard-kit");
});

test("keeps one idempotency key across retry payloads and clears it after success", () => {
  const book = clonePublications()[0], { submission } = submissionWithState([{ ...book, quantity: 1 }]);
  const first = submission.buildBackendPayload().idempotencyKey;
  assert.equal(submission.buildBackendPayload().idempotencyKey, first);
  submission.clearSubmittedDraft();
  assert.notEqual(submission.attemptKey(), first);
});

test("rejects a missing selection before constructing a request", () => {
  const { submission } = submissionWithState([]);
  assert.throws(() => submission.buildPayload(), /no selected items/i);
  assert.throws(() => submission.buildBackendPayload(), /no selected items/i);
});

test("rejects invalid request quantities", () => {
  const book = clonePublications()[0];
  const { submission } = submissionWithState([{ ...book, quantity: 0 }]);
  assert.throws(() => submission.buildPayload(), /invalid request quantity/i);
  assert.throws(() => submission.buildBackendPayload(), /invalid request quantity/i);
});

test("rejects malformed Kit state before it reaches the trusted boundary", () => {
  const { submission } = submissionWithState([{ type: "custom-kit", level: "nursery", quantity: 1, books: [{ title: "No ID" }] }]);
  assert.throws(() => submission.buildPayload(), /catalogue ID/i);
});

test("rejects static fallback IDs while allowing canonical Supabase UUIDs", () => {
  const details = { contactName: "Synthetic Test User", mobile: "9000000000", city: "Bengaluru", customerType: "individual", existingCustomer: "Not sure" };
  const { submission: staticSubmission } = submissionWithState([{ id: "el-abc-book", quantity: 1 }], details);
  assert.throws(() => staticSubmission.buildBackendPayload(), /Supabase catalogue/i);
  const { submission: supabaseSubmission } = submissionWithState([{ ...clonePublications()[0], quantity: 1 }], details);
  assert.match(supabaseSubmission.buildBackendPayload().items[0].publicationId, /^[0-9a-f-]{36}$/i);
});

test("uses top-level notes only in the hardened DTO", () => {
  const { submission } = submissionWithState([{ ...clonePublications()[0], quantity: 1 }], { contactName: "Synthetic Test User", mobile: "9000000000", city: "Bengaluru", customerType: "individual", existingCustomer: "Not sure", notes: "Call after school." });
  const payload = submission.buildBackendPayload();
  assert.equal(payload.notes, "Call after school.");
  assert.equal(Object.hasOwn(payload.customer, "notes"), false);
});

test("uses a session-only contact draft and clears both current and legacy contact data after success", () => {
  const book = clonePublications()[0], details = { contactName: "Synthetic Test User", mobile: "9000000000", city: "Bengaluru", customerType: "individual", existingCustomer: "Not sure" };
  const { submission, localStorage, sessionStorage } = submissionWithState([{ ...book, quantity: 1 }], details, { contactName: "Legacy Visitor" });
  assert.equal(submission.buildPayload().customer.contactName, "Synthetic Test User");
  assert.match(localStorage.getItem("cambridgeRequestDetails"), /Legacy Visitor/);
  submission.clearSubmittedDraft();
  assert.equal(sessionStorage.getItem("cambridgeRequestDetails"), null);
  assert.equal(localStorage.getItem("cambridgeRequestDetails"), null);
  assert.equal(sessionStorage.getItem("cpcRequirementAttemptKey"), null);
});

test("submits through the configured Supabase project endpoint", async () => {
  const book = clonePublications()[0], details = { contactName: "Synthetic Test User", mobile: "9000000000", city: "Bengaluru", customerType: "individual", existingCustomer: "Not sure" };
  let url = "", headers;
  const { submission } = submissionWithState([{ ...book, quantity: 1 }], details, null, { fetch: async (value, init) => { url = value; headers = init.headers; return { ok: true, json: async () => ({ ok: true, reference: "CPC-TEST" }) }; } });
  submission.setTurnstileToken("synthetic-turnstile-token");
  await submission.submitLive();
  assert.equal(url, "https://ysaxagxortpxyifyaydx.supabase.co/functions/v1/submit-catalogue-request");
  assert.equal(headers["X-Turnstile-Token"], "synthetic-turnstile-token");
});

test("refuses to submit when central Supabase configuration is absent or invalid", async () => {
  const book = clonePublications()[0], details = { contactName: "Synthetic Test User", mobile: "9000000000", city: "Bengaluru", customerType: "individual", existingCustomer: "Not sure" };
  let calls = 0;
  const { submission } = submissionWithState([{ ...book, quantity: 1 }], details, null, { config: null, fetch: async () => { calls += 1; } });
  await assert.rejects(submission.submitLive(), /configuration is unavailable/i);
  assert.equal(calls, 0);
  const invalid = submissionWithState([{ ...book, quantity: 1 }], details, null, { supabaseUrl: "http://localhost:54321" });
  await assert.rejects(invalid.submission.submitLive(), /configuration is unavailable/i);
});

test("requires a configured, fresh Turnstile token before fetch", async () => {
  const book = clonePublications()[0], details = { contactName: "Synthetic Test User", mobile: "9000000000", city: "Bengaluru", customerType: "individual", existingCustomer: "Not sure" };
  let calls = 0;
  const missingKey = submissionWithState([{ ...book, quantity: 1 }], details, null, { turnstileSiteKey: "", fetch: async () => { calls += 1; } });
  await assert.rejects(missingKey.submission.submitLive(), /verification is unavailable/i);
  const missingToken = submissionWithState([{ ...book, quantity: 1 }], details, null, { fetch: async () => { calls += 1; } });
  await assert.rejects(missingToken.submission.submitLive(), /complete the verification challenge/i);
  assert.throws(() => missingToken.submission.setTurnstileToken("x".repeat(2049)), /verification challenge/i);
  assert.equal(calls, 0);
});

test("loads central Supabase configuration before request submission", () => {
  const review = fs.readFileSync(path.join(__dirname, "..", "review-request.html"), "utf8");
  assert.ok(review.indexOf('src="js/catalogue-pilot-config.js"') < review.indexOf('src="js/request-submission.js"'));
});
