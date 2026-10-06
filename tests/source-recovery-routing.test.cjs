const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
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

test("Custom Kit Review recovery uses the selected source after bootstrap", () => {
  const review = read("kit-review.html");
  assert.ok(review.indexOf("await Bootstrap.ready()") < review.indexOf('earlyLearningUrl=Bootstrap.withSource("early-learning.html")'));
  assert.match(review, /href="'\+earlyLearningUrl\+'">Browse Early Learning/);
  assert.match(review, /editUrl=Bootstrap\.withSource\("kit-builder\.html\?level="\+encodeURIComponent\(level\)\)/);

  assert.equal(source("kit-review.html", "?level=nursery&catalogueSource=supabase").withSource("early-learning.html"), "early-learning.html?catalogueSource=supabase");
  assert.equal(source("kit-review.html", "?level=nursery").withSource("early-learning.html"), "early-learning.html");
});

test("Requirement Details compatibility redirect preserves only an explicit source", () => {
  const details = read("request-details.html");
  assert.match(details, /catalogue-bootstrap\.js/);
  assert.match(details, /CambridgeCatalogueBootstrap\.withSource\("request\.html"\)/);
  assert.doesNotMatch(details, /http-equiv="refresh"/);

  assert.equal(source("request-details.html", "?catalogueSource=supabase").withSource("request.html"), "request.html?catalogueSource=supabase");
  assert.equal(source("request-details.html").withSource("request.html"), "request.html");
});
