const test = require("node:test");
const assert = require("node:assert/strict");
const { createBrowserSandbox, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");

function validator() {
  const sandbox = createBrowserSandbox();
  loadBrowserScript(sandbox, "js/catalogue-validator.js");
  return sandbox.window.CambridgeCatalogueValidator;
}

function validRecord(overrides = {}) {
  return Object.assign({
    id: "30000000-0000-4000-8000-000000000001",
    title: "Synthetic School Science",
    category: "school",
    class: ["5"],
    subject: "Science",
    medium: "English",
    active: true,
    mrp: 200
  }, overrides);
}

test("accepts a valid current canonical catalogue record", () => {
  const report = validator().validateCatalogue([validRecord()]);
  assert.equal(report.valid, true);
  assert.equal(report.summary.errors, 0);
});

test("reports duplicate identifiers and invalid class structure", () => {
  const report = validator().validateCatalogue([
    validRecord(),
    validRecord({ title: "Duplicate", class: "5" })
  ]);
  assert.equal(report.valid, false);
  assert.ok(report.errors.some(issue => issue.code === "DUPLICATE_ID"));
  assert.ok(report.errors.some(issue => issue.code === "CLASS_NOT_ARRAY"));
});
