const test = require("node:test");
const assert = require("node:assert/strict");
const { createBrowserSandbox, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");

function kit(minimum, completionEnabled) {
  const sandbox = createBrowserSandbox();
  loadBrowserScript(sandbox, "js/custom-kit-state.js");
  return sandbox.window.CambridgeCustomKitState.create({ minimum, completionEnabled });
}

function eligibleKit(minimum = 8) {
  const sandbox = createBrowserSandbox();
  loadBrowserScript(sandbox, "js/custom-kit-state.js");
  return sandbox.window.CambridgeCustomKitState.create({ minimum, isEligible: item => item.customKitEligible !== false });
}

test("starts as an incomplete but valid empty working kit", () => {
  const state = kit(8);
  assert.equal(state.count(), 0);
  assert.equal(state.remaining(), 8);
  assert.equal(state.isComplete(), false);
});

test("adds items once, reports membership, and removes them", () => {
  const state = kit(3);
  const book = { id: "kit-book-1", title: "Synthetic Book" };
  assert.equal(state.add(book), true);
  assert.equal(state.add(book), false);
  assert.equal(state.contains("kit-book-1"), true);
  assert.deepEqual(Array.from(state.selectedIds()), ["kit-book-1"]);
  assert.equal(state.selectedItems()[0].title, "Synthetic Book");
  assert.equal(state.remove(book), true);
  assert.equal(state.contains(book), false);
});

test("accepts eligible titles and rejects explicitly ineligible titles", () => {
  const state = eligibleKit();
  assert.equal(state.add({ id: "eligible" }), true);
  assert.equal(state.add({ id: "ineligible", customKitEligible: false }), false);
  assert.deepEqual(Array.from(state.selectedIds()), ["eligible"]);
});

test("keeps an incomplete kit as working state but prevents review", () => {
  const state = kit(8);
  state.add({ id: "one" });
  state.add({ id: "two" });
  assert.equal(state.count(), 2);
  assert.equal(state.remaining(), 6);
  assert.equal(state.isComplete(), false);
  assert.equal(state.canReview(), false);
});

test("keeps an unconfigured Kit non-reviewable", () => {
  const state = kit(null, false);
  assert.equal(state.canReview(), false);
  state.add({ id: "playgroup-book" });
  assert.equal(state.canReview(), false);
  assert.equal(state.isComplete(), false);
});

test("completes at and above the supplied minimum", () => {
  const state = kit(2);
  state.add({ id: "one" });
  assert.equal(state.isComplete(), false);
  state.add({ id: "two" });
  assert.equal(state.isComplete(), true);
  assert.equal(state.canReview(), true);
  state.add({ id: "three" });
  assert.equal(state.remaining(), 0);
  assert.equal(state.isComplete(), true);
});

test("becomes incomplete immediately when removal drops below its configured minimum", () => {
  const state = kit(2);
  state.add({ id: "one" });
  state.add({ id: "two" });
  assert.equal(state.isComplete(), true);
  state.remove("two");
  assert.equal(state.remaining(), 1);
  assert.equal(state.isComplete(), false);
});

test("uses the supplied minimum rather than a permanent eight-title rule", () => {
  const state = kit(4);
  for (const id of ["one", "two", "three", "four"]) state.add({ id });
  assert.equal(state.minimum, 4);
  assert.equal(state.isComplete(), true);
});

test("keeps an unconfigured minimum as incomplete working state", () => {
  const state = kit(null, false);
  state.add({ id: "playgroup-book" });
  assert.equal(state.minimum, null);
  assert.equal(state.completionEnabled, false);
  assert.equal(state.remaining(), null);
  assert.equal(state.isComplete(), false);
  assert.equal(state.count(), 1);
});

test("keeps an optional sanitized Kit name with the working state", () => {
  const state = kit(8);
  assert.equal(state.setName("  My   Nursery Kit  "), "My Nursery Kit");
  assert.equal(state.getName(), "My Nursery Kit");
  assert.equal(state.setName(""), "");
});
