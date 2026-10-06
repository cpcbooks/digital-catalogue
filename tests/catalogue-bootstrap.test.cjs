const test = require("node:test");
const assert = require("node:assert/strict");
const { createBrowserSandbox, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");
const fs = require("node:fs");
const path = require("node:path");

function bootstrap(search = "") {
  const sandbox = createBrowserSandbox({ location: {
    href: `https://catalogue.example.test/browse.html${search}`,
    pathname: "/browse.html",
    search
  } });
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
  return sandbox.window.CambridgeCatalogueBootstrap;
}

function sourceLinkedHref(search) {
  const sandbox = createBrowserSandbox({ location: {
    href: `https://catalogue.example.test/browse.html${search}`,
    pathname: "/browse.html",
    search
  } });
  const link = {
    href: "index.html",
    getAttribute() { return this.href; },
    setAttribute(_, value) { this.href = value; }
  };
  sandbox.window.document.readyState = "complete";
  sandbox.window.document.querySelectorAll = selector => selector === "a[href]" ? [link] : [];
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
  loadBrowserScript(sandbox, "js/catalogue-source-links.js");
  return link.href;
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

test("shared source links preserve an explicit source before catalogue loading", () => {
  assert.equal(sourceLinkedHref("?catalogueSource=supabase"), "index.html?catalogueSource=supabase");
  assert.equal(sourceLinkedHref(), "index.html");
  const browse = fs.readFileSync(path.join(__dirname, "..", "browse.html"), "utf8");
  assert.match(browse, /catalogue-bootstrap\.js[^>]*><\/script>\s*<script src="js\/catalogue-source-links\.js"><\/script>/);
});

test("Standard Kit definitions use the selected shared source", async () => {
  const staticSource = bootstrap();
  assert.deepEqual(Array.from(await staticSource.standardKitDefinitions()), []);

  const sandbox = createBrowserSandbox({ location: {
    href: "https://catalogue.example.test/standard-kit.html?level=lkg&catalogueSource=supabase",
    pathname: "/standard-kit.html",
    search: "?level=lkg&catalogueSource=supabase"
  } });
  sandbox.window.CambridgeSupabaseCatalogue = {
    loadStandardKitDefinitions: async options => {
      assert.equal(options.supabaseUrl, undefined);
      assert.equal(options.anonKey, undefined);
      return [{ stage: "lkg", stageCode: "lkg", enabled: true, publicationIds: ["one"] }];
    }
  };
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");

  assert.deepEqual(JSON.parse(JSON.stringify(await sandbox.window.CambridgeCatalogueBootstrap.standardKitDefinitions())), [
    { stage: "lkg", stageCode: "lkg", enabled: true, publicationIds: ["one"] }
  ]);
  assert.equal(sandbox.window.CambridgeCatalogueBootstrap.withSource("standard-kit.html?level=lkg"), "standard-kit.html?level=lkg&catalogueSource=supabase");
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
