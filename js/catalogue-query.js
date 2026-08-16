/* Cambridge Digital Catalogue — shared data-access/query layer.
   Pages should use this module instead of knowing storage/schema details.
   Canonical school-stage model: `class` is an array; there is no `levels` field. */
(function (global) {
  "use strict";

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
    if (upper === "NURSERY" || upper === "NUR") return "Nursery";
    if (upper === "LKG") return "LKG";
    if (upper === "UKG") return "UKG";
    if (/^(?:[1-9]|10)$/.test(raw)) return raw;
    return raw;
  }

  function classValues(book) {
    if (!book) return [];
    const values = Array.isArray(book.class) ? book.class : [book.class];
    return [...new Set(values.map(normalizeClass).filter(Boolean))];
  }

  function matchesClass(book, classValue) {
    const wanted = normalizeClass(classValue);
    if (!wanted) return true;
    return classValues(book).includes(wanted);
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
    const values = [];
    (books || []).forEach(book => {
      if (!book) return;
      const value = book[field];
      if (Array.isArray(value)) value.forEach(v => { if (v) values.push(v); });
      else if (value) values.push(value);
    });
    return [...new Set(values)];
  }

  global.CambridgeCatalogueQuery = Object.freeze({
    all,
    active,
    normalizeClass,
    classValues,
    matchesClass,
    byCategory,
    byCategoryAndClass,
    byId,
    uniqueValues
  });

  /* Ordinary catalogue -> View Book -> Back navigation is deliberately left
     to the browser's native history/scroll restoration. Do not persist/replay
     scroll positions in this query layer. */
})(window);
