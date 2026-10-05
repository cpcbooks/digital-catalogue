const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("Standard Kit page obtains source-aware configuration from the shared bootstrap", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "js", "standard-kit.js"), "utf8");
  assert.match(source, /Bootstrap\.standardKitDefinitions\(\)/);
  assert.match(source, /Bootstrap\.requestedSource==="supabase"/);
  assert.doesNotMatch(source, /standard_kit_definitions|standard_kit_publications/);
});
