const test = require("node:test");
const assert = require("node:assert/strict");
const { createBrowserSandbox, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");

function config() {
  const sandbox = createBrowserSandbox();
  loadBrowserScript(sandbox, "js/early-learning-kit-config.js");
  return sandbox.window.CambridgeEarlyLearningKitConfig;
}

test("keeps the current Nursery, LKG, and UKG completion minimum at eight", () => {
  const provider = config();
  for (const stage of ["nursery", "lkg", "ukg"]) {
    const stageConfig = provider.getStageConfig(stage);
    assert.equal(stageConfig.enabled, true);
    assert.equal(stageConfig.minimumDistinctTitles, 8);
    assert.equal(stageConfig.completionEnabled, true);
  }
});

test("includes Playgroup without inventing a completion minimum", () => {
  const stageConfig = config().getStageConfig("Playgroup");
  assert.equal(stageConfig.stageCode, "playgroup");
  assert.equal(stageConfig.displayName, "Playgroup");
  assert.equal(stageConfig.enabled, true);
  assert.equal(stageConfig.minimumDistinctTitles, null);
  assert.equal(stageConfig.completionEnabled, false);
});

test("does not expose a disabled stage as available for Custom Kit use", () => {
  const provider = config().createProvider({
    synthetic: Object.freeze({
      stageCode: "synthetic",
      displayName: "Synthetic",
      enabled: false,
      minimumDistinctTitles: 3,
      completionEnabled: true
    })
  });

  assert.equal(provider.getStageConfig("synthetic"), null);
});

test("keeps existing stage titles eligible unless explicitly opted out", () => {
  const provider = config();
  assert.equal(provider.belongsToStage({ class: ["NUR"] }, "Nursery"), true);
  assert.equal(provider.isEligible({ class: ["Nursery"] }, "Nursery"), true);
  assert.equal(provider.isEligible({ class: ["Nursery"], customKitEligible: null }, "Nursery"), true);
  assert.equal(provider.isEligible({ class: ["Nursery"], customKitEligible: true }, "Nursery"), true);
  assert.equal(provider.isEligible({ class: ["Nursery"], customKitEligible: false }, "Nursery"), false);
  assert.equal(provider.isEligible({ class: ["LKG"] }, "Nursery"), false);
});

test("groups every eligible Builder book once while preserving known subjects", () => {
  const provider = config();
  const categories = { English: "Readers", Mathematics: "Numbers" };
  const candidates = [
    { id: "english", class: ["LKG"], subject: "English" },
    { id: "blank", class: ["LKG"], subject: "" },
    { id: "unknown", class: ["LKG"], subject: "Art" },
    { id: "excluded", class: ["LKG"], subject: "Mathematics", customKitEligible: false }
  ].filter(book => provider.isEligible(book, "LKG"));
  const groups = provider.groupBooksForDisplay(candidates, categories);

  assert.deepEqual(JSON.parse(JSON.stringify(groups.map(group => [group.title, group.books.map(book => book.id)]))), [
    ["English", ["english"]],
    ["Other", ["blank", "unknown"]]
  ]);
  assert.deepEqual(groups.flatMap(group => group.books.map(book => book.id)), ["english", "blank", "unknown"]);
});
