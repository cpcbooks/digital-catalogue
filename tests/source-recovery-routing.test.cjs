const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createBrowserSandbox, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");

const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

function source(page, search = "") {
  const sandbox = createBrowserSandbox({ location: {
    href: `https://catalogue.example.test/${page}${search}`,
    pathname: `/${page}`,
    search
  } });
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
  return sandbox.window.CambridgeCatalogueBootstrap;
}

function bookDetailsBack(search) {
  const sandbox = createBrowserSandbox({ location: {
    href: `https://catalogue.example.test/book-details.html${search}`,
    pathname: "/book-details.html",
    search
  } });
  sandbox.window.CambridgeSelection = { CHANGE_EVENT: "selection" };
  sandbox.window.CambridgeCatalogueQuery = { classValues() { return []; }, normalizeClass(value) { return value; } };
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
  const script = read("js/book-details.js").replace(/  window\.addEventListener\(Selection\.CHANGE_EVENT,refresh\);[\s\S]*?\}\)\(\);\s*$/, "  window.__bookDetailsTest={safeReturnTo,sourceBack};\n})();\n");
  vm.runInContext(script, sandbox.context);
  return sandbox.window.__bookDetailsTest.sourceBack({ category: "other" });
}

test("Custom Kit Review recovery uses the selected source after bootstrap", () => {
  const review = read("kit-review.html");
  assert.ok(review.indexOf("await Bootstrap.ready()") < review.indexOf('earlyLearningUrl=Bootstrap.withSource("early-learning.html")'));
  assert.match(review, /href="'\+earlyLearningUrl\+'">Browse Early Learning/);
  assert.match(review, /editUrl=Bootstrap\.withSource\("kit-builder\.html\?level="\+encodeURIComponent\(level\)\)/);

  assert.equal(source("kit-review.html", "?level=nursery&catalogueSource=supabase").withSource("early-learning.html"), "early-learning.html#cpc-route=catalogueSource%3Dsupabase");
  assert.equal(source("kit-review.html", "?level=nursery").withSource("early-learning.html"), "early-learning.html");
});

test("Requirement Details compatibility redirect preserves only an explicit source", () => {
  const details = read("request-details.html");
  assert.match(details, /catalogue-bootstrap\.js/);
  assert.match(details, /CambridgeCatalogueBootstrap\.withSource\("request\.html"\)/);
  assert.doesNotMatch(details, /http-equiv="refresh"/);

  assert.equal(source("request-details.html", "?catalogueSource=supabase").withSource("request.html"), "request.html#cpc-route=catalogueSource%3Dsupabase");
  assert.equal(source("request-details.html").withSource("request.html"), "request.html");
});

test("listing Back links retain source after asynchronous bootstrap", () => {
  const listings = [
    ["early-learning-books.html", "level=nursery", /backLink\.href=Bootstrap\.withSource\("early-learning-level\.html\?level="\+encodeURIComponent\(level\)\)/],
    ["school-books.html", "class=1", /backLink\.href=Bootstrap\.withSource\("school-learning\.html\?class="\+encodeURIComponent\(normalized\)\)/],
    ["exam-preparation.html", "class=1", /backLink\.href=Bootstrap\.withSource\("school-learning\.html\?class="\+encodeURIComponent\(c\)\)/]
  ];

  for (const [page, query, assignment] of listings) {
    const html = read(page);
    assert.ok(html.indexOf("await Bootstrap.ready()") < html.search(assignment));
    assert.match(html, assignment);
    const target = assignment.source.includes("early-learning") ? `early-learning-level.html?${query}` : `school-learning.html?${query}`;
    assert.equal(source(page, `?${query}&catalogueSource=supabase`).withSource(target), `${target.split("?")[0]}#cpc-route=${encodeURIComponent(`${query}&catalogueSource=supabase`)}`);
    assert.equal(source(page, `?${query}`).withSource(target), target);
  }
});

test("School dynamic navigation applies the current source after the shared-link pass", () => {
  const education = read("school-education.html");
  const school = read("school-learning.html");
  const targets = [
    [education, /a\.href=Bootstrap\.withSource\("school-learning\.html\?class="\+c\)/, "school-learning.html?class=1", "school-learning.html#cpc-route=class%3D1%26catalogueSource%3Dsupabase"],
    [school, /a\.href=Bootstrap\.withSource\("\?class="\+i\)/, "?class=2", "school-learning.html#cpc-route=class%3D2%26catalogueSource%3Dsupabase"],
    [school, /href:Bootstrap\.withSource\("school-books\.html\?class="\+c\)/, "school-books.html?class=1", "school-books.html#cpc-route=class%3D1%26catalogueSource%3Dsupabase"],
    [school, /href:Bootstrap\.withSource\("exam-preparation\.html\?class="\+c\)/, "exam-preparation.html?class=1", "exam-preparation.html#cpc-route=class%3D1%26catalogueSource%3Dsupabase"]
  ];

  for (const [page, assignment, target, sourcedTarget] of targets) {
    assert.ok(page.indexOf("catalogue-source-links.js") < page.search(assignment));
    assert.match(page, assignment);
    assert.equal(source("school-learning.html", "?class=1&catalogueSource=supabase").withSource(target), sourcedTarget);
    assert.equal(source("school-learning.html", "?class=1").withSource(target), target);
  }
});

test("Early Learning dynamic navigation applies the current source after the shared-link pass", () => {
  const level = read("early-learning-level.html");
  const targets = [
    [/a\.href=Bootstrap\.withSource\("\?level="\+key\)/, "?level=lkg", "early-learning-level.html#cpc-route=level%3Dlkg%26catalogueSource%3Dsupabase"],
    [/standardUrl=Bootstrap\.withSource\("standard-kit\.html\?level="\+encodeURIComponent\(level\)\)/, "standard-kit.html?level=nursery", "standard-kit.html#cpc-route=level%3Dnursery%26catalogueSource%3Dsupabase"],
    [/customUrl=Bootstrap\.withSource\("kit-builder\.html\?level="\+encodeURIComponent\(level\)\)/, "kit-builder.html?level=nursery", "kit-builder.html#cpc-route=level%3Dnursery%26catalogueSource%3Dsupabase"],
    [/individualUrl=Bootstrap\.withSource\("early-learning-books\.html\?level="\+encodeURIComponent\(level\)\)/, "early-learning-books.html?level=nursery", "early-learning-books.html#cpc-route=level%3Dnursery%26catalogueSource%3Dsupabase"]
  ];

  for (const [assignment, target, sourcedTarget] of targets) {
    assert.ok(level.indexOf("catalogue-source-links.js") < level.search(assignment));
    assert.match(level, assignment);
    assert.equal(source("early-learning-level.html", "?level=nursery&catalogueSource=supabase").withSource(target), sourcedTarget);
    assert.equal(source("early-learning-level.html", "?level=nursery").withSource(target), target);
  }
});

test("Book Details returnTo keeps its allowlisted destination but normalizes the current source", () => {
  const query = values => `?${new URLSearchParams(values)}`;

  assert.equal(bookDetailsBack(query({ id: "book", catalogueSource: "supabase", returnTo: "browse.html" })), "browse.html#cpc-route=catalogueSource%3Dsupabase");
  assert.equal(bookDetailsBack(query({ id: "book", catalogueSource: "supabase", returnTo: "browse?q=LBA&subject=Science" })), "browse#cpc-route=q%3DLBA%26subject%3DScience%26catalogueSource%3Dsupabase");
  assert.equal(bookDetailsBack(query({ id: "book", catalogueSource: "supabase", returnTo: "early-learning-books.html?level=nursery&q=phonics" })), "early-learning-books.html#cpc-route=level%3Dnursery%26q%3Dphonics%26catalogueSource%3Dsupabase");
  assert.equal(bookDetailsBack(query({ id: "book", catalogueSource: "supabase", returnTo: "early-learning-books?level=nursery" })), "early-learning-books#cpc-route=level%3Dnursery%26catalogueSource%3Dsupabase");
  assert.equal(bookDetailsBack(query({ id: "book", returnTo: "browse.html?catalogueSource=supabase" })), "browse.html");
  assert.equal(bookDetailsBack(query({ id: "book", returnTo: "early-learning-books.html?level=nursery&catalogueSource=supabase" })), "early-learning-books.html?level=nursery");
  assert.equal(bookDetailsBack(query({ id: "book", catalogueSource: "supabase", returnTo: "https://elsewhere.example/browse.html" })), "index.html#cpc-route=catalogueSource%3Dsupabase");
  assert.equal(bookDetailsBack(query({ id: "book", catalogueSource: "supabase", returnTo: "//elsewhere.example/browse" })), "index.html#cpc-route=catalogueSource%3Dsupabase");
  assert.equal(bookDetailsBack(query({ id: "book", catalogueSource: "supabase", returnTo: "javascript:alert(1)" })), "index.html#cpc-route=catalogueSource%3Dsupabase");
  assert.equal(bookDetailsBack(query({ id: "book", catalogueSource: "supabase" })), "index.html#cpc-route=catalogueSource%3Dsupabase");

  const details = read("js/book-details.js");
  assert.match(details, /bootstrap\.localReturnHref\(value\)/);
  assert.match(read("js/catalogue-browse.js"), /selection\.actionNode\(book\)/);
  assert.match(read("js/catalogue-selection.js"), /if \(!isBookDetailsPage\(\)\) params\.set\("returnTo", currentRelativeUrl\(\)\)/);
});
