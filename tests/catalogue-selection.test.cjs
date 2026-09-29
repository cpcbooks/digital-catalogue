const test = require("node:test");
const assert = require("node:assert/strict");
const { createBrowserSandbox, createStorage, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");
const { clonePublications } = require("./fixtures/publications.cjs");

function selectionWithStorage(storageData = {}) {
  const sandbox = createBrowserSandbox({ localStorage: createStorage(storageData) });
  loadBrowserScript(sandbox, "js/catalogue-selection.js");
  return { selection: sandbox.window.CambridgeSelection, storage: sandbox.localStorage };
}

test("returns an empty selection when storage is absent", () => {
  const { selection } = selectionWithStorage();
  assert.deepEqual(Array.from(selection.readOrder()), []);
  assert.equal(selection.selectedCount(), 0);
});

test("recovers safely from corrupt selection storage", () => {
  const { selection } = selectionWithStorage({ cambridgeOrder: "not-json" });
  assert.deepEqual(Array.from(selection.readOrder()), []);
});

test("adds a publication once and keeps duplicate add operations idempotent", () => {
  const { selection } = selectionWithStorage();
  const book = clonePublications()[1];
  assert.equal(selection.add(book), true);
  assert.equal(selection.add(book), true);
  assert.equal(selection.selectedCount(), 1);
  assert.equal(selection.selectedQuantityTotal(), 1);
});

test("updates a quantity and removes the item when set to zero", () => {
  const { selection } = selectionWithStorage();
  const book = clonePublications()[2];
  selection.add(book);
  assert.equal(selection.setQty(book, 4), true);
  assert.equal(selection.selectedItem(book).quantity, 4);
  assert.equal(selection.setQty(book, 0), true);
  assert.equal(selection.selectedItem(book), null);
});

test("caps excessive quantities and rejects non-numeric quantities", () => {
  const { selection } = selectionWithStorage();
  const book = clonePublications()[4];
  assert.equal(selection.setQty(book, 10001), true);
  assert.equal(selection.selectedItem(book).quantity, selection.MAX_QUANTITY);
  assert.equal(selection.setQty(book, "not-a-number"), false);
});
