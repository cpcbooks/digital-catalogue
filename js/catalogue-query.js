/* Cambridge Digital Catalogue — shared data-access/query layer.
   Pages should use this module instead of knowing storage/schema details.
   Backward compatibility for legacy Early Learning `levels` is isolated here. */
(function (global) {
  "use strict";

  const EARLY_CLASS_TO_LEGACY_LEVEL = {
    NUR: "nursery",
    LKG: "lkg",
    UKG: "ukg"
  };

  function all() {
    return Array.isArray(global.CAMBRIDGE_CATALOGUE) ? global.CAMBRIDGE_CATALOGUE : [];
  }

  function active() {
    return all().filter(book => book && book.active !== false);
  }

  function normalizeClass(value) {
    if (value === null || value === undefined || value === "") return "";
    const raw = String(value).trim();
    const upper = raw.toUpperCase();
    if (upper === "NURSERY" || upper === "NUR") return "NUR";
    if (upper === "LKG") return "LKG";
    if (upper === "UKG") return "UKG";
    if (/^(?:[1-9]|10)$/.test(raw)) return raw;
    return upper;
  }

  function matchesClass(book, classValue) {
    if (!book) return false;
    const wanted = normalizeClass(classValue);
    if (!wanted) return true;

    const direct = normalizeClass(book.class);
    if (direct) return direct === wanted;

    // Temporary compatibility only. Remove after verified Early Learning
    // records have been migrated from `levels` to `class`.
    const legacy = EARLY_CLASS_TO_LEGACY_LEVEL[wanted];
    if (!legacy || !Array.isArray(book.levels)) return false;
    return book.levels.length === 0 || book.levels.includes(legacy);
  }

  function byCategory(category) {
    return active().filter(book => book.category === category);
  }

  function byCategoryAndClass(category, classValue) {
    return byCategory(category).filter(book => matchesClass(book, classValue));
  }

  function byId(id) {
    const key = String(id || "").trim();
    return active().find(book => String(book.id || "") === key) || null;
  }

  function uniqueValues(books, field) {
    return [...new Set((books || []).map(book => book && book[field]).filter(Boolean))];
  }

  global.CambridgeCatalogueQuery = Object.freeze({
    all,
    active,
    normalizeClass,
    matchesClass,
    byCategory,
    byCategoryAndClass,
    byId,
    uniqueValues
  });
})(window);
