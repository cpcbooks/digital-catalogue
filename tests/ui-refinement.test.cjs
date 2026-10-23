const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("shared card renderer keeps cover placeholders blank and accessible", () => {
  const source = read("js/catalogue-selection.js");
  assert.match(source, /wrapper\.innerHTML = ""/);
  assert.match(source, /aria-label", "Cover unavailable"/);
  assert.match(source, /blank\.className = "book-cover-placeholder"/);
  assert.doesNotMatch(source, /wrapper\.textContent\s*=\s*"Cover image coming soon"/);
  assert.match(source, /image\.src = book\.cover/);
  assert.match(source, /image\.onerror = placeholder/);
});

test("publication cards share a vertical renderer and preserve MRP/SKU metadata", () => {
  const source = read("js/catalogue-selection.js");
  assert.match(source, /function cardNode\(book, metadata\)/);
  assert.match(source, /book\.sku \? "SKU: " \+ book\.sku/);
  assert.match(source, /Number\.isFinite\(Number\(book\.mrp\)\)/);
  assert.match(read("js/catalogue-browse.js"), /selection\.cardNode\(book/);
  assert.match(read("browse.html"), /publication-browser\.css\?v=im14a/);
  ["early-learning-books.html", "school-books.html", "exam-preparation.html", "college-books.html", "competitive-exam-books.html"].forEach(file => {
    assert.match(read(file), /Selection\.cardNode\(/, file);
  });
});

test("media CSS preserves real-image ratios and uses a blank portrait fallback", () => {
  const source = read("css/publication-browser.css");
  assert.match(source, /object-fit:contain/);
  assert.match(source, /width:auto;height:auto/);
  assert.match(source, /height:200px/);
  assert.match(source, /book-cover-placeholder\{display:block;width:94px;height:140px/);
  assert.match(source, /@media\(max-width:359px\)\{\.publication-grid\{grid-template-columns:1fr\}/);
  assert.doesNotMatch(source, /Cover image coming soon/);
});

test("Book Details retains safe optional metadata handling and a blank missing-cover label", () => {
  const source = read("js/book-details.js");
  assert.match(source, /function optionalText\(/);
  assert.match(source, /function numberValue\(/);
  assert.match(source, /\["Weight",weight===null\?"":weight\+" kg"\]/);
  assert.match(source, /\["Dimensions",dimensionText\]/);
  assert.match(source, /label\.textContent=""/);
  assert.doesNotMatch(source, /Cover image coming soon/);
});
