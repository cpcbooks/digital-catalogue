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

function detailsSelectionReturn(search, savedBookReturn, backHref = "index.html", addCurrent = false, preselected = false, edit = null) {
  const book = { id: "book", title: "Book", quantity: typeof preselected === "number" ? preselected : 1 };
  const sandbox = createBrowserSandbox({
    sessionStorage: createStorage(savedBookReturn ? { cambridgeBookReturn: JSON.stringify(savedBookReturn) } : {}),
    localStorage: createStorage(preselected ? { cambridgeOrder: JSON.stringify([book]) } : {}),
    location: {
      href: `https://catalogue.example.test/book-details${search}`,
      pathname: "/book-details",
      search
    }
  });
  sandbox.window.document.getElementById = id => id === "back" ? { getAttribute() { return backHref; } } : null;
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
  const script = require("node:fs").readFileSync(require("node:path").join(__dirname, "..", "js", "catalogue-selection.js"), "utf8")
    .replace("  window.CambridgeSelection = Object.freeze({", "  window.__selectionTest={openSelection,bookDetailsSelectionReturn};\n  window.CambridgeSelection = Object.freeze({");
  require("node:vm").runInContext(script, sandbox.context);
  if (addCurrent) sandbox.window.CambridgeSelection.add(book);
  if (edit) edit(sandbox.window.CambridgeSelection, book);
  sandbox.window.__selectionTest.openSelection();
  return JSON.parse(sandbox.sessionStorage.getItem("cambridgeChecklistReturn"));
}

function listingSelectionAfterAdd() {
  const sandbox = createBrowserSandbox({ location: {
    href: "https://catalogue.example.test/college-books?stage=2nd-puc&catalogueSource=supabase",
    pathname: "/college-books",
    search: "?stage=2nd-puc&catalogueSource=supabase"
  } });
  const elements = [];
  sandbox.window.addEventListener = () => {};
  sandbox.window.document.createElement = tag => {
    const node = { tag, children: [], classList: { add() {}, remove() {} }, appendChild(child) { this.children.push(child); }, append(...children) { this.children.push(...children); }, setAttribute() {}, addEventListener() {} };
    elements.push(node);
    return node;
  };
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
  const script = require("node:fs").readFileSync(require("node:path").join(__dirname, "..", "js", "catalogue-selection.js"), "utf8")
    .replace("  window.CambridgeSelection = Object.freeze({", "  window.__selectionTest={openSelection};\n  window.CambridgeSelection = Object.freeze({");
  require("node:vm").runInContext(script, sandbox.context);
  const book = clonePublications()[1];
  sandbox.window.CambridgeSelection.actionNode(book);
  elements.find(element => element.className === "add-book").onclick();
  sandbox.window.__selectionTest.openSelection();
  return {
    checklist: JSON.parse(sandbox.sessionStorage.getItem("cambridgeChecklistReturn")),
    bookReturn: JSON.parse(sandbox.sessionStorage.getItem("cambridgeBookReturn"))
  };
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

test("generic listing Details links retain their listing origin", () => {
  const sandbox = createBrowserSandbox({ location: {
    href: "https://catalogue.example.test/early-learning-books?level=lkg&catalogueSource=supabase",
    pathname: "/early-learning-books",
    search: "?level=lkg&catalogueSource=supabase"
  } });
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
  loadBrowserScript(sandbox, "js/catalogue-selection.js");
  const book = clonePublications()[1];
  assert.equal(
    sandbox.window.CambridgeSelection.detailsUrl(book),
    `book-details.html#cpc-route=id%3D${encodeURIComponent(book.id)}%26returnTo%3D%252Fearly-learning-books%253Flevel%253Dlkg%2526catalogueSource%253Dsupabase%26catalogueSource%3Dsupabase`
  );
});

test("Book Details returns to itself until the current publication is added", () => {
  const now = Date.now();
  const explicit = detailsSelectionReturn(
    "?id=book&returnTo=browse%3Fq%3DLBA%26catalogueSource%3Dsupabase&catalogueSource=supabase",
    { url: "/early-learning-books?level=lkg", bookId: "book", createdAt: now }
  );
  assert.equal(explicit.url, "/book-details?id=book&returnTo=browse%3Fq%3DLBA%26catalogueSource%3Dsupabase&catalogueSource=supabase");
  assert.equal(explicit.useHistory, false);

  const preselected = detailsSelectionReturn(
    "?id=book&catalogueSource=supabase",
    { url: "/early-learning-books?level=lkg&catalogueSource=supabase", bookId: "book", createdAt: now }
    , "index.html", false, true
  );
  assert.equal(preselected.url, "/book-details?id=book&catalogueSource=supabase");
  assert.equal(preselected.bookId, undefined);

  const direct = detailsSelectionReturn("?id=book&catalogueSource=supabase", null, "school-books?class=5");
  assert.equal(direct.url, "/book-details?id=book&catalogueSource=supabase");
});

test("a current Details add returns to its matching listing origin", () => {
  const saved = detailsSelectionReturn(
    "?id=book&returnTo=browse%3Fq%3DLBA%26catalogueSource%3Dsupabase&catalogueSource=supabase",
    { url: "/browse?q=LBA&catalogueSource=supabase", bookId: "book", createdAt: Date.now() },
    "index.html", true
  );
  assert.equal(saved.url, "browse#cpc-route=q%3DLBA%26catalogueSource%3Dsupabase");
  assert.equal(saved.bookId, "book");
});

test("a listing Add to Selection arms its matching origin for direct scroll restoration", () => {
  const saved = listingSelectionAfterAdd();
  assert.equal(saved.checklist.useHistory, false);
  assert.equal(saved.checklist.bookId, "10000000-0000-4000-8000-000000000002");
  assert.equal(saved.checklist.url, "college-books#cpc-route=stage%3D2nd-puc%26catalogueSource%3Dsupabase");
  assert.equal(saved.bookReturn.bookId, saved.checklist.bookId);
});

test("successful current Details quantity changes return to the matching listing", () => {
  const origin = { url: "/browse?q=LBA&catalogueSource=supabase", bookId: "book", createdAt: Date.now() };
  const increment = detailsSelectionReturn("?id=book&returnTo=browse%3Fq%3DLBA%26catalogueSource%3Dsupabase&catalogueSource=supabase", origin, "index.html", false, true, (selection, book) => selection.setQty(book, 2));
  assert.equal(increment.url, "browse#cpc-route=q%3DLBA%26catalogueSource%3Dsupabase");
  assert.equal(increment.bookId, "book");

  const decrement = detailsSelectionReturn("?id=book&returnTo=browse%3Fq%3DLBA%26catalogueSource%3Dsupabase&catalogueSource=supabase", origin, "index.html", false, 2, (selection, book) => selection.setQty(book, 1));
  assert.equal(decrement.url, "browse#cpc-route=q%3DLBA%26catalogueSource%3Dsupabase");

  const removal = detailsSelectionReturn("?id=book&returnTo=browse%3Fq%3DLBA%26catalogueSource%3Dsupabase&catalogueSource=supabase", origin, "index.html", false, true, (selection, book) => selection.remove(book));
  assert.equal(removal.url, "browse#cpc-route=q%3DLBA%26catalogueSource%3Dsupabase");
});

test("no-op or failed current Details quantity changes stay on Details", () => {
  const origin = { url: "/browse?q=LBA&catalogueSource=supabase", bookId: "book", createdAt: Date.now() };
  const noOp = detailsSelectionReturn("?id=book&catalogueSource=supabase", origin, "index.html", false, true, (selection, book) => selection.setQty(book, 1));
  assert.equal(noOp.url, "/book-details?id=book&catalogueSource=supabase");

  const failed = detailsSelectionReturn("?id=book&catalogueSource=supabase", origin, "index.html", false, true, (selection, book) => selection.setQty(book, "not-a-number"));
  assert.equal(failed.url, "/book-details?id=book&catalogueSource=supabase");

  const unrelated = detailsSelectionReturn("?id=book&catalogueSource=supabase", origin, "index.html", false, true, selection => selection.add({ id: "other", title: "Other" }));
  assert.equal(unrelated.url, "/book-details?id=book&catalogueSource=supabase");
});

test("a direct Details edit uses the safe category fallback", () => {
  const saved = detailsSelectionReturn("?id=book&catalogueSource=supabase", null, "school-books?class=5", true);
  assert.equal(saved.url, "school-books#cpc-route=class%3D5%26catalogueSource%3Dsupabase");
  assert.equal(saved.bookId, undefined);
});

test("a stale Book Details origin cannot override the current add journey", () => {
  const saved = detailsSelectionReturn(
    "?id=book&catalogueSource=supabase",
    { url: "/early-learning-books?level=lkg&catalogueSource=supabase", bookId: "other", createdAt: Date.now() },
    "school-books?class=5", true
  );
  assert.equal(saved.url, "school-books#cpc-route=class%3D5%26catalogueSource%3Dsupabase");
  assert.equal(saved.bookId, undefined);
});

test("Book-return scroll waits for listing content to render", () => {
  const saved = { url: "/early-learning-books?level=lkg", bookId: "book", y: 420, createdAt: Date.now() };
  const calls = [];
  const sandbox = createBrowserSandbox({
    sessionStorage: createStorage({ cambridgeBookReturn: JSON.stringify(saved) }),
    location: { href: "https://catalogue.example.test/early-learning-books?level=lkg", pathname: "/early-learning-books", search: "?level=lkg" },
    performance: { getEntriesByType() { return [{ type: "back_forward" }]; } },
    scrollTo(_, y) { calls.push(y); }
  });
  const listing = { children: [] };
  sandbox.window.document.getElementById = id => id === "list" ? listing : null;
  sandbox.window.document.createElement = () => ({ dataset: {}, style: {}, classList: { add() {}, remove() {} }, appendChild() {}, append() {}, querySelector() { return null; }, setAttribute() {}, addEventListener() {} });
  loadBrowserScript(sandbox, "js/catalogue-selection.js");
  sandbox.window.CambridgeSelection.updateBar();
  assert.deepEqual(calls, []);
  assert.ok(sandbox.sessionStorage.getItem("cambridgeBookReturn"));
  listing.children.push({});
  sandbox.window.CambridgeSelection.updateBar();
  assert.deepEqual(calls, [420]);
  assert.equal(sandbox.sessionStorage.getItem("cambridgeBookReturn"), null);
});

test("Browse book returns restore after browse results render", () => {
  const saved = { url: "/browse?q=LBA&catalogueSource=supabase", bookId: "book", y: 420, createdAt: Date.now() };
  const calls = [];
  const sandbox = createBrowserSandbox({
    sessionStorage: createStorage({ cambridgeBookReturn: JSON.stringify(saved) }),
    location: { href: "https://catalogue.example.test/browse?q=LBA&catalogueSource=supabase", pathname: "/browse", search: "?q=LBA&catalogueSource=supabase" },
    performance: { getEntriesByType() { return [{ type: "back_forward" }]; } },
    scrollTo(_, y) { calls.push(y); }
  });
  const results = { children: [] };
  sandbox.window.document.getElementById = id => id === "browseResults" ? results : null;
  sandbox.window.document.createElement = () => ({ dataset: {}, style: {}, classList: { add() {}, remove() {} }, appendChild() {}, append() {}, querySelector() { return null; }, setAttribute() {}, addEventListener() {} });
  loadBrowserScript(sandbox, "js/catalogue-selection.js");
  sandbox.window.CambridgeSelection.rememberBookReturn("book");
  assert.equal(JSON.parse(sandbox.sessionStorage.getItem("cambridgeBookReturn")).bookId, "book");
  sandbox.sessionStorage.setItem("cambridgeBookReturn", JSON.stringify(saved));
  sandbox.window.CambridgeSelection.updateBar();
  assert.deepEqual(calls, []);
  results.children.push({});
  sandbox.window.CambridgeSelection.updateBar();
  assert.deepEqual(calls, [420]);
});

test("direct Selection return restores an explicitly armed book origin once", () => {
  const saved = { url: "/browse?q=LBA", bookId: "book", y: 320, createdAt: Date.now(), directReturn: true };
  const calls = [];
  const sandbox = createBrowserSandbox({
    sessionStorage: createStorage({ cambridgeBookReturn: JSON.stringify(saved) }),
    location: { href: "https://catalogue.example.test/browse?q=LBA", pathname: "/browse", search: "?q=LBA" },
    scrollTo(_, y) { calls.push(y); }
  });
  const listing = { children: [{}] };
  sandbox.window.document.getElementById = id => id === "browseResults" ? listing : null;
  sandbox.window.document.createElement = () => ({ dataset: {}, style: {}, classList: { add() {}, remove() {} }, appendChild() {}, append() {}, querySelector() { return null; }, setAttribute() {}, addEventListener() {} });
  loadBrowserScript(sandbox, "js/catalogue-selection.js");
  sandbox.window.CambridgeSelection.updateBar();
  assert.deepEqual(calls, [320]);
  assert.equal(sandbox.sessionStorage.getItem("cambridgeBookReturn"), null);
});

test("College and Competitive restore an armed return after their results render", () => {
  const saved = { url: "/college-books?stage=2nd-puc", bookId: "book", y: 280, createdAt: Date.now(), directReturn: true };
  const calls = [];
  const sandbox = createBrowserSandbox({
    sessionStorage: createStorage({ cambridgeBookReturn: JSON.stringify(saved) }),
    location: { href: "https://catalogue.example.test/college-books?stage=2nd-puc", pathname: "/college-books", search: "?stage=2nd-puc" },
    scrollTo(_, y) { calls.push(y); }
  });
  const results = { children: [] };
  sandbox.window.document.getElementById = id => id === "results" ? results : null;
  sandbox.window.document.createElement = () => ({ dataset: {}, style: {}, classList: { add() {}, remove() {} }, appendChild() {}, append() {}, querySelector() { return null; }, setAttribute() {}, addEventListener() {} });
  loadBrowserScript(sandbox, "js/catalogue-selection.js");
  sandbox.window.CambridgeSelection.updateBar();
  assert.deepEqual(calls, []);
  results.children.push({});
  sandbox.window.CambridgeSelection.updateBar();
  assert.deepEqual(calls, [280]);
  assert.equal(sandbox.sessionStorage.getItem("cambridgeBookReturn"), null);
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
