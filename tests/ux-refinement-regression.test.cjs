const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

function browserModule(file, catalogue) {
  const window = { CAMBRIDGE_CATALOGUE: catalogue || [] };
  vm.runInNewContext(read(file), { window, Object, Array, String, Number, Set, Map, Math, Boolean, RegExp, Error });
  return window;
}

test("exact SKU search avoids partial SKU matches while retaining normal text search", () => {
  const books = [
    { id: "one", sku: "CPC00111", title: "Numbers for Early Learning", class: ["LKG"] },
    { id: "two", sku: "CPC00252", title: "Wondera Reading", class: ["1"] }
  ];
  const query = browserModule("js/catalogue-query.js", books).CambridgeCatalogueQuery;
  assert.deepEqual(query.browseMatches(books, {}, "001"), []);
  assert.deepEqual(query.browseMatches(books, {}, "CPC00252").map(book => book.id), ["two"]);
  assert.deepEqual(query.browseMatches(books, {}, "Wondera").map(book => book.id), ["two"]);
});

test("all Early Learning Custom Kit stages use the configured eight-title threshold", () => {
  const window = browserModule("js/early-learning-kit-config.js");
  vm.runInNewContext(read("js/custom-kit-state.js"), { window, Object, Array, String, Number, Set, Map, Math, Boolean, Error });
  ["playgroup", "nursery", "lkg", "ukg"].forEach(stage => {
    const config = window.CambridgeEarlyLearningKitConfig.getStageConfig(stage);
    assert.equal(config.minimumDistinctTitles, 8);
    assert.equal(config.completionEnabled, true);
    const state = window.CambridgeCustomKitState.create({ minimum: config.minimumDistinctTitles, completionEnabled: config.completionEnabled });
    Array.from({ length: 7 }, (_, index) => state.add({ id: stage + index }));
    assert.equal(state.canReview(), false);
    state.add({ id: stage + "eight" });
    assert.equal(state.canReview(), true);
  });
});

test("refinement assets retain the original footer, dedicated Competitive Exams page, and continuous kit grid", () => {
  const footer = read("js/catalogue-source-links.js");
  assert.match(footer, /function addPrivacyLink/);
  assert.match(footer, /footer-meta/);
  assert.doesNotMatch(footer, /footer-links/);
  const competitive = read("js/competitive-exams-refinement.js");
  assert.match(competitive, /<h1>Competitive Exams<\/h1>/);
  assert.match(competitive, /No publications available yet/);
  assert.doesNotMatch(competitive, /VAO|Land Surveyor|Other Exams|browse\.html\?category=competitive-exams/);
  const kit = read("js/kit-builder-refinement.js");
  assert.match(kit, /Choose Books for Your/);
  assert.doesNotMatch(kit, /Additional Early Learning books/);
  const search = read("js/catalogue-search-suggestions.js");
  assert.match(search, /View All Matching Publications/);
  assert.match(search, /ArrowDown/);
  assert.match(search, /Escape/);
});

test("homepage retains landing and level routes while Competitive Exams opens its dedicated page", () => {
  const links = read("js/catalogue-source-links.js");
  assert.match(links, /function refineCompetitiveExamsLink/);
  assert.match(links, /function addCompetitiveExamsAssets/);
  assert.match(links, /competitive-exams\.html/);
  assert.doesNotMatch(links, /function refineHomeCategoryLinks/);
  assert.match(links, /location\.pathname\.endsWith\("\/competitive-exams\.html"\)/);
  assert.doesNotMatch(links, /document\.querySelector\("\.stage-hero \.stage-grid"\)/);
  const search = read("js/catalogue-search-suggestions.js");
  assert.match(search, /await bootstrap\.ready\(\)/);
  assert.match(search, /bootstrap\.ready\(\)\.catch/);
  assert.match(search, /list\.addEventListener\("pointerdown"/);
  assert.match(search, /location\.assign\(option\.href\)/);
});

test("Competitive Exams selects only its future category records for the shared card grid", () => {
  const books = [{ id: "exam", category: "competitive-exams", title: "Exam Guide" }, { id: "school", category: "school", title: "School Guide" }];
  const window = browserModule("js/competitive-exams-refinement.js");
  assert.deepEqual(window.CambridgeCompetitiveExams.competitiveBooks(books).map(book => book.id), ["exam"]);
  assert.match(read("js/competitive-exams-refinement.js"), /selection\.cardNode/);
});

test("shared cards render approved metadata rows and a shared bottom group", () => {
  const source = read("js/catalogue-selection.js");
  assert.match(source, /const values = \[\["Class \/ level", classes\.join\(", "\)\], \["Series", book\.series \|\| book\.family\], \["Book type", book\.type \|\| book\.bookType\]\]/);
  assert.doesNotMatch(source, /const values = .*\["Category"/);
  assert.doesNotMatch(source, /const values = .*\["Subject"/);
  assert.match(source, /name\.className = "book-meta-label"/);
  assert.match(source, /text\.className = "book-meta-value"/);
  assert.match(source, /bottom\.className = "book-card-bottom"/);
  const css = read("css/ux-refinement.css");
  assert.match(css, /\.publication-card \.book-meta\{display:grid/);
  assert.match(css, /\.publication-card \.book-card-bottom\{margin-top:auto/);
  assert.doesNotMatch(css, /\.homepage \.footer-links/);
});

test("Option C+ promotes category names without changing stage-level titles", () => {
  const links = read("js/catalogue-source-links.js");
  assert.match(links, /title: "Early Learning", tagline: "Books for little learners\."/);
  assert.match(links, /title: "School Learning", tagline: "Books for every school year\."/);
  assert.match(links, /title: "College & University", tagline: "Continue your academic journey\."/);
  assert.match(links, /document\.documentElement\.classList\.add\("stage-level-page"\)/);
  const competitive = read("js/competitive-exams-refinement.js");
  assert.match(competitive, /category-heading-group/);
  assert.match(competitive, /<h1>Competitive Exams<\/h1>/);
  assert.doesNotMatch(competitive, /<h1>Prepare with purpose\.<\/h1>/);
});

test("inner-page presentation layer is scoped, colour-coded, and preserves motion preferences", () => {
  const links = read("js/catalogue-source-links.js");
  const css = read("css/inner-pages-refinement.css");
  assert.match(links, /css\/inner-pages-refinement\.css/);
  assert.match(links, /document\.body\.classList\.add\("catalogue-inner-page"\)/);
  assert.match(links, /"early"/);
  assert.match(links, /"school"/);
  assert.match(links, /"exam"/);
  assert.match(links, /"college"/);
  assert.match(links, /"competitive"/);
  assert.match(css, /data-catalogue-tone="early"/);
  assert.match(css, /data-catalogue-tone="exam"/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(css, /\.homepage/);
});

test("Early Learning keeps unavailable Standard Kits non-actionable while preserving Custom Kit access", () => {
  const source = read("js/early-learning-level.js");
  const css = read("css/inner-pages-refinement.css");
  assert.match(source, /Bootstrap\.standardKitDefinitions\(\)/);
  assert.match(source, /StandardKitConfig\.resolve/);
  assert.match(source, /COMING SOON/);
  assert.match(source, /standard\.classList\.add\("is-unavailable"\)/);
  assert.match(source, /Build My Kit →/);
  assert.match(css, /\.choice-card\.custom-kit\{background:#fff/);
});

test("School listing back controls retain their valid class context", () => {
  const selection = read("js/catalogue-selection.js");
  ["1", "5", "7", "10"].forEach(classId => {
    assert.match(selection, /page === "school-books"\) return className \? \{ label: "← Back to " \+ className, href: "school-learning\.html\?class=" \+ encodeURIComponent\(params\.get\("class"\)\)/);
    assert.match(read("school-books.html"), /school-learning\.html\?class="\+encodeURIComponent\(normalized\)/);
    assert.match(read("exam-preparation.html"), /school-learning\.html\?class="\+encodeURIComponent\(c\)/);
    assert.match(read("school-books.html"), /Class "\+normalized/);
    assert.match(read("exam-preparation.html"), /Class "\+c/);
  });
  assert.match(selection, /page === "school-books"\).*Back to School Learning/s);
});

test("final consistency layer uses visible SVG card icons and approved contextual accents", () => {
  const links = read("js/catalogue-source-links.js");
  const css = read("css/inner-pages-refinement.css");
  assert.match(links, /function refineLandingCards/);
  assert.match(links, /<svg viewBox/);
  assert.match(links, /A playful start to learning\./);
  assert.match(links, /document\.querySelector\("\.notice"\)\?\.remove\(\)/);
  assert.match(css, /\.catalogue-card-icon\{display:grid/);
  assert.match(css, /\.category-card\.exam-card\{background:#fff/);
  assert.match(css, /data-catalogue-tone="early"\] \.progress-fill\{background:#d88936/);
});

test("mobile choice cards and image-free details retain honest, accessible fallbacks", () => {
  const links = read("js/catalogue-source-links.js");
  const details = read("js/book-details.js");
  const css = read("css/inner-pages-refinement.css");
  assert.match(links, /function activateCard/);
  assert.match(links, /Choose at least 8 titles/);
  assert.match(links, /No publications available yet/);
  assert.match(details, /Cover not yet available/);
  assert.match(details, /caption\.hidden=true/);
  assert.match(details, /nav\.hidden=true/);
  assert.match(css, /\.card-link>a\{display:block;position:absolute;inset:0/);
  assert.match(css, /\.gallery-nav\[hidden\]\{display:none\}/);
});
