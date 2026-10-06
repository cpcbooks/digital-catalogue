const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

test("Requirement navigation retains an explicitly selected catalogue source", () => {
  const order = read("order.html");
  const request = read("request.html");
  const review = read("review-request.html");

  assert.match(order, /source\.withSource\("request\.html"\)/);
  assert.match(request, /catalogue-bootstrap\.js/);
  assert.match(request, /catalogue-source-links\.js/);
  assert.match(request, /REVIEW_PAGE=withSource\("review-request\.html"\)/);
  assert.match(request, /href="\$\{withSource\("order\.html"\)\}">View Selection/);
  assert.match(review, /catalogue-bootstrap\.js/);
  assert.match(review, /catalogue-source-links\.js/);
  assert.match(review, /href="\$\{withSource\("request\.html"\)\}"/);
  assert.match(review, /href="\$\{withSource\("order\.html"\)\}"/);
});

test("Requirement routing still leaves the default static source unparameterized", () => {
  const source = read("js/catalogue-bootstrap.js");
  assert.match(source, /if \(requestedSource !== "supabase" \|\| !href\) return href;/);
});
