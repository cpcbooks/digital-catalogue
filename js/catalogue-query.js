/* Cambridge Digital Catalogue — shared data-access/query layer.
   Canonical school-stage model: `class` is always an array.
   Nursery/LKG/UKG and Classes 1–10 use the same field. */
(function (global) {
  "use strict";

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

  function all() {
    return Array.isArray(global.CAMBRIDGE_CATALOGUE) ? global.CAMBRIDGE_CATALOGUE : [];
  }

  function active() {
    return all().filter(book => book && book.active !== false);
  }

  function classValues(book) {
    if (!book || !Array.isArray(book.class)) return [];
    return [...new Set(book.class.map(normalizeClass).filter(Boolean))];
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

  function browseValues(book, field) {
    if (field === "class") return classValues(book);
    const value = field === "type" ? book.type || book.bookType : book[field];
    return value ? [String(value)] : [];
  }

  function browseMatches(books, filters, search, categoryNames) {
    const activeFilters = filters || {};
    const names = categoryNames || {};
    const terms = String(search || "").trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return (books || []).filter(book => {
      if (Object.entries(activeFilters).some(([field, value]) => value && !browseValues(book, field).includes(value))) return false;
      if (!terms.length) return true;
      const classes = classValues(book);
      const searchable = [book.title, book.series, book.family, book.subject, book.displaySubject, book.type, book.bookType, book.medium, names[book.category], ...classes, ...classes.map(value => "Class " + value)].filter(Boolean).join(" ").toLocaleLowerCase();
      return terms.every(term => searchable.includes(term));
    });
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
    uniqueValues,
    browseValues,
    browseMatches
  });
})(window);
