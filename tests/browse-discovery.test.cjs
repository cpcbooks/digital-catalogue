const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createBrowserSandbox, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");

const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

function staticQuery() {
  const sandbox = createBrowserSandbox();
  loadBrowserScript(sandbox, "js/catalogue-data.js");
  loadBrowserScript(sandbox, "js/catalogue-query.js");
  return sandbox.window.CambridgeCatalogueQuery;
}

test("Browse exposes the approved four-tab discovery structure without a visible Category filter", () => {
  const html = read("browse.html");
  for (const label of ["All Books", "By Series", "By Subject", "By Book Type"]) assert.match(html, new RegExp(`>${label}<`));
  assert.match(html, /role="tablist"/);
  assert.match(html, /id="browseDiscovery"/);
  assert.match(html, /id="browseRefine"/);
  assert.match(html, /id="class" aria-label="Class or stage"/);
  assert.match(html, /id="category"/);
  assert.match(html, /<div hidden aria-hidden="true"><select id="category"/);
  assert.match(html, /\.browse-tabs\{display:flex;flex-wrap:nowrap;/);
  assert.match(html, /\.browse-content\{[^}]*overflow-x:hidden/);
  assert.match(html, /\.browse-tab\{display:inline-flex;flex:0 0 auto;[^}]*white-space:nowrap/);
  assert.match(html, /@media\(max-width:620px\)/);
  assert.match(html, /\.browse-tabs\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\);overflow:visible\}/);
  assert.match(html, /\.browse-tab\{width:100%;min-height:40px;justify-content:center;/);
});

test("Browse discovery remains data-led and uses the existing query matcher", () => {
  const query = staticQuery();
  const books = query.active();
  const series = [...new Set(books.flatMap(book => query.browseValues(book, "series")))];
  const subjects = [...new Set(books.flatMap(book => query.browseValues(book, "subject")))];
  const types = [...new Set(books.flatMap(book => query.browseValues(book, "type")))];

  assert.ok(series.includes("LBA"));
  assert.ok(subjects.includes("Mathematics"));
  assert.ok(types.includes("Writing"));
  assert.deepEqual(query.browseMatches(books, { subject: "Mathematics" }, "", {}).every(book => book.subject === "Mathematics"), true);
  assert.deepEqual(query.browseMatches(books, { subject: "Science" }, "", {}).every(book => book.subject === "Science"), true);
});

test("Browse keeps tab state, discovery filters, shared card actions, and Back/Forward hydration in its existing URL flow", () => {
  const source = read("js/catalogue-browse.js");
  const html = read("browse.html");
  assert.match(source, /const DISCOVERY_FIELDS = \["series", "subject", "type"\]/);
  assert.match(source, /next\.set\("view", view\)/);
  assert.match(source, /history\[mode === "push" \? "pushState" : "replaceState"\]/);
  assert.match(source, /window\.addEventListener\("popstate", \(\) => \{ restoreState\(\); render\(false\); \}\)/);
  assert.match(source, /return DISCOVERY_FIELDS\.find\(field => params\.get\(field\)\) \|\| "all"/);
  assert.match(source, /if \(raw === "subjects"\) return "subject"/);
  assert.match(source, /const actions = selection\.actionNode\(book\)/);
  assert.match(source, /actions\.classList\.add\("browse-actions"\)/);
  assert.doesNotMatch(source, /actions\.prepend\(/);
  assert.match(source, /window\.addEventListener\(selection\.CHANGE_EVENT, \(\) => render\(false\)\)/);
  assert.ok(html.indexOf('src="js/catalogue-selection.js?v=20260816-5"') < html.indexOf('src="js/catalogue-browse.js?v=20261008-1"'));
});

test("a deliberate switch to a different Browse tab starts fresh while the active tab is a no-op", () => {
  const source = read("js/catalogue-browse.js");
  assert.match(source, /if \(next === view\) return;/);
  assert.match(source, /search\.value = "";/);
  assert.match(source, /Object\.values\(fields\)\.forEach\(field => \{ field\.value = ""; \}\);/);
  assert.match(source, /render\("push"\);/);
  assert.match(source, /scrollIntoView\(\{ block: "nearest", inline: "nearest" \}\)/);
  assert.match(source, /choice\.addEventListener\("click", \(\) => \{[\s\S]*maybeClearMedium\(filters\(\)\);[\s\S]*render\("replace"\)/);
});

test("Medium availability is centralized around guide and assessment publication types", () => {
  const source = read("js/catalogue-browse.js");
  assert.match(source, /const MEDIUM_TYPES = new Set\(\["Assessment Book", "Combined Guide", "Guide", "Question Bank"\]\)/);
  assert.match(source, /MEDIUM_TYPES\.has\(book\.type \|\| book\.bookType \|\| ""\) && book\.medium/);
  assert.match(source, /mediumField\.hidden = !mediumIsApplicable\(current\) && !fields\.medium\.value/);
  assert.match(source, /if \(current\.medium && !mediumIsApplicable\(\{ \.\.\.current, medium: "" \}\)\) fields\.medium\.value = ""/);
});

test("Homepage discovery panel is one source-aware neutral-All-Books link", () => {
  const home = read("index.html");
  assert.match(home, /<h2>Browse by Class &amp; Level<\/h2>/);
  assert.match(home, /<h2>Explore Our Book Collection<\/h2>/);
  assert.match(home, /Discover publications by series, subject or book type—or browse the complete collection\./);
  assert.match(home, /<a class="collection-panel" href="browse\.html\?view=all">/);
  assert.match(home, /<span class="collection-panel-cta">Explore Books →<\/span>/);
  assert.doesNotMatch(home, /class="collection-panel"[^>]*>[\s\S]*<a href=/);
  assert.match(home, /\.collection-panel:focus-visible/);
  assert.match(home, /catalogue-source-links\.js/);
});
