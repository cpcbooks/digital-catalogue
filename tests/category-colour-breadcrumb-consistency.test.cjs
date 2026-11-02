const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

function breadcrumbs(pathname, search = "") {
  const window = { location: { pathname, search }, addEventListener() {} };
  const document = { addEventListener() {} };
  vm.runInNewContext(read("js/catalogue-selection.js"), { window, document, URLSearchParams, encodeURIComponent, JSON, Math, Number, String, Array, Object, Set, Date, Intl, console });
  return JSON.parse(JSON.stringify(window.CambridgeSelection.breadcrumbItems()));
}

function detailBreadcrumbs(book, returnTo) {
  const source = read("js/book-details.js");
  const start = source.indexOf("  function listingBreadcrumbs"), end = source.indexOf("  function imageList");
  const context = {
    book,
    result: null,
    safeReturnTo: () => returnTo,
    location: { href: "https://catalogue.example.test/book-details.html" },
    URL,
    Query: { classValues: value => value.class || [] },
    earlyKey: value => ({ Playgroup: "playgroup", Nursery: "nursery", LKG: "lkg", UKG: "ukg" })[value] || "",
    detailEarlyClass: value => (value.class || [])[0] || "",
    encodeURIComponent,
    String,
    RegExp
  };
  vm.runInNewContext(source.slice(start, end) + "result=detailBreadcrumbs(book);", context);
  return JSON.parse(JSON.stringify(context.result));
}

test("College and Competitive use their homepage colour families without changing other tones", () => {
  const css = read("css/inner-pages-refinement.css");
  const links = read("js/catalogue-source-links.js");
  assert.match(css, /data-catalogue-tone="college"\]\{--inner-accent:#7648bf;--inner-wash:#f6f1fb;--inner-border:#dfd1ee/);
  assert.match(css, /data-catalogue-tone="competitive"\]\{--inner-accent:#21794c;--inner-wash:#e8f6ed;--inner-border:#cce8d6/);
  assert.match(css, /data-catalogue-tone="exam"\]\{--inner-accent:#7853a6;--inner-wash:#f6f1fb;--inner-border:#dfd1ee/);
  assert.match(links, /: \/exam-preparation/);
  assert.match(links, /competitive-exams\|competitive-exam-books/);
});

test("Individual Books and School Books retain clickable actual parents", () => {
  assert.deepEqual(breadcrumbs("/early-learning-books.html", "?level=lkg").map(item => [item.label, item.href]), [
    ["Home", "index.html"], ["Early Learning", "early-learning.html"], ["LKG", "early-learning-level.html?level=lkg"], ["Individual Books", undefined]
  ]);
  assert.deepEqual(breadcrumbs("/school-books.html", "?class=8").map(item => [item.label, item.href]), [
    ["Home", "index.html"], ["School Learning", "school-education.html"], ["Class 8", "school-learning.html?class=8"], ["School Books", undefined]
  ]);
});

test("Book Details uses validated listing context for labels and linked filter-preserving parents", () => {
  assert.deepEqual(detailBreadcrumbs({ category: "early-learning", class: ["LKG"], title: "Letters" }, "early-learning-books.html?level=lkg&q=letters&catalogueSource=supabase").map(item => [item.label, item.href]), [
    ["Home", "index.html"], ["Early Learning", "early-learning.html"], ["LKG", "early-learning-level.html?level=lkg"], ["Individual Books", "early-learning-books.html?level=lkg&q=letters&catalogueSource=supabase"], ["Letters", undefined]
  ]);
  assert.deepEqual(detailBreadcrumbs({ category: "college-university", title: "PUC Guide" }, "college-books.html?stage=2nd-puc&subject=Science&catalogueSource=supabase").map(item => [item.label, item.href]), [
    ["Home", "index.html"], ["College & University", "college-university.html"], ["2nd PUC", "college-books.html?stage=2nd-puc&subject=Science&catalogueSource=supabase"], ["PUC Guide", undefined]
  ]);
  assert.deepEqual(detailBreadcrumbs({ category: "competitive-exams", title: "VAO Guide" }, "competitive-exam-books.html?exam=vao&q=guide").map(item => item.label), ["Home", "Competitive Exams", "VAO", "VAO Guide"]);
});

test("direct Book Details URLs retain data-derived fallback breadcrumbs", () => {
  assert.deepEqual(detailBreadcrumbs({ category: "school", class: ["4"], title: "Science" }, "").map(item => item.label), ["Home", "School Learning", "Class 4", "Science"]);
  assert.deepEqual(detailBreadcrumbs({ category: "exam", class: ["8"], title: "Workbook" }, "").map(item => item.label), ["Home", "School Learning", "Class 8", "Exam Preparation", "Workbook"]);
});

test("mobile Book Details keeps the current title crumb and wraps long text", () => {
  const css = read("css/inner-pages-refinement.css") + read("css/catalogue.css");
  assert.doesNotMatch(css, /catalogue-breadcrumbs__current\{display:none\}/);
  assert.match(css, /\.catalogue-breadcrumbs\s*\{[\s\S]*?flex-wrap: wrap/);
  assert.match(css, /\.catalogue-breadcrumbs__current\s*\{[\s\S]*?overflow-wrap: anywhere/);
});
