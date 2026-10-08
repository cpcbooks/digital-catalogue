const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createBrowserSandbox, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");
const { clonePublications } = require("./fixtures/publications.cjs");

const pages = ["college-books.html", "competitive-exam-books.html"];
const cardStyles = fs.readFileSync(path.join(__dirname, "..", "css", "publication-browser.css"), "utf8");

function read(page) {
  return fs.readFileSync(path.join(__dirname, "..", page), "utf8");
}

test("College and Competitive renderers load shared Selection helpers before rendering cards", () => {
  for (const page of pages) {
    const source = read(page);
    assert.ok(source.indexOf('src="js/catalogue-selection.js?v=20260816-5"') < source.indexOf("<script>async function start()"));
    assert.match(source, /Selection\.coverNode\(b\)/);
    assert.match(source, /Selection\.actionNode\(b\)/);
    assert.match(source, /className="book-info"/);
    assert.match(source, /className="book-meta"/);
    assert.match(source, /createElement\("h4"\)/);
    assert.match(source, /b\.sku\?"SKU: "\+b\.sku:""/);
    assert.match(source, /b\.isbn\?"ISBN: "\+b\.isbn:""/);
    assert.match(source, /Number\.isFinite\(b\.mrp\)\?"MRP ₹"\+b\.mrp:""/);
    assert.match(source, /function refresh\(\)\{render\(\);Selection\.updateBar\(\)\}/);
    assert.match(source, /window\.addEventListener\(Selection\.CHANGE_EVENT,refresh\)/);
    assert.match(source, /<section class="catalogue-section"><div class="toolbar">/);
  }
  assert.match(cardStyles, /\.publication-card \.qty-control\{display:grid;/);
  assert.match(cardStyles, /\.publication-card \.qty-control button,\.publication-card \.qty-control input\{border:0/);
  assert.match(cardStyles, /\.publication-card \.book-cover\{color:#8b95a5;font-size:8px;font-weight:750;text-align:center\}/);
  assert.match(cardStyles, /\.publication-card \.book-info\{min-width:0\}/);
});

test("shared College and Competitive card actions preserve a source-aware listing return", () => {
  const sandbox = createBrowserSandbox({ location: {
    href: "https://catalogue.example.test/college-books?stage=2nd-puc&catalogueSource=supabase",
    pathname: "/college-books",
    search: "?stage=2nd-puc&catalogueSource=supabase"
  } });
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
  loadBrowserScript(sandbox, "js/catalogue-selection.js");
  const book = clonePublications()[1];
  const href = sandbox.window.CambridgeSelection.detailsUrl(book);
  assert.match(href, /returnTo%3D/);
  assert.match(href, /stage%253D2nd-puc/);
  assert.match(href, /catalogueSource/);
});
