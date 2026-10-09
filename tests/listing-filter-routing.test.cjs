const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createBrowserSandbox, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");
const { clonePublications } = require("./fixtures/publications.cjs");

const pages = [
  ["early-learning-books.html", ["q", "subject"], "level=lkg"],
  ["school-books.html", ["q", "subject"], "class=6"],
  ["exam-preparation.html", ["q", "family", "subject"], "class=10"],
  ["college-books.html", ["q", "subject"], "stage=2nd-puc"],
  ["competitive-exam-books.html", ["q", "subject"], "exam=vao"]
];

function source(page) {
  return fs.readFileSync(path.join(__dirname, "..", page), "utf8");
}

test("stage and class listings hydrate filters from, and replace only, their URL state", () => {
  for (const [page, fields, context] of pages) {
    const html = source(page);
    assert.match(html, /function syncUrl\(\)\{const next=new URLSearchParams\(location.search\);/);
    assert.match(html, new RegExp(`\\[${fields.map(field => `"${field}"`).join(",")}\\]\\.forEach\\(key=>next\\.delete\\(key\\)\\)`));
    for (const field of fields) {
      assert.match(html, new RegExp(`params\\.get\\("${field}"\\)`));
    }
    assert.match(html, /history\.replaceState\(null,"",location\.pathname/);
    assert.match(html, /window\.addEventListener\("popstate",\(\)=>\{restoreFilters\(\);render\(false\)\}\)/);
    assert.match(html, new RegExp(`(?:URLSearchParams\\(location\\.search\\)|params)\\.get\\("${context.split("=")[0]}"\\)`));
  }
});

test("listing filter URLs remain source-aware Book Details return origins", () => {
  const cases = [
    "/early-learning-books?level=lkg&q=phonics&subject=English&catalogueSource=supabase",
    "/school-books?class=6&q=grammar&subject=English&catalogueSource=supabase",
    "/exam-preparation?class=10&q=LBA&family=LBA&subject=Science&catalogueSource=supabase",
    "/college-books?stage=2nd-puc&q=hindi&subject=Hindi&catalogueSource=supabase",
    "/competitive-exam-books?exam=vao&q=guide&subject=General+Knowledge&catalogueSource=supabase"
  ];
  for (const relative of cases) {
    const url = new URL(`https://catalogue.example.test${relative}`);
    const sandbox = createBrowserSandbox({ location: { href: url.href, pathname: url.pathname, search: url.search } });
    loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
    loadBrowserScript(sandbox, "js/catalogue-selection.js");
    const href = sandbox.window.CambridgeSelection.detailsUrl(clonePublications()[1]);
    const route = new URLSearchParams(decodeURIComponent(href.split("#cpc-route=")[1]));
    assert.equal(route.get("returnTo"), relative);
    assert.equal(route.get("catalogueSource"), "supabase");
  }
});
