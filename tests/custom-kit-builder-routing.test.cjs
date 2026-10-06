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
  assert.equal(source("?catalogueSource=supabase").withSource("early-learning-level.html?level=nursery"), "early-learning-level.html?level=nursery&catalogueSource=supabase");
  assert.equal(source().withSource("early-learning-level.html?level=nursery"), "early-learning-level.html?level=nursery");
});
