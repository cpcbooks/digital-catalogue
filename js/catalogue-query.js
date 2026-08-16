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

  // Query-driven browsing pages share the same navigation-state service.
  // Loading it here keeps page markup free from navigation implementation details.
  function enableNavigationState() {
    const start = () => {
      const Navigation = global.CambridgeCatalogueNavigation;
      if (!Navigation) return;
      Navigation.captureBookLinks(document, () => {
        const state = {};
        const search = document.getElementById("search");
        const subject = document.getElementById("subject");
        const family = document.getElementById("family");
        if (search) state.search = search.value;
        if (subject) state.subject = subject.value;
        if (family) state.family = family.value;
        return state;
      });

      // Allow the page's own DOMContentLoaded render to finish first.
      setTimeout(() => Navigation.restore({
        apply: state => {
          const search = document.getElementById("search");
          const subject = document.getElementById("subject");
          const family = document.getElementById("family");
          if (search && typeof state.search === "string") search.value = state.search;
          if (subject && typeof state.subject === "string") subject.value = state.subject;
          if (family && typeof state.family === "string") family.value = state.family;
          if (typeof global.render === "function") global.render();
        }
      }), 0);
    };

    if (global.CambridgeCatalogueNavigation) {
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
      else start();
      return;
    }

    const script = document.createElement("script");
    script.src = "js/catalogue-navigation.js?v=20260816-1";
    script.onload = () => {
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
      else start();
    };
    script.onerror = () => console.warn("Cambridge Catalogue: navigation-state module failed to load.");
    document.head.appendChild(script);
  }

  enableNavigationState();
})(window);
