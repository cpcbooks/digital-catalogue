const test = require("node:test");
const assert = require("node:assert/strict");
const { createBrowserSandbox, createStorage, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");
const { clonePublications } = require("./fixtures/publications.cjs");

function selectionWithStorage(storageData = {}) {
  const sandbox = createBrowserSandbox({ localStorage: createStorage(storageData) });
  loadBrowserScript(sandbox, "js/catalogue-selection.js");
  return { selection: sandbox.window.CambridgeSelection, storage: sandbox.localStorage };
}

function interactiveSelection(search = "?catalogueSource=supabase") {
  const sandbox = createBrowserSandbox({ location: {
    href: `https://catalogue.example.test/book-details.html${search}`,
    pathname: "/book-details.html",
    search
  } });
  const elements = [];
  sandbox.window.document.createElement = tag => {
    const node = {
      tag,
      children: [],
      classList: { add() {}, remove() {} },
      appendChild(child) { this.children.push(child); },
      append(...children) { this.children.push(...children); },
      setAttribute() {},
      addEventListener() {}
    };
    elements.push(node);
    return node;
  };
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
  loadBrowserScript(sandbox, "js/catalogue-selection.js");
  return { selection: sandbox.window.CambridgeSelection, elements };
}

function rememberedChecklistReturn(pathname, search = "") {
  const sandbox = createBrowserSandbox({ location: {
    href: `https://catalogue.example.test${pathname}${search}`,
    pathname,
    search
  } });
  loadBrowserScript(sandbox, "js/catalogue-selection.js");
  sandbox.window.CambridgeSelection.rememberChecklistReturn();
  return JSON.parse(sandbox.sessionStorage.getItem("cambridgeChecklistReturn"));
}

function kitSelectionReturn(pathname, search = "", complete = false) {
  const sandbox = createBrowserSandbox({ location: {
    href: `https://catalogue.example.test${pathname}${search}`,
    pathname,
    search
  } });
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
  loadBrowserScript(sandbox, "js/catalogue-selection.js");
  sandbox.window.document.dispatchEvent({
    type: "click",
    target: {
      closest(selector) { return selector === ".complete-button, #content .kit-actions button" ? this : null; },
      classList: { contains(name) { return complete && name === "complete-button"; } }
    }
  });
  return JSON.parse(sandbox.sessionStorage.getItem("cambridgeChecklistReturn"));
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

test("builds browser selection controls without a Node global and preserves source", () => {
  const { selection, elements } = interactiveSelection();
  const book = clonePublications()[1];
  assert.equal(selection.detailsUrl(book), `book-details.html#cpc-route=id%3D${encodeURIComponent(book.id)}%26catalogueSource%3Dsupabase`);
  assert.doesNotThrow(() => selection.actionNode(book));
  const addButton = elements.find(element => element.className === "add-book");
  assert.ok(addButton);
  assert.equal(selection.add(book), true);
  assert.equal(selection.selectedItem(book).quantity, 1);
  assert.doesNotThrow(() => selection.actionNode(book));
  assert.equal(selection.remove(book), true);
  assert.equal(selection.selectedItem(book), null);
});

test("records Kit and publication Selection returns with their current context", () => {
  assert.deepEqual(
    rememberedChecklistReturn("/standard-kit.html", "?level=lkg&catalogueSource=supabase").url,
    "/standard-kit.html?level=lkg&catalogueSource=supabase"
  );
  assert.deepEqual(
    rememberedChecklistReturn("/standard-kit.html", "?level=lkg").url,
    "/standard-kit.html?level=lkg"
  );
  assert.deepEqual(
    rememberedChecklistReturn("/kit-review.html", "?level=lkg&catalogueSource=supabase").url,
    "/kit-review.html?level=lkg&catalogueSource=supabase"
  );
  assert.deepEqual(
    rememberedChecklistReturn("/browse.html", "?q=phonics").url,
    "/browse.html?q=phonics"
  );
  assert.deepEqual(
    rememberedChecklistReturn("/standard-kit", "?level=lkg&catalogueSource=supabase").url,
    "/standard-kit?level=lkg&catalogueSource=supabase"
  );
  assert.deepEqual(
    rememberedChecklistReturn("/kit-review", "?level=lkg&catalogueSource=supabase").url,
    "/kit-review?level=lkg&catalogueSource=supabase"
  );
  assert.equal(
    rememberedChecklistReturn("/early-learning-books", "?level=lkg&catalogueSource=supabase").url,
    "/early-learning-books?level=lkg&catalogueSource=supabase"
  );
  assert.equal(
    rememberedChecklistReturn("/school-books", "?class=5&catalogueSource=supabase").url,
    "/school-books?class=5&catalogueSource=supabase"
  );
  assert.equal(
    rememberedChecklistReturn("/exam-preparation", "?class=10&catalogueSource=supabase").url,
    "/exam-preparation?class=10&catalogueSource=supabase"
  );
});

test("captures Standard and Custom Kit Selection actions before their page redirects", () => {
  const supabaseStandard = kitSelectionReturn("/standard-kit", "?level=lkg&catalogueSource=supabase");
  assert.equal(supabaseStandard.url, "early-learning-level.html#cpc-route=level%3Dlkg%26catalogueSource%3Dsupabase");
  assert.equal(supabaseStandard.useHistory, false);
  assert.notEqual(supabaseStandard.url, "/standard-kit?level=lkg&catalogueSource=supabase");
  const staticStandard = kitSelectionReturn("/standard-kit", "?level=lkg");
  assert.equal(staticStandard.url, "early-learning-level.html?level=lkg");
  assert.equal(staticStandard.useHistory, false);
  const supabaseCustom = kitSelectionReturn("/kit-review", "?level=lkg&catalogueSource=supabase", true);
  assert.equal(supabaseCustom.url, "early-learning-level.html#cpc-route=level%3Dlkg%26catalogueSource%3Dsupabase");
  assert.equal(supabaseCustom.useHistory, false);
  const staticCustom = kitSelectionReturn("/kit-review", "?level=lkg", true);
  assert.equal(staticCustom.url, "early-learning-level.html?level=lkg");
  assert.equal(staticCustom.useHistory, false);
});
