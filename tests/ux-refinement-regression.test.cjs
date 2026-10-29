const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

function browserModule(file, catalogue) {
  const window = { CAMBRIDGE_CATALOGUE: catalogue || [] };
  vm.runInNewContext(read(file), { window, Object, Array, String, Number, Set, Map, Math, Boolean, RegExp, Error });
  return window;
}

test("exact SKU search avoids partial SKU matches while retaining normal text search", () => {
  const books = [
    { id: "one", sku: "CPC00111", title: "Numbers for Early Learning", class: ["LKG"] },
    { id: "two", sku: "CPC00252", title: "Wondera Reading", class: ["1"] }
  ];
  const query = browserModule("js/catalogue-query.js", books).CambridgeCatalogueQuery;
  assert.deepEqual(query.browseMatches(books, {}, "001"), []);
  assert.deepEqual(query.browseMatches(books, {}, "CPC00252").map(book => book.id), ["two"]);
  assert.deepEqual(query.browseMatches(books, {}, "Wondera").map(book => book.id), ["two"]);
});

test("all Early Learning Custom Kit stages use the configured eight-title threshold", () => {
  const window = browserModule("js/early-learning-kit-config.js");
  vm.runInNewContext(read("js/custom-kit-state.js"), { window, Object, Array, String, Number, Set, Map, Math, Boolean, Error });
  ["playgroup", "nursery", "lkg", "ukg"].forEach(stage => {
    const config = window.CambridgeEarlyLearningKitConfig.getStageConfig(stage);
    assert.equal(config.minimumDistinctTitles, 8);
    assert.equal(config.completionEnabled, true);
    const state = window.CambridgeCustomKitState.create({ minimum: config.minimumDistinctTitles, completionEnabled: config.completionEnabled });
    Array.from({ length: 7 }, (_, index) => state.add({ id: stage + index }));
    assert.equal(state.canReview(), false);
    state.add({ id: stage + "eight" });
    assert.equal(state.canReview(), true);
  });
});

test("refinement assets retain the original footer, direct exam route, and continuous kit grid", () => {
  const footer = read("js/catalogue-source-links.js");
  assert.match(footer, /function addPrivacyLink/);
  assert.match(footer, /footer-meta/);
  assert.doesNotMatch(footer, /footer-links/);
  assert.match(read("js/competitive-exams-refinement.js"), /browse\.html\?category=competitive-exams/);
  const kit = read("js/kit-builder-refinement.js");
  assert.match(kit, /Choose Books for Your/);
  assert.doesNotMatch(kit, /Additional Early Learning books/);
  const search = read("js/catalogue-search-suggestions.js");
  assert.match(search, /View All Matching Publications/);
  assert.match(search, /ArrowDown/);
  assert.match(search, /Escape/);
});

test("homepage retains landing and level routes while only Competitive Exams routes to its filtered listing", () => {
  const links = read("js/catalogue-source-links.js");
  assert.match(links, /function refineCompetitiveExamsLink/);
  assert.match(links, /browse\.html\?category=competitive-exams/);
  assert.doesNotMatch(links, /function refineHomeCategoryLinks/);
  assert.match(links, /location\.pathname\.endsWith\("\/competitive-exams\.html"\)/);
  assert.doesNotMatch(links, /document\.querySelector\("\.stage-hero \.stage-grid"\)/);
  const search = read("js/catalogue-search-suggestions.js");
  assert.match(search, /await bootstrap\.ready\(\)/);
  assert.match(search, /bootstrap\.ready\(\)\.catch/);
  assert.match(search, /list\.addEventListener\("pointerdown"/);
  assert.match(search, /location\.assign\(option\.href\)/);
});

test("shared cards render ordered labelled metadata and separate SKU", () => {
  const source = read("js/catalogue-selection.js");
  ["Category", "Class / level", "Series", "Subject", "Book type"].forEach(label => assert.match(source, new RegExp('"' + label.replace("/", "\\/") + '"')));
  assert.match(source, /item\.className = "book-meta-item"/);
  assert.match(source, /item\.dataset\.label = label/);
  assert.match(source, /sku\.className = "book-sku"/);
  const css = read("css/ux-refinement.css");
  assert.match(css, /\.publication-card \.book-meta\{display:grid/);
  assert.doesNotMatch(css, /\.homepage \.footer-links/);
});
