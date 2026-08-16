/* Cambridge Digital Catalogue — shared data-access/query layer.
   Canonical school-stage model: `class` is an array; there is no runtime
   `levels` field. Legacy source records are normalized immediately here until
   the source file itself is physically cleaned. */
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

  function canonicalize(book) {
    if (!book || typeof book !== "object" || Array.isArray(book)) return book;

    if (!Array.isArray(book.class)) {
      const direct = normalizeClass(book.class);
      if (direct) book.class = [direct];
      else if (book.category === "early-learning" && Array.isArray(book.levels)) {
        book.class = book.levels.length
          ? [...new Set(book.levels.map(normalizeClass).filter(Boolean))]
          : ["Nursery", "LKG", "UKG"];
      } else book.class = [];
    } else {
      book.class = [...new Set(book.class.map(normalizeClass).filter(Boolean))];
    }

    if (book.category === "school") book.medium = "English";
    if (book.category === "exam" && String(book.medium || "").trim().toLowerCase() === "hindi") book.medium = "English";
    if (Object.prototype.hasOwnProperty.call(book, "levels")) delete book.levels;
    return book;
  }

  function ensureCanonical() {
    if (!Array.isArray(global.CAMBRIDGE_CATALOGUE)) return [];
    global.CAMBRIDGE_CATALOGUE.forEach(canonicalize);
    return global.CAMBRIDGE_CATALOGUE;
  }

  ensureCanonical();

  function all() {
    return ensureCanonical();
  }

  function active() {
    return all().filter(book => book && book.active !== false);
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
})(window);
