const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createBrowserSandbox, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");

function source(search = "") {
  const sandbox = createBrowserSandbox({ location: {
    href: `https://catalogue.example.test/kit-builder.html${search}`,
    pathname: "/kit-builder.html",
    search
  } });
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
  return sandbox.window.CambridgeCatalogueBootstrap;
}

test("Custom Kit Builder routes its stage Back link through the shared source helper", () => {
  const builder = fs.readFileSync(path.join(__dirname, "..", "kit-builder.html"), "utf8");
  assert.match(builder, /levelUrl=Bootstrap\.withSource\("early-learning-level\.html\?level="\+encodeURIComponent\(level\)\)/);
  assert.equal(source("?catalogueSource=supabase").withSource("early-learning-level.html?level=nursery"), "early-learning-level.html#cpc-route=level%3Dnursery%26catalogueSource%3Dsupabase");
  assert.equal(source().withSource("early-learning-level.html?level=nursery"), "early-learning-level.html?level=nursery");
});

test("Custom Kit Builder renders the shared presentation groups", () => {
  const builder = fs.readFileSync(path.join(__dirname, "..", "kit-builder.html"), "utf8");
  assert.match(builder, /KitConfig\.groupBooksForDisplay\(books,categories\)/);
});

test("Custom Kit Builder uses native checkbox selectors", () => {
  const builder = fs.readFileSync(path.join(__dirname, "..", "kit-builder.html"), "utf8");
  assert.match(builder, /const card=document\.createElement\("label"\),input=document\.createElement\("input"\)/);
  assert.match(builder, /input\.type="checkbox";input\.checked=kitState\.contains\(book\)/);
  assert.match(builder, /input\.addEventListener\("change",\(\)=>toggleBook\(book,card,input\)\)/);
  assert.match(builder, /\.book-card:has\(\.book-selector:focus-visible\)/);
});
