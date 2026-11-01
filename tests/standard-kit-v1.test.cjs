const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const plain = value => JSON.parse(JSON.stringify(value));

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
}

function selectionModule(initial = {}) {
  const localStorage = storage(initial);
  let changes = 0;
  const document = { addEventListener() {}, getElementById() { return null; } };
  const window = {
    localStorage,
    location: { pathname: "/standard-kit.html", search: "" },
    addEventListener() {},
    dispatchEvent() { changes += 1; },
    matchMedia() { return { matches: false }; }
  };
  class CustomEvent { constructor(type) { this.type = type; } }
  vm.runInNewContext(read("js/catalogue-selection.js"), { window, document, localStorage, CustomEvent, URLSearchParams, Intl, JSON, String, Number, Array, Object, Set, Map, Math, Boolean, RegExp, Error, console });
  return { selection: window.CambridgeSelection, localStorage, changes: () => changes };
}

function kit(books = [{ id: "one" }, { id: "two" }]) {
  return { id: "STANDARD-lkg", type: "standard-kit", title: "LKG Standard Kit", level: "lkg", levelName: "LKG", books, bookCount: books.length };
}

test("Standard Kit additions merge complete sets, preserve drafts, and emit the shared change event", () => {
  const custom = { id: "custom-draft", type: "custom-kit", level: "lkg", books: [{ id: "draft-book" }], quantity: 1, kitName: "Draft" };
  const module = selectionModule({ cambridgeOrder: JSON.stringify([custom]) });
  assert.equal(module.selection.addStandardKit(kit()), true);
  assert.equal(module.selection.addStandardKit(kit()), true);
  const order = module.selection.readOrder();
  assert.equal(order.length, 2);
  assert.deepEqual(plain(order[0]), custom);
  assert.equal(order[1].quantity, 2);
  assert.deepEqual(order[1].books.map(book => book.id), ["one", "two"]);
  assert.deepEqual(plain(module.selection.floatingSelectionSummary()), { titles: 0, books: 0, kits: 2 });
  assert.equal(module.changes(), 2);
});

test("Standard Kit additions stop at the shared 10,000 quantity maximum", () => {
  const existing = { ...kit(), quantity: 9999 };
  const module = selectionModule({ cambridgeOrder: JSON.stringify([existing]) });
  assert.equal(module.selection.addStandardKit(kit()), true);
  assert.equal(module.selection.readOrder()[0].quantity, 10000);
  assert.equal(module.selection.addStandardKit(kit()), false);
  assert.equal(module.selection.readOrder().length, 1);
  assert.equal(module.selection.readOrder()[0].quantity, 10000);
});

test("Standard Kit additions consolidate compatible legacy duplicates", () => {
  const module = selectionModule({ cambridgeOrder: JSON.stringify([{ ...kit(), quantity: 2 }, { ...kit(), quantity: 3 }]) });
  assert.equal(module.selection.addStandardKit(kit()), true);
  assert.equal(module.selection.readOrder().length, 1);
  assert.equal(module.selection.readOrder()[0].quantity, 6);
});

test("Standard Kit identity never merges a changed or invalid composition", () => {
  const existing = { ...kit(), quantity: 3 };
  const module = selectionModule({ cambridgeOrder: JSON.stringify([existing]) });
  assert.equal(module.selection.addStandardKit(kit([{ id: "two" }, { id: "one" }])), false);
  assert.match(module.selection.standardKitAddMessage(), /changed since it was saved/);
  assert.equal(module.selection.addStandardKit(kit([{ id: "one" }, { id: "one" }])), false);
  assert.deepEqual(plain(module.selection.readOrder()), [existing]);
});

test("approved Standard Kit component counts remain 11, 8, 12, and 13", () => {
  const counts = { playgroup: 11, nursery: 8, lkg: 12, ukg: 13 };
  const definitions = Object.fromEntries(Object.entries(counts).map(([stageCode, count]) => [stageCode, { stageCode, enabled: true, publicationIds: Array.from({ length: count }, (_, index) => stageCode + "-" + index) }]));
  const window = {};
  vm.runInNewContext(read("js/standard-kit-config.js"), { window, Object, Array, String, Map, Number, Boolean });
  const provider = window.CambridgeStandardKitConfig.createProvider(definitions);
  Object.entries(counts).forEach(([stageCode, count]) => assert.equal(provider.get(stageCode).publicationIds.length, count));
});

test("Standard Kit configuration preserves component order and rejects missing or inactive publications", () => {
  const window = {};
  vm.runInNewContext(read("js/standard-kit-config.js"), { window, Object, Array, String, Map, Number, Boolean });
  const config = window.CambridgeStandardKitConfig;
  const definition = config.createProvider({ lkg: { stageCode: "lkg", displayName: "LKG", enabled: true, publicationIds: ["two", "one"] } }).get("lkg");
  assert.deepEqual(config.resolve(definition, [{ id: "one", active: true }, { id: "two", active: true }]).books.map(book => book.id), ["two", "one"]);
  assert.deepEqual(plain(config.resolve(definition, [{ id: "one", active: true }])), { available: false, reason: "unavailable", books: [], missingIds: ["two"] });
  assert.deepEqual(plain(config.resolve(definition, [{ id: "one", active: true }, { id: "two", active: false }])), { available: false, reason: "unavailable", books: [], missingIds: ["two"] });
});

test("Standard Kit request serialization retains component order and quantity", () => {
  const first = "11111111-1111-4111-8111-111111111111";
  const second = "22222222-2222-4222-8222-222222222222";
  const localStorage = storage({ cambridgeOrder: JSON.stringify([{ ...kit([{ id: second }, { id: first }]), quantity: 5 }]) });
  const sessionStorage = storage();
  const window = {};
  vm.runInNewContext(read("js/request-submission.js"), { window, localStorage, sessionStorage, JSON, String, Number, Array, Object, Set, Map, Math, Boolean, RegExp, Error });
  assert.deepEqual(plain(window.CambridgeRequestSubmission.buildPayload().items), [{ type: "standard-kit", level: "lkg", kitName: null, publicationIds: [second, first], quantity: 5 }]);
});

test("Standard Kit page uses the shared add operation and preserves the unconfigured state", () => {
  const source = read("js/standard-kit.js");
  assert.match(source, /Selection\.addStandardKit\(kit\)/);
  assert.match(source, /one copy of each title per kit/);
  assert.match(source, /standardKitAddMessage/);
  assert.doesNotMatch(source, /concat\(kit\)/);
  assert.match(source, /Standard Kit not configured/);
});

test("Standard Kit reuses the Early Learning hero and shared content layout", () => {
  const page = read("standard-kit.html");
  assert.match(page, /class="page-hero"/);
  assert.match(page, /class="hero-inner"/);
  assert.match(page, /class="kit-main"/);
  assert.match(page, /catalogue-section kit-content/);
  assert.match(page, /background:#f2f6fa/);
  const sourceLinks = read("js/catalogue-source-links.js");
  assert.match(sourceLinks, /early-learning\|standard-kit\|kit-/);
  assert.match(sourceLinks, /early-learning-books\|standard-kit\|kit-builder\|kit-review\|school-learning/);
  const source = read("js/standard-kit.js");
  assert.match(source, /heading\.textContent="Included Publications"/);
  assert.match(source, /document\.getElementById\("title"\)\.textContent=stages\[level\]\+" Standard Kit"/);
});

test("Custom Kit Review keeps shared mobile spacing and gives its desktop eyebrow the existing 8px rhythm", () => {
  const refinement = read("css/inner-pages-refinement.css");
  assert.match(refinement, /@media\(min-width:761px\)\{\.catalogue-inner-page \.review-hero\.page-hero \.catalogue-context-action\+\.eyebrow\{margin-top:8px\}\}/);
  assert.match(read("kit-review.html"), /<nav class="context-nav"[\s\S]*?<p class="eyebrow">[\s\S]*?<h1/);
});

test("Custom Kit pages receive the approved hero hierarchy without changing functional hooks", () => {
  const sourceLinks = read("js/catalogue-source-links.js");
  assert.match(sourceLinks, /\["\.kit-hero", "\.kit-wrap"\], \["\.review-hero", "\.review-wrap"\]/);
  assert.match(sourceLinks, /hero\.classList\.add\("page-hero"\)/);
  assert.match(sourceLinks, /inner\.classList\.add\("hero-inner"\)/);
  [["kit-builder.html", "kitBack", "pageTitle", "kitName", "catalogue", "reviewButton"], ["kit-review.html", "editNav", "pageTitle", "review"]].forEach(([file, ...ids]) => {
    const page = read(file);
    assert.match(page, /<nav class="context-nav"[\s\S]*?<p class="eyebrow">[\s\S]*?<h1/);
    assert.match(page, /<a href="index\.html">⌂ Home<\/a>[\s\S]*?<a[^>]+id="(?:kitBack|editNav)"/);
    ids.forEach(id => assert.match(page, new RegExp('id="' + id + '"')));
  });
});
