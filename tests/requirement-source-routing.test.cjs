const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");
const { createBrowserSandbox, createStorage, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");

const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

function continueBrowsing(search, saved, historyLength = 0) {
  const sandbox = createBrowserSandbox({
    sessionStorage: createStorage({ cambridgeChecklistReturn: JSON.stringify(saved) }),
    location: {
      href: `https://catalogue.example.test/order.html${search}`,
      pathname: "/order.html",
      search
    }
  });
  let wentBack = false;
  sandbox.context.CHECKLIST_RETURN_KEY = "cambridgeChecklistReturn";
  sandbox.context.history = { length: historyLength, back() { wentBack = true; } };
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
  const functions = read("order.html").match(/function readReturn\(\)[\s\S]*?(?=function wireContinueLinks)/)[0];
  vm.runInContext(functions, sandbox.context);
  sandbox.context.continueBrowsing();
  return { href: sandbox.window.location.href, wentBack };
}

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

test("My Selection normalizes a saved fallback while retaining history-first return", () => {
  const order = read("order.html");
  const now = Date.now();
  assert.equal(continueBrowsing("?catalogueSource=supabase", { url: "browse.html", createdAt: now }).href, "browse.html?catalogueSource=supabase");
  assert.equal(continueBrowsing("", { url: "browse.html?catalogueSource=supabase", createdAt: now }).href, "browse.html");
  assert.equal(continueBrowsing("?catalogueSource=supabase", { url: "early-learning-books.html?level=nursery", createdAt: now }).href, "early-learning-books.html?level=nursery&catalogueSource=supabase");
  assert.equal(continueBrowsing("?catalogueSource=supabase", { url: "browse.html", createdAt: now - 31 * 60 * 1000 }).href, "index.html?catalogueSource=supabase");
  assert.equal(continueBrowsing("", { url: "https://elsewhere.example/browse.html", createdAt: now }).href, "index.html");
  assert.equal(continueBrowsing("?catalogueSource=supabase", { url: "browse.html", createdAt: now }, 2).wentBack, true);
  assert.match(order, /target=saved&&source\?source\.localReturnHref\(saved\.url\):null/);
});
