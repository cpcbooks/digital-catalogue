const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { createBrowserSandbox, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");

test("Early Learning landing page uses the shared Kit configuration and source-aware Builder route", () => {
  const page = fs.readFileSync(path.join(__dirname, "..", "early-learning-level.html"), "utf8");
  const script = fs.readFileSync(path.join(__dirname, "..", "js", "early-learning-level.js"), "utf8");
  assert.match(page, /js\/early-learning-kit-config\.js/);
  assert.match(page, /js\/early-learning-level\.js/);
  assert.match(script, /KitConfig\.getStageConfig/);
  assert.match(script, /KitConfig\.landingGuidance\(config\)/);
  assert.match(script, /Bootstrap\.withSource\("kit-builder\.html\?level="\s*\+\s*encodeURIComponent\(level\)\)/);
  assert.doesNotMatch(page + script, /minimum\s*:\s*8|minimumDistinctTitles\s*:\s*8/);
});

test("landing guidance and Builder state use the same configured minimum", () => {
  const sandbox = createBrowserSandbox();
  loadBrowserScript(sandbox, "js/early-learning-kit-config.js");
  loadBrowserScript(sandbox, "js/custom-kit-state.js");
  const config = { enabled: true, minimumDistinctTitles: 3, completionEnabled: true };
  const state = sandbox.window.CambridgeCustomKitState.create({ minimum: config.minimumDistinctTitles, completionEnabled: config.completionEnabled });
  ["one", "two", "three"].forEach(id => state.add({ id }));
  assert.equal(sandbox.window.CambridgeEarlyLearningKitConfig.landingGuidance(config).text, "Minimum 3 books required to create a kit");
  assert.equal(state.isComplete(), true);
});
