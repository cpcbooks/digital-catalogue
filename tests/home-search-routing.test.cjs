const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createBrowserSandbox, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");

const home = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const script = home.match(/<script id="homeSearchRouting">([\s\S]*?)<\/script>/)[1];

function submitHomeSearch(search, value) {
  const sandbox = createBrowserSandbox({ location: {
    href: `https://catalogue.example.test/index.html${search}`, pathname: "/index.html", search
  } });
  const form = { addEventListener(_, listener) { this.submit = listener; } };
  const input = { value };
  sandbox.window.document.getElementById = id => id === "homeSearch" ? form : id === "catalogueSearch" ? input : null;
  loadBrowserScript(sandbox, "js/catalogue-bootstrap.js");
  vm.runInContext(script, sandbox.context);
  let prevented = false;
  form.submit({ preventDefault() { prevented = true; } });
  return { href: sandbox.window.location.href, prevented };
}

test("Home search routes source-aware Browse URLs through the live form handler", () => {
  assert.deepEqual(submitHomeSearch("?catalogueSource=supabase", "LBA"), {
    href: "browse.html#cpc-route=q%3DLBA%26catalogueSource%3Dsupabase", prevented: true
  });
  assert.deepEqual(submitHomeSearch("", "LBA"), { href: "browse.html?q=LBA", prevented: true });
});

test("Home search safely encodes terms and sends blank input to source-aware Browse", () => {
  assert.equal(
    submitHomeSearch("?catalogueSource=supabase", " LBA & Science ").href,
    "browse.html#cpc-route=q%3DLBA%2B%2526%2BScience%26catalogueSource%3Dsupabase"
  );
  assert.equal(submitHomeSearch("?catalogueSource=supabase", "   ").href, "browse.html#cpc-route=catalogueSource%3Dsupabase");
});

test("Browse keeps q-backed search initialization", () => {
  const browse = fs.readFileSync(path.join(__dirname, "..", "js", "catalogue-browse.js"), "utf8");
  assert.match(browse, /search\.value = params\.get\("q"\) \|\| ""/);
});
