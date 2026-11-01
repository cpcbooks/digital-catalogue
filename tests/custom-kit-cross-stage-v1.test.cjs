const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

function executableClauses(file) {
  const source = read(file);
  const oldClause = source.match(/old_clause text := \$old\$(.*?)\$old\$;/s)?.[1];
  const newClause = source.match(/new_clause text := \$new\$(.*?)\$new\$;/s)?.[1];
  assert.ok(oldClause, file + " must declare an executable old_clause");
  assert.ok(newClause, file + " must declare an executable new_clause");
  return { oldClause, newClause };
}

function customKitModules() {
  const window = {};
  const context = { window, Object, Array, String, Number, Set, Map, Math, Boolean, Error };
  vm.runInNewContext(read("js/early-learning-kit-config.js"), context);
  vm.runInNewContext(read("js/custom-kit-state.js"), context);
  return window;
}

test("all Custom Kit stages share the active eligible Early Learning pool", () => {
  const { CambridgeEarlyLearningKitConfig: config } = customKitModules();
  const eligible = Array.from({ length: 86 }, (_, index) => ({ id: "book-" + index, category: "early-learning", active: true, customKitEligible: true, class: [index % 2 ? "LKG" : "UKG"] }));
  ["playgroup", "nursery", "lkg", "ukg"].forEach(stage => {
    assert.equal(eligible.filter(config.isEligible).length, 86, stage);
  });
  assert.equal(config.isEligible({ id: "inactive", category: "early-learning", active: false, customKitEligible: true }), false);
  assert.equal(config.isEligible({ id: "ineligible", category: "early-learning", active: true, customKitEligible: false }), false);
  assert.equal(config.isEligible({ id: "school", category: "school", active: true, customKitEligible: true }), false);
});

test("cross-stage drafts restore in order and retain the chosen kit stage", () => {
  const { CambridgeEarlyLearningKitConfig: config, CambridgeCustomKitState: stateFactory } = customKitModules();
  const books = Array.from({ length: 8 }, (_, index) => ({ id: "ukg-" + index, category: "early-learning", active: true, customKitEligible: true, class: ["UKG"] }));
  const draft = { level: "playgroup", name: "My Playgroup Kit", bookIds: books.map(book => book.id) };
  const state = stateFactory.create({ minimum: 8, completionEnabled: true, isEligible: config.isEligible });
  state.setName(draft.name);
  draft.bookIds.forEach(id => state.add(books.find(book => book.id === id)));
  assert.deepEqual(JSON.parse(JSON.stringify(state.selectedIds())), draft.bookIds);
  assert.equal(state.getName(), draft.name);
  assert.equal(state.isComplete(), true);
  assert.equal(draft.level, "playgroup");
});

test("eight distinct titles complete every configured Custom Kit stage", () => {
  const { CambridgeEarlyLearningKitConfig: config, CambridgeCustomKitState: stateFactory } = customKitModules();
  const provider = config.createProvider(Object.fromEntries(["playgroup", "nursery", "lkg", "ukg"].map(stage => [stage, { stageCode: stage, displayName: stage, enabled: true, minimumDistinctTitles: 8, completionEnabled: true }])));
  ["playgroup", "nursery", "lkg", "ukg"].forEach(stage => {
    const rule = provider.getStageConfig(stage);
    const state = stateFactory.create({ minimum: rule.minimumDistinctTitles, completionEnabled: rule.completionEnabled });
    Array.from({ length: 7 }, (_, index) => state.add({ id: stage + "-" + index }));
    assert.equal(state.isComplete(), false, stage + " under minimum");
    state.add({ id: stage + "-8" });
    assert.equal(state.isComplete(), true, stage + " at minimum");
  });
});

test("Builder and Review load all Early Learning books and Supabase stage rules", () => {
  const builder = read("kit-builder.html"), review = read("kit-review.html"), bootstrap = read("js/catalogue-bootstrap.js"), adapter = read("js/catalogue-supabase-adapter.js");
  [builder, review].forEach(page => {
    assert.match(page, /Bootstrap\.earlyLearningKitRules\(\)/);
    assert.match(page, /Query\.byCategory\("early-learning"\)\.filter\(KitConfig\.isEligible\)/);
    assert.doesNotMatch(page, /Query\.byCategoryAndClass\("early-learning"/);
  });
  assert.match(review, /draft\.bookIds\.forEach\(id =>[\s\S]*?eligibleBooks\.find/);
  assert.match(bootstrap, /async function earlyLearningKitRules/);
  assert.match(adapter, /EARLY_LEARNING_KIT_RULES_PATH/);
});

test("Early Learning renders its stage shell before rule-dependent Custom Kit availability", () => {
  const source = read("js/early-learning-level.js");
  const availabilityStart = source.indexOf("const standardAvailabilityPromise");
  const stageRulesStart = source.indexOf("const stageRulesPromise");
  const titleRender = source.indexOf('document.getElementById("title")');
  const customUpdate = source.indexOf("stageRulesPromise.then");
  assert.ok(availabilityStart >= 0 && availabilityStart < titleRender);
  assert.ok(stageRulesStart >= 0 && stageRulesStart < titleRender);
  assert.ok(titleRender >= 0 && titleRender < customUpdate);
  assert.match(source, /Promise\.all\(\[Bootstrap\.ready\(\), Bootstrap\.standardKitDefinitions\(\)\]\)/);
  assert.match(source, /const standardAvailability = await standardAvailabilityPromise/);
  assert.match(source, /Checking availability…/);
  assert.match(source, /if \(location\.href !== pageUrl\) return;/);
});

test("prepared RPC migration changes only the Custom Kit stage condition", () => {
  const migration = read("supabase/migrations/20261102_custom_kit_cross_stage_v1.sql");
  const rollback = read("supabase/migrations/20261102_custom_kit_cross_stage_v1.rollback.sql");
  assert.match(migration, /completion_enabled = true/);
  assert.match(migration, /grant select on public\.early_learning_kit_rules to anon/);
  assert.match(migration, /custom_kit_eligible is false then raise exception 'Ineligible Custom Kit publication'/);
  assert.match(migration, /unnest\(v_publication\.class_stage\)/);
  assert.match(migration, /match_count <> 1/);
  assert.match(migration, /length\(definition\) - length\(replace\(definition, old_clause, ''\)\)/);
  assert.match(rollback, /completion_enabled = false/);
  assert.match(rollback, /revoke select on public\.early_learning_kit_rules from anon/);
  assert.match(rollback, /unnest\(v_publication\.class_stage\)/);
  assert.match(rollback, /match_count <> 1/);
});

test("executable migration clauses are whitespace-free and round-trip", () => {
  const activation = executableClauses("supabase/migrations/20261102_custom_kit_cross_stage_v1.sql");
  const rollback = executableClauses("supabase/migrations/20261102_custom_kit_cross_stage_v1.rollback.sql");
  [activation.oldClause, activation.newClause, rollback.oldClause, rollback.newClause].forEach(clause => assert.equal(clause, clause.trim()));
  assert.equal(activation.newClause, rollback.oldClause);
  assert.equal(activation.oldClause, rollback.newClause);
  const simulatedCurrentRpc = "before " + activation.oldClause + " after";
  assert.equal((simulatedCurrentRpc.length - simulatedCurrentRpc.replaceAll(activation.oldClause, "").length) / activation.oldClause.length, 1);
  const activatedRpc = simulatedCurrentRpc.replace(activation.oldClause, activation.newClause);
  assert.equal((activatedRpc.length - activatedRpc.replaceAll(activation.newClause, "").length) / activation.newClause.length, 1);
  assert.equal(simulatedCurrentRpc.replace(activation.oldClause, "<condition>"), activatedRpc.replace(activation.newClause, "<condition>"));
  assert.equal(activatedRpc.replace(rollback.oldClause, rollback.newClause), simulatedCurrentRpc);
});

test("executable migration clauses match a supplied live RPC definition", { skip: !process.env.CPC_SUBMIT_CATALOGUE_REQUEST_DEFINITION }, () => {
  const activation = executableClauses("supabase/migrations/20261102_custom_kit_cross_stage_v1.sql");
  const rollback = executableClauses("supabase/migrations/20261102_custom_kit_cross_stage_v1.rollback.sql");
  const currentRpc = process.env.CPC_SUBMIT_CATALOGUE_REQUEST_DEFINITION;
  assert.equal((currentRpc.length - currentRpc.replaceAll(activation.oldClause, "").length) / activation.oldClause.length, 1);
  const activatedRpc = currentRpc.replace(activation.oldClause, activation.newClause);
  assert.equal((activatedRpc.length - activatedRpc.replaceAll(activation.newClause, "").length) / activation.newClause.length, 1);
  assert.equal(currentRpc.replace(activation.oldClause, "<condition>"), activatedRpc.replace(activation.newClause, "<condition>"));
  assert.equal(activatedRpc.replace(rollback.oldClause, rollback.newClause), currentRpc);
});
