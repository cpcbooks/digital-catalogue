const test = require("node:test");
const assert = require("node:assert/strict");
const { createBrowserSandbox, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");

function standardKits(definitions = {}) {
  const sandbox = createBrowserSandbox();
  loadBrowserScript(sandbox, "js/standard-kit-config.js");
  return sandbox.window.CambridgeStandardKitConfig.createProvider(definitions);
}

const books = [{ id: "two", title: "Second", active: true }, { id: "one", title: "First", active: true }];

test("resolves configured canonical IDs in CPC-configured order", () => {
  const provider = standardKits({ nursery: { stageCode: "nursery", enabled: true, publicationIds: ["one", "two"] } });
  const result = requireConfig().resolve(provider.get("nursery"), books);
  assert.equal(result.available, true);
  assert.deepEqual(result.books.map(book => book.id), ["one", "two"]);
});

test("treats absent, disabled, and empty definitions as unavailable", () => {
  const config = requireConfig();
  assert.equal(config.resolve(standardKits().get("nursery"), books).reason, "unconfigured");
  assert.equal(config.resolve(standardKits({ nursery: { enabled: false, publicationIds: ["one"] } }).get("nursery"), books).reason, "unconfigured");
  assert.equal(config.resolve(standardKits({ nursery: { enabled: true, publicationIds: [] } }).get("nursery"), books).reason, "unconfigured");
});

test("does not substitute missing or inactive configured publications", () => {
  const config = requireConfig();
  const provider = standardKits({ nursery: { enabled: true, publicationIds: ["one", "missing"] } });
  const result = config.resolve(provider.get("nursery"), [{ id: "one", active: false }]);
  assert.equal(result.available, false);
  assert.deepEqual(result.missingIds, ["one", "missing"]);
});

test("resolves only against the catalogue supplied by the selected source", () => {
  const config = requireConfig();
  const definition = standardKits({ lkg: { enabled: true, publicationIds: ["pilot-id"] } }).get("lkg");
  assert.equal(config.resolve(definition, [{ id: "static-id", active: true }]).available, false);
  assert.equal(config.resolve(definition, [{ id: "pilot-id", active: true }]).available, true);
});

test("does not expose customer composition editing and totals MRP only when complete", () => {
  const provider = standardKits({ nursery: { enabled: true, publicationIds: ["one"] } });
  assert.equal(typeof provider.set, "undefined");
  const config = requireConfig();
  assert.equal(config.mrpTotal([{ mrp: 120 }, { mrp: 80 }]), 200);
  assert.equal(config.mrpTotal([{ mrp: 120 }, {}]), null);
});

function requireConfig() {
  const sandbox = createBrowserSandbox();
  loadBrowserScript(sandbox, "js/standard-kit-config.js");
  return sandbox.window.CambridgeStandardKitConfig;
}
