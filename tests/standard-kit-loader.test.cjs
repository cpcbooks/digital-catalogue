const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createBrowserSandbox, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");

function deferred() {
  let resolve, reject;
  const promise = new Promise((resolvePromise, rejectPromise) => { resolve = resolvePromise; reject = rejectPromise; });
  return { promise, resolve, reject };
}

function flush() { return new Promise(resolve => setImmediate(resolve)); }

function page(options = {}) {
  const content = { innerHTML: "", replaceChildrenCalls: 0, replaceChildren() { this.replaceChildrenCalls += 1; } };
  const back = { href: "" };
  const title = { textContent: "" };
  const sandbox = createBrowserSandbox({ location: {
    href: "https://catalogue.example.test/standard-kit.html?level=lkg&catalogueSource=supabase",
    pathname: "/standard-kit.html",
    search: "?level=lkg&catalogueSource=supabase"
  } });
  sandbox.window.document.getElementById = id => ({ content, back, title })[id] || null;
  sandbox.window.CambridgeCatalogueBootstrap = options.bootstrap;
  sandbox.window.CambridgeCatalogueQuery = options.query || { active: () => [] };
  sandbox.window.CambridgeStandardKitConfig = options.config || {
    createProvider: definitions => ({ get: stage => definitions[stage] || null }),
    resolve: definition => definition ? { available: true, books: [] } : { available: false },
    mrpTotal: () => null
  };
  sandbox.window.CambridgeSelection = { coverNode: () => ({}) };
  loadBrowserScript(sandbox, "js/standard-kit.js");
  return { content, sandbox };
}

test("Standard Kit page obtains source-aware configuration from the shared bootstrap", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "js", "standard-kit.js"), "utf8");
  assert.match(source, /Bootstrap\.standardKitDefinitions\(\)/);
  assert.match(source, /Bootstrap\.requestedSource==="supabase"/);
  assert.match(source, /Promise\.allSettled\(\[Bootstrap\.ready\(\),Bootstrap\.standardKitDefinitions\(\)\]\)/);
  assert.doesNotMatch(source, /standard_kit_definitions|standard_kit_publications/);
});

test("Standard Kit starts catalogue and configuration loading together and renders only after both resolve", async () => {
  const catalogue = deferred(), definitions = deferred();
  const calls = [];
  const { content } = page({ bootstrap: {
    requestedSource: "supabase",
    withSource: value => value,
    ready: () => { calls.push("catalogue"); return catalogue.promise; },
    standardKitDefinitions: () => { calls.push("definitions"); return definitions.promise; }
  } });

  assert.deepEqual(calls, ["catalogue", "definitions"]);
  catalogue.resolve({ source: "supabase", books: [] });
  await flush();
  assert.equal(content.replaceChildrenCalls, 0);
  definitions.resolve([{ stageCode: "lkg", enabled: true, publicationIds: [] }]);
  await flush();
  assert.equal(content.replaceChildrenCalls, 1);
});

test("Standard Kit keeps catalogue and configuration failures in their existing error states", async () => {
  const catalogue = deferred(), definitions = deferred();
  const first = page({ bootstrap: {
    requestedSource: "supabase", withSource: value => value,
    ready: () => catalogue.promise, standardKitDefinitions: () => definitions.promise
  } });
  catalogue.reject(new Error("catalogue failed"));
  definitions.reject(new Error("definitions failed"));
  await flush();
  assert.match(first.content.innerHTML, /Catalogue unavailable/);

  const second = page({ bootstrap: {
    requestedSource: "supabase", withSource: value => value,
    ready: async () => ({ source: "supabase", books: [] }), standardKitDefinitions: async () => { throw new Error("definitions failed"); }
  } });
  await flush();
  assert.match(second.content.innerHTML, /Standard Kit unavailable/);
});

test("Standard Kit keeps static fallback and existing Selection navigation", async () => {
  const { content } = page({ bootstrap: {
    requestedSource: "static", withSource: value => value,
    ready: async () => ({ source: "static", books: [] }), standardKitDefinitions: async () => []
  }, config: { get: () => null, resolve: () => ({ available: false }) } });
  await flush();
  assert.match(content.innerHTML, /Standard Kit not configured/);
  const source = fs.readFileSync(path.join(__dirname, "..", "js", "standard-kit.js"), "utf8");
  assert.match(source, /location\.href=href\("order\.html"\)/);
});
