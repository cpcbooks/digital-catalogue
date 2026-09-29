const test = require("node:test");
const assert = require("node:assert/strict");
const { createBrowserSandbox, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");

function navigation(search = "") {
  const sandbox = createBrowserSandbox({ location: {
    href: `https://catalogue.example.test/browse.html${search}`,
    pathname: "/browse.html",
    search
  } });
  loadBrowserScript(sandbox, "js/catalogue-navigation.js");
  return sandbox.window.CambridgeCatalogueNavigation;
}

test("creates a page key from pathname and query state", () => {
  const catalogueNavigation = navigation("?class=5&subject=Science");
  assert.equal(catalogueNavigation.pageKey(), "/browse.html?class=5&subject=Science");
  assert.equal(catalogueNavigation.pageKey("https://catalogue.example.test/book-details.html?id=abc"), "/book-details.html?id=abc");
});

test("uses the supplied fallback when no browsing origin is present", () => {
  const catalogueNavigation = navigation();
  assert.equal(catalogueNavigation.backTarget("index.html"), "index.html");
});
