const test = require("node:test");
const assert = require("node:assert/strict");
const { createBrowserSandbox, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");

function bootstrap(search = "") {
  const sandbox = createBrowserSandbox({ location: {
    href: `https://catalogue.example.test/browse.html${search}`,
    pathname: "/browse.html",
    search
  } });
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
  return sandbox.window.CambridgeCatalogueBootstrap;
}

test("static remains the default source and keeps ordinary local URLs clean", async () => {
  const source = bootstrap();
  assert.equal(source.requestedSource, "static");
  assert.equal(source.withSource("early-learning-books.html?level=lkg"), "early-learning-books.html?level=lkg");
  assert.equal((await source.ready()).source, "static");
});

test("an explicit Supabase source is retained through local catalogue URLs", () => {
  const source = bootstrap("?catalogueSource=supabase");
  assert.equal(source.requestedSource, "supabase");
  assert.equal(source.withSource("early-learning-books.html?level=lkg"), "early-learning-books.html?level=lkg&catalogueSource=supabase");
  assert.equal(source.withSource("https://elsewhere.example/books"), "https://elsewhere.example/books");
});

test("the selected Supabase source replaces the shared normalized catalogue", async () => {
  const sandbox = createBrowserSandbox({ location: {
    href: "https://catalogue.example.test/browse.html?catalogueSource=supabase",
    pathname: "/browse.html",
    search: "?catalogueSource=supabase"
  } });
  sandbox.window.CAMBRIDGE_CATALOGUE = [{ id: "static-book" }];
  sandbox.window.CambridgeSupabaseCatalogue = { load: async () => [{ id: "pilot-book", active: true }] };
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");

  const result = await sandbox.window.CambridgeCatalogueBootstrap.ready();
  assert.equal(result.source, "supabase");
  assert.deepEqual(result.books, [{ id: "pilot-book", active: true }]);
  assert.deepEqual(sandbox.window.CAMBRIDGE_CATALOGUE, [{ id: "pilot-book", active: true }]);
});
