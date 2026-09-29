const test = require("node:test");
const assert = require("node:assert/strict");
const { createBrowserSandbox, createStorage, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");
const { clonePublications } = require("./fixtures/publications.cjs");

function submissionWithState(order, details = {}) {
  const storage = createStorage({
    cambridgeOrder: JSON.stringify(order),
    cambridgeRequestDetails: JSON.stringify(details)
  });
  const sandbox = createBrowserSandbox({ localStorage: storage });
  sandbox.window.CAMBRIDGE_CATALOGUE = clonePublications();
  loadBrowserScript(sandbox, "js/request-submission.js");
  return sandbox.window.CambridgeRequestSubmission;
}

test("builds the current request payload from canonical catalogue information", () => {
  const book = clonePublications()[4];
  const submission = submissionWithState([{ ...book, title: "Stale browser title", quantity: 2 }], {
    contactName: "Synthetic Test User",
    mobile: "0000000000",
    email: "test@example.invalid",
    whatsappSameAsMobile: true,
    preferredContact: "call"
  });
  const payload = submission.buildPayload();
  assert.equal(payload.selection.lineCount, 1);
  assert.equal(payload.selection.totalCopiesOrSets, 2);
  assert.equal(payload.selection.lines[0].displayName, "Class Five Science");
  assert.equal(payload.selection.lines[0].quantity, 2);
  assert.equal(payload.customer.whatsapp, "0000000000");
});

test("builds a custom-kit-shaped backend payload supported by the current request module", () => {
  const books = clonePublications().slice(1, 3);
  const submission = submissionWithState([{
    id: "KIT-SYNTHETIC",
    type: "custom-kit",
    title: "Synthetic LKG Kit",
    class: ["LKG"],
    quantity: 1,
    books
  }]);
  const payload = submission.buildBackendPayload();
  assert.equal(payload.items[0].type, "custom-kit");
  assert.equal(payload.items[0].componentCount, undefined);
  assert.equal(payload.items[0].books.length, 2);
  assert.equal(payload.items[0].class, "LKG");
});

test("rejects a missing selection before constructing a request", () => {
  const submission = submissionWithState([]);
  assert.throws(() => submission.buildPayload(), /no selected items/i);
  assert.throws(() => submission.buildBackendPayload(), /no selected items/i);
});

test("rejects invalid request quantities", () => {
  const book = clonePublications()[0];
  const submission = submissionWithState([{ ...book, quantity: 0 }]);
  assert.throws(() => submission.buildPayload(), /invalid request quantity/i);
  assert.throws(() => submission.buildBackendPayload(), /invalid request quantity/i);
});
