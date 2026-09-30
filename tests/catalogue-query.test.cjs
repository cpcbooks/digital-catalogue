const test = require("node:test");
const assert = require("node:assert/strict");
const { createBrowserSandbox, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");
const { clonePublications } = require("./fixtures/publications.cjs");

function queryWithCatalogue() {
  const sandbox = createBrowserSandbox();
  sandbox.window.CAMBRIDGE_CATALOGUE = clonePublications();
  loadBrowserScript(sandbox, "js/catalogue-query.js");
  return sandbox.window.CambridgeCatalogueQuery;
}

test("normalizes supported Early Learning stage names and existing aliases", () => {
  const query = queryWithCatalogue();
  assert.equal(query.normalizeClass(" playgroup "), "Playgroup");
  assert.equal(query.normalizeClass(" nur "), "Nursery");
  assert.equal(query.normalizeClass("lkg"), "LKG");
  assert.equal(query.normalizeClass("5"), "5");
});

test("returns active records and does not resolve an inactive publication", () => {
  const query = queryWithCatalogue();
  assert.equal(query.active().length, 4);
  assert.equal(query.byId("10000000-0000-4000-8000-000000000004"), null);
});

test("deduplicates normalized class values and filters a category by class", () => {
  const query = queryWithCatalogue();
  const nursery = query.byCategoryAndClass("early-learning", "nur");
  assert.deepEqual(Array.from(query.classValues(nursery[0])), ["Nursery"]);
  assert.deepEqual(nursery.map(book => book.title), ["Nursery Numbers"]);
});

test("filters synthetic Playgroup publications as an Early Learning stage", () => {
  const query = queryWithCatalogue();
  const playgroup = query.byCategoryAndClass("early-learning", " playgroup ");
  assert.deepEqual(playgroup.map(book => book.title), ["Playgroup Patterns"]);
});

test("orders supported Early Learning stages before numbered classes", () => {
  const query = queryWithCatalogue();
  const stages = ["UKG", "2", "Nursery", "LKG", "Playgroup", "10"];
  assert.deepEqual(stages.sort((a, b) => query.classOrder(a) - query.classOrder(b)), ["Playgroup", "Nursery", "LKG", "UKG", "2", "10"]);
});

test("treats an empty requested class as an unrestricted category filter", () => {
  const query = queryWithCatalogue();
  assert.equal(query.byCategoryAndClass("early-learning", "").length, 3);
  assert.equal(query.matchesClass(query.byId("10000000-0000-4000-8000-000000000005"), "5"), true);
});

test("collects unique configured field values", () => {
  const query = queryWithCatalogue();
  assert.deepEqual(Array.from(query.uniqueValues(query.active(), "series")), ["First Steps", "Language Start", "School Learning"]);
});

test("matches the current Browse filters without changing record order", () => {
  const query = queryWithCatalogue();
  const books = query.active();
  const matches = query.browseMatches(books, { category: "early-learning", class: "Nursery", subject: "Mathematics", series: "First Steps", type: "Activity" }, "", {});
  assert.deepEqual(matches.map(book => book.id), ["10000000-0000-4000-8000-000000000002"]);
});

test("matches current Browse search case-insensitively after trimming whitespace", () => {
  const query = queryWithCatalogue();
  const matches = query.browseMatches(query.active(), {}, "  class FIVE science ", { school: "School Learning" });
  assert.deepEqual(matches.map(book => book.title), ["Class Five Science"]);
});

test("includes current medium search text and combines it with filters", () => {
  const query = queryWithCatalogue();
  const matches = query.browseMatches(query.active(), { category: "early-learning" }, "kannada writing", { "early-learning": "Early Learning" });
  assert.deepEqual(matches.map(book => book.title), ["LKG Kannada"]);
});

test("returns no matches for a search term absent from current Browse fields", () => {
  const query = queryWithCatalogue();
  const matches = query.browseMatches(query.active(), {}, "9780000000005", { school: "School Learning" });
  assert.deepEqual(Array.from(matches), []);
});
