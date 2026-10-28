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

test("New Arrivals stays within the curated Browse mode", () => {
  assert.match(read("index.html"), /href="browse\.html\?view=new-arrivals"/);
  assert.match(read("index.html"), /homeNewArrivalsRouting/);
  assert.match(read("browse.html"), /catalogue-new-arrivals\.js/);
  const source = read("js/catalogue-browse.js");
  assert.match(source, /const NEW_ARRIVALS_VIEW = "new-arrivals"/);
  assert.match(source, /function visibleBooks\(\) \{ return newArrivalsMode \? newArrivals : books; \}/);
  assert.match(source, /document\.body\.classList\.toggle\("new-arrivals-mode", newArrivalsMode\)/);
  assert.match(source, /document\.querySelector\("\.browse-tabs"\)\.hidden = newArrivalsMode/);
  assert.match(source, /selection\.cardNode\(book/);
  assert.deepEqual(read("js/catalogue-new-arrivals.js").match(/CPC\d{5}/g), ["CPC00252", "CPC00253", "CPC00254", "CPC00255", "CPC00256", "CPC00257", "CPC00258", "CPC00259"]);
  assert.doesNotMatch(read("js/catalogue-new-arrivals.js"), /date|timestamp/i);
});
