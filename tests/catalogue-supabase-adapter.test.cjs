const test = require("node:test");
const assert = require("node:assert/strict");
const { createBrowserSandbox, loadBrowserScript } = require("./helpers/browser-script-sandbox.cjs");

function adapter() {
  const sandbox = createBrowserSandbox();
  loadBrowserScript(sandbox, "js/catalogue-supabase-adapter.js");
  return sandbox.window.CambridgeSupabaseCatalogue;
}

test("maps current publication sections to legacy catalogue categories", () => {
  const catalogue = adapter();
  assert.equal(catalogue.categoryFor({ catalogue_section: "Early Learning" }), "early-learning");
  assert.equal(catalogue.categoryFor({ catalogue_section: "School Learning", book_type: "Guide" }), "exam");
  assert.equal(catalogue.categoryFor({ catalogue_section: "School Learning", book_type: "Textbook" }), "school");
});

test("normalizes a Supabase publication row to the existing browser contract", () => {
  const catalogue = adapter();
  const book = catalogue.toLegacyBook({
    id: "20000000-0000-4000-8000-000000000001",
    title: "Synthetic Nursery Numbers",
    catalogue_section: "Early Learning",
    book_type: "Writing Book",
    class_stage: [" Nursery ", "Nursery"],
    status: "Active",
    custom_kit_eligible: false,
    mrp: "135.50",
    pages: "32",
    author: null
  }, []);
  assert.equal(book.category, "early-learning");
  assert.deepEqual(Array.from(book.class), ["Nursery"]);
  assert.equal(book.type, "Writing");
  assert.equal(book.mrp, 135.5);
  assert.equal(book.pages, 32);
  assert.equal(book.active, true);
  assert.equal(book.customKitEligible, false);
});

test("preserves explicit and compatibility Custom Kit eligibility values", () => {
  const catalogue = adapter();
  assert.equal(catalogue.toLegacyBook({ custom_kit_eligible: true }, []).customKitEligible, true);
  assert.equal(catalogue.toLegacyBook({ custom_kit_eligible: null }, []).customKitEligible, null);
  assert.equal(catalogue.toLegacyBook({}, []).customKitEligible, undefined);
});

test("uses an active primary cover and orders active sample-page assets", () => {
  const catalogue = adapter();
  const book = catalogue.toLegacyBook({ id: "20000000-0000-4000-8000-000000000002", title: "Synthetic Assets", status: "Active" }, [
    { asset_type: "cover", url: "https://assets.example.test/first.png", active: true, sort_order: 2 },
    { asset_type: "cover", url: "https://assets.example.test/primary.png", active: true, is_primary: true, sort_order: 9 },
    { asset_type: "sample_page", url: "https://assets.example.test/page-two.png", active: true, sort_order: 2 },
    { asset_type: "sample_page", url: "https://assets.example.test/page-one.png", active: true, sort_order: 1 },
    { asset_type: "sample_page", url: "https://assets.example.test/inactive.png", active: false, sort_order: 0 }
  ]);
  assert.equal(book.cover, "https://assets.example.test/primary.png");
  assert.deepEqual(book.images.samples, ["https://assets.example.test/page-one.png", "https://assets.example.test/page-two.png"]);
});

test("normalizes Supabase Standard Kit definitions with configured publication order", () => {
  const catalogue = adapter();
  const definitions = catalogue.normalizeStandardKitDefinitions([
    { stage_code: "LKG", display_name: "Development LKG Standard Kit", enabled: true },
    { stage_code: "UKG", display_name: "Disabled UKG Kit", enabled: false }
  ], [
    { stage_code: "LKG", position: 2, publication_id: "second" },
    { stage_code: "LKG", position: 1, publication_id: "first" },
    { stage_code: "UKG", position: 1, publication_id: "ukg-book" }
  ]);

  assert.deepEqual(JSON.parse(JSON.stringify(definitions)), [
    { stage: "lkg", stageCode: "lkg", displayName: "Development LKG Standard Kit", enabled: true, publicationIds: ["first", "second"] },
    { stage: "ukg", stageCode: "ukg", displayName: "Disabled UKG Kit", enabled: false, publicationIds: ["ukg-book"] }
  ]);
});
