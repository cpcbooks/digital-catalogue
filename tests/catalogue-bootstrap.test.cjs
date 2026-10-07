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

function sourceLinkedHrefs(search, hrefs = ["index.html"]) {
  const sandbox = createBrowserSandbox({ location: {
    href: `https://catalogue.example.test/browse.html${search}`,
    pathname: "/browse.html",
    search
  } });
  const links = hrefs.map(href => ({ href, getAttribute() { return this.href; }, setAttribute(_, value) { this.href = value; } }));
  sandbox.window.document.readyState = "complete";
  sandbox.window.document.querySelectorAll = selector => selector === "a[href]" ? links : [];
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
  loadBrowserScript(sandbox, "js/catalogue-source-links.js");
  return links.map(link => link.href);
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
  assert.equal(source.withSource("early-learning-books.html?level=lkg"), "early-learning-books.html#cpc-route=level%3Dlkg%26catalogueSource%3Dsupabase");
  assert.equal(source.withSource("https://elsewhere.example/books"), "https://elsewhere.example/books");
});

test("stage and class entry routes retain their context in each catalogue source", () => {
  const supabase = bootstrap("?catalogueSource=supabase");
  const staticSource = bootstrap();

  for (const level of ["playgroup", "nursery", "lkg", "ukg"]) {
    assert.equal(
      supabase.withSource(`early-learning-level.html?level=${level}`),
      `early-learning-level.html#cpc-route=level%3D${level}%26catalogueSource%3Dsupabase`
    );
    assert.equal(staticSource.withSource(`early-learning-level.html?level=${level}`), `early-learning-level.html?level=${level}`);
  }

  for (let schoolClass = 1; schoolClass <= 10; schoolClass += 1) {
    assert.equal(
      supabase.withSource(`school-learning.html?class=${schoolClass}`),
      `school-learning.html#cpc-route=class%3D${schoolClass}%26catalogueSource%3Dsupabase`
    );
    assert.equal(staticSource.withSource(`school-learning.html?class=${schoolClass}`), `school-learning.html?class=${schoolClass}`);
  }
});

test("preserves route context when the shared-link pass sees an already encoded route", () => {
  const source = bootstrap("?catalogueSource=supabase");
  assert.equal(source.withSource("standard-kit.html#cpc-route=level%3Dlkg%26catalogueSource%3Dsupabase"), "standard-kit.html#cpc-route=level%3Dlkg%26catalogueSource%3Dsupabase");
});

test("restores route context from a redirect-safe fragment before reading the source", () => {
  const sandbox = createBrowserSandbox({ location: {
    href: "https://catalogue.example.test/early-learning-level#cpc-route=level%3Dlkg%26catalogueSource%3Dsupabase",
    pathname: "/early-learning-level",
    search: "",
    hash: "#cpc-route=level%3Dlkg%26catalogueSource%3Dsupabase"
  } });
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
  assert.equal(sandbox.window.location.search, "?level=lkg&catalogueSource=supabase");
  assert.equal(sandbox.window.CambridgeCatalogueBootstrap.requestedSource, "supabase");
});

test("saved Selection return targets are local and normalized to the current source", () => {
  const supabase = bootstrap("?catalogueSource=supabase");
  const staticSource = bootstrap();

  assert.equal(supabase.localReturnHref("browse.html"), "browse.html#cpc-route=catalogueSource%3Dsupabase");
  assert.equal(staticSource.localReturnHref("browse.html?catalogueSource=supabase"), "browse.html");
  assert.equal(supabase.localReturnHref("early-learning-books.html?level=nursery&catalogueSource=static#titles"), "early-learning-books.html#cpc-route=level%3Dnursery%26catalogueSource%3Dsupabase");
  assert.equal(supabase.localReturnHref("/standard-kit?level=lkg&catalogueSource=supabase"), "standard-kit#cpc-route=level%3Dlkg%26catalogueSource%3Dsupabase");
  assert.equal(staticSource.localReturnHref("/standard-kit?level=lkg"), "standard-kit?level=lkg");
  assert.equal(supabase.localReturnHref("/standard-kit.html?level=lkg&catalogueSource=supabase"), "standard-kit.html#cpc-route=level%3Dlkg%26catalogueSource%3Dsupabase");
  assert.equal(supabase.localReturnHref("/kit-review?level=lkg&catalogueSource=supabase"), "kit-review#cpc-route=level%3Dlkg%26catalogueSource%3Dsupabase");
  assert.equal(supabase.localReturnHref("/browse?subject=English"), "browse#cpc-route=subject%3DEnglish%26catalogueSource%3Dsupabase");
  assert.equal(supabase.localReturnHref("https://elsewhere.example/browse.html"), null);
  assert.equal(supabase.localReturnHref("//elsewhere.example/browse.html"), null);
  assert.equal(supabase.localReturnHref("javascript:alert(1)"), null);
  assert.equal(supabase.localReturnHref("data:text/html,unsafe"), null);
  assert.equal(supabase.localReturnHref("/other-app/browse.html"), null);
  assert.equal(supabase.localReturnHref("/not-a-catalogue-page"), null);
});

test("shared source links preserve an explicit source before catalogue loading", () => {
  assert.deepEqual(sourceLinkedHrefs("?catalogueSource=supabase", ["index.html", "index.html"]), ["index.html#cpc-route=catalogueSource%3Dsupabase", "index.html#cpc-route=catalogueSource%3Dsupabase"]);
  assert.deepEqual(sourceLinkedHrefs("", ["index.html", "index.html"]), ["index.html", "index.html"]);
  const browse = fs.readFileSync(path.join(__dirname, "..", "browse.html"), "utf8");
  assert.match(browse, /catalogue-bootstrap\.js[^>]*><\/script>\s*<script src="js\/catalogue-source-links\.js"><\/script>/);
  const details = fs.readFileSync(path.join(__dirname, "..", "book-details.html"), "utf8");
  assert.match(details, /catalogue-bootstrap\.js[^>]*><\/script><script src="js\/catalogue-source-links\.js"><\/script>/);
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
  assert.equal(sandbox.window.CambridgeCatalogueBootstrap.withSource("standard-kit.html?level=lkg"), "standard-kit.html#cpc-route=level%3Dlkg%26catalogueSource%3Dsupabase");
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
