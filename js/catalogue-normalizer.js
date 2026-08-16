/* Cambridge Digital Catalogue — canonical runtime data normalizer
   Temporary migration bridge while legacy source records are cleaned.
   After this module runs, customer-facing code should see only the canonical
   `class` array model; legacy `levels` is removed from runtime records. */
(function (global) {
  "use strict";

  const EARLY_CLASS_MAP = Object.freeze({
    nursery: "Nursery",
    nur: "Nursery",
    lkg: "LKG",
    ukg: "UKG"
  });

  function normalizeClassValue(value) {
    if (value === null || value === undefined || value === "") return null;
    const raw = String(value).trim();
    if (!raw) return null;
    const lower = raw.toLowerCase();
    if (EARLY_CLASS_MAP[lower]) return EARLY_CLASS_MAP[lower];
    if (/^(?:[1-9]|10)$/.test(raw)) return raw;
    return raw;
  }

  function normalizeClassArray(book) {
    if (Array.isArray(book.class)) {
      return [...new Set(book.class.map(normalizeClassValue).filter(Boolean))];
    }

    const direct = normalizeClassValue(book.class);
    if (direct) return [direct];

    if (book.category === "early-learning" && Array.isArray(book.levels)) {
      if (book.levels.length) {
        return [...new Set(book.levels.map(normalizeClassValue).filter(Boolean))];
      }

      /* Preserve the catalogue's existing Early Learning behaviour: records
         whose old mapping was blank were offered across Nursery/LKG/UKG. */
      return ["Nursery", "LKG", "UKG"];
    }

    return [];
  }

  function normalizeMedium(book) {
    /* CPC rule: school textbooks are English-medium publications. A language
       subject such as Kannada/Hindi does not make the publication that medium. */
    if (book.category === "school") return "English";

    /* Current CPC exam/guide catalogue uses English/Kannada medium variants.
       Legacy Hindi-subject rows incorrectly used Hindi as medium. */
    if (book.category === "exam" && String(book.medium || "").trim().toLowerCase() === "hindi") {
      return "English";
    }

    return book.medium == null ? "" : String(book.medium).trim();
  }

  function normalizeRecord(book) {
    if (!book || typeof book !== "object" || Array.isArray(book)) return book;
    book.class = normalizeClassArray(book);
    book.medium = normalizeMedium(book);
    if (Object.prototype.hasOwnProperty.call(book, "levels")) delete book.levels;
    return book;
  }

  function run() {
    if (!Array.isArray(global.CAMBRIDGE_CATALOGUE)) return [];
    global.CAMBRIDGE_CATALOGUE.forEach(normalizeRecord);
    return global.CAMBRIDGE_CATALOGUE;
  }

  global.CambridgeCatalogueNormalizer = Object.freeze({ run, normalizeClassValue });
  run();
})(window);
