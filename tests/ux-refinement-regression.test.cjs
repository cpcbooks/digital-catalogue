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

test("mobile cards retain two columns with compact metadata and compact selection controls", () => {
  const source = read("js/catalogue-selection.js");
  const css = read("css/ux-refinement.css");
  const browserCss = read("css/publication-browser.css");
  assert.match(source, /compactMeta\.className = "book-meta-compact"/);
  assert.match(source, /sku\.className = "book-card-sku"/);
  assert.match(source, /shortLabel\.textContent = "\+ Add"/);
  assert.match(source, /aria-label", "Add " \+ \(book\.title \|\| "publication"\) \+ " to Selection"/);
  assert.match(css, /\.publication-card \.book-meta\{display:none\}/);
  assert.match(css, /\.publication-card \.book-meta-compact\{display:block/);
  assert.match(css, /\.publication-card \.add-book-short\{display:inline/);
  assert.match(css, /\.add-book-short\{display:none\}/);
  assert.match(browserCss, /@media\(max-width:319px\)\{\.publication-grid\{grid-template-columns:1fr/);
  assert.doesNotMatch(browserCss, /@media\(max-width:359px\)\{\.publication-grid\{grid-template-columns:1fr/);
});

test("choice cards have no desktop decoration and the floating selection summary stays compact", () => {
  const css = read("css/inner-pages-refinement.css");
  const selection = read("js/catalogue-selection.js");
  const pane = read("css/selection-pane.css");
  assert.match(css, /\.choice-card::before\{display:none\}/);
  assert.match(css, /\.choice-card \.choice-label\{display:none\}/);
  assert.match(css, /\.card-link::after\{content:"›";position:absolute;right:18px;top:50%;display:none/);
  assert.match(css, /\.card-link::after\{display:block;right:16px;z-index:3;pointer-events:none\}/);
  assert.match(selection, /link\.textContent = "View Selection"/);
  assert.match(selection, /new Intl\.NumberFormat\("en-IN"\)\.format\(count\)/);
  assert.match(selection, /separator\.textContent = " · ";/);
  assert.match(selection, /bar\.offsetHeight \+ \(mobile \? 20 : 16\)/);
  assert.match(selection, /left:auto;right:max\(10px,env\(safe-area-inset-right\)\);/);
  assert.match(selection, /width:auto;max-width:calc\(100% - 20px\);gap:8px/);
  assert.match(pane, /\[data-role="counts"\]\s*\{\s*display: inline-flex/);
  assert.match(pane, /padding-bottom: var\(--cambridge-floating-selection-clearance, 0px\) !important/);
  assert.match(selection, /min-height:44px/);
});

test("mobile Book Details places publication identity before a compact gallery", () => {
  const css = read("css/inner-pages-refinement.css");
  assert.match(css, /\.detail-wrap\{display:flex;flex-direction:column;align-items:stretch;gap:14px\}/);
  assert.match(css, /\.detail-info\{display:contents\}/);
  assert.match(css, /\.detail-eyebrow\{order:1/);
  assert.match(css, /\.detail-info h1\{order:2;font-size:24px/);
  assert.match(css, /\.gallery\{order:5;align-self:center;max-width:112px/);
  assert.match(css, /\.detail-action-wrap\{order:6;margin-top:0;padding:14px\}/);
  assert.match(css, /\.detail-meta\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\);gap:10px\}/);
  assert.match(css, /catalogue-breadcrumbs__current\{display:none\}/);
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

test("desktop catalogue headings use the approved shared scale and Early Learning listings retain level context", () => {
  const css = read("css/ux-refinement.css");
  const selection = read("js/catalogue-selection.js");
  assert.match(css, /@media\(min-width:761px\)\{\.stage-level-page \.page-hero h1,\.browse-hero h1\{font-size:38px;line-height:45px\}\}/);
  assert.match(selection, /page === "early-learning-level"\) return \{ label: "← Back to Early Learning", href: "early-learning\.html" \}/);
  assert.match(selection, /page === "early-learning-books"\) return level \? \{ label: "← Back to " \+ level, href: "early-learning-level\.html\?level=" \+ encodeURIComponent\(params\.get\("level"\)\) \}/);
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
  assert.match(css, /\.card-link>a,\.catalogue-inner-page \.category-card\.exam-card a\{display:block;position:absolute;inset:0/);
  assert.match(css, /\.gallery-nav\[hidden\]\{display:none\}/);
});

test("mobile Exam Preparation cards use the same transparent full-card link as School Books", () => {
  const css = read("css/inner-pages-refinement.css");
  assert.match(css, /\.card-link>a,\.catalogue-inner-page \.category-card\.exam-card a\{display:block;position:absolute;inset:0;z-index:2;padding:0;border:0;background:transparent;color:transparent\}/);
});
test("workflow actions keep their routes, summaries and retryable submission contract", () => {
  const order = read("order.html");
  const request = read("request.html");
  const review = read("review-request.html");
  const inner = read("css/inner-pages-refinement.css");
  assert.match(order, /function requestHref\(\)/);
  assert.match(order, /nav\.style\.display=order\.length\?"flex":"none"/);
  assert.match(order, /Continue to Requirement Details/);
  assert.doesNotMatch(order, /class="continue-button"/);
  assert.match(order, /class="order-sticky-action"/);
  assert.match(order, /const canContinue=order\.length>0&&\(counts\.copies>0\|\|counts\.kitSets>0\)/);
  assert.match(order, /sticky&&mobile&&!sticky\.hidden\?sticky\.offsetHeight\+20/);
  assert.match(order, /window\.addEventListener\("scroll",updateStickyClearance/);
  assert.match(order, /order-sticky-clearance/);
  assert.match(inner, /has\(\.request-section\) \.hero-nav>a:first-child/);
  assert.match(inner, /has\(\.review-section\) \.review-hero \.back-link/);
  assert.match(inner, /has\(\.order-section\) \.order-nav\{flex-direction:column;align-items:flex-start/);
  assert.match(request, /← Back to Selection/);
  assert.match(request, /workflow-breadcrumb[^>]*><a class="home" href="index\.html">Home<\/a>/);
  assert.match(review, /← Back to Requirement Details/);
  assert.match(review, /workflow-breadcrumb[^>]*><a class="home" href="index\.html">Home<\/a>/);
  assert.match(review, /id="sendRequestButton">Send Requirement/);
  assert.match(review, /button\.disabled=false;submitting=false/);
  assert.doesNotMatch(review, /turnstile|captcha/i);
});
