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

function emptySelectionHref(search, startsNonEmpty = false) {
  const sandbox = createBrowserSandbox({ location: {
    href: `https://catalogue.example.test/order.html${search}`,
    pathname: "/order.html",
    search
  } });
  const orderItems = { innerHTML: "" }, orderSummary = { innerHTML: "" };
  sandbox.context.document.getElementById = id => id === "orderItems" ? orderItems : id === "orderSummary" ? orderSummary : null;
  sandbox.context.updateNavigation = () => {};
  sandbox.context.order = startsNonEmpty ? [{ id: "book", quantity: 1 }] : [];
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
  const renderOrder = read("order.html").match(/function renderOrder\(\)[\s\S]*?(?=function renderSummary)/)[0];
  vm.runInContext(renderOrder, sandbox.context);
  sandbox.context.order = [];
  sandbox.context.renderOrder();
  return orderItems.innerHTML.match(/href="([^"]+)"/)[1];
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
  assert.equal(continueBrowsing("?catalogueSource=supabase", { url: "browse.html", createdAt: now }).href, "browse.html#cpc-route=catalogueSource%3Dsupabase");
  assert.equal(continueBrowsing("", { url: "browse.html?catalogueSource=supabase", createdAt: now }).href, "browse.html");
  assert.equal(continueBrowsing("?catalogueSource=supabase", { url: "early-learning-books.html?level=nursery", createdAt: now }).href, "early-learning-books.html#cpc-route=level%3Dnursery%26catalogueSource%3Dsupabase");
  assert.equal(continueBrowsing("?catalogueSource=supabase", { url: "browse.html", createdAt: now - 31 * 60 * 1000 }).href, "index.html#cpc-route=catalogueSource%3Dsupabase");
  assert.equal(continueBrowsing("", { url: "https://elsewhere.example/browse.html", createdAt: now }).href, "index.html");
  assert.equal(continueBrowsing("?catalogueSource=supabase", { url: "browse.html", createdAt: now }, 2).wentBack, true);
  assert.match(order, /target=saved&&source\?source\.localReturnHref\(saved\.url\):null/);
});

test("Kit Selection returns preserve stage and source for both Continue Browsing controls", () => {
  const selection = read("js/catalogue-selection.js");
  const review = read("kit-review.html");
  const order = read("order.html");
  const now = Date.now();

  assert.match(selection, /#content \.kit-actions button/);
  assert.match(review, /catalogue-source-links\.js"><\/script><script src="js\/catalogue-selection\.js"><\/script>/);
  assert.match(review, /complete-button/);
  assert.equal((order.match(/<a[^>]*data-continue-browsing/g) || []).length, 2);
  assert.equal(
    continueBrowsing("?catalogueSource=supabase", { url: "early-learning-level.html#cpc-route=level%3Dlkg%26catalogueSource%3Dsupabase", createdAt: now, useHistory: false }, 2).href,
    "early-learning-level.html#cpc-route=level%3Dlkg%26catalogueSource%3Dsupabase"
  );
  assert.equal(
    continueBrowsing("", { url: "early-learning-level.html?level=lkg", createdAt: now, useHistory: false }, 2).href,
    "early-learning-level.html?level=lkg"
  );
  assert.equal(
    continueBrowsing("?catalogueSource=supabase", { url: "early-learning-level.html#cpc-route=level%3Dlkg%26catalogueSource%3Dsupabase", createdAt: now, useHistory: false }, 2).href,
    "early-learning-level.html#cpc-route=level%3Dlkg%26catalogueSource%3Dsupabase"
  );
  assert.equal(
    continueBrowsing("", { url: "early-learning-level.html?level=lkg", createdAt: now, useHistory: false }, 2).href,
    "early-learning-level.html?level=lkg"
  );
  assert.equal(continueBrowsing("?catalogueSource=supabase", { url: "browse.html", createdAt: now }, 2).wentBack, true);
  assert.match(review, /sessionStorage\.removeItem\(DRAFT_KEY\)/);
  assert.match(review, /edit\.href=editUrl/);
});

test("My Selection empty-state Browse link uses the current source on every render", () => {
  const order = read("order.html");
  assert.equal(emptySelectionHref("?catalogueSource=supabase"), "index.html#cpc-route=catalogueSource%3Dsupabase");
  assert.equal(emptySelectionHref(""), "index.html");
  assert.equal(emptySelectionHref("?catalogueSource=supabase", true), "index.html#cpc-route=catalogueSource%3Dsupabase");
  assert.equal(emptySelectionHref("", true), "index.html");
  assert.doesNotMatch(emptySelectionHref(""), /catalogueSource=/);
  assert.match(order, /clearOrder.*?renderOrder\(\)/);
  assert.match(order, /window\.addEventListener\("storage".*?renderOrder\(\)/);
});
