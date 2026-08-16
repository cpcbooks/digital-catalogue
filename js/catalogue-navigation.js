/* Cambridge Digital Catalogue — shared browsing/navigation state.
   Restores the user's browsing context after viewing a book. */
(function (global) {
  "use strict";

  const PREFIX = "cambridge.catalogue.viewState:";

  function pageKey(url) {
    try {
      const u = new URL(url || global.location.href, global.location.href);
      return u.pathname + u.search;
    } catch (_) {
      return global.location.pathname + global.location.search;
    }
  }

  function storageKey(url) {
    return PREFIX + pageKey(url);
  }

  function read(url) {
    try {
      const raw = sessionStorage.getItem(storageKey(url));
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function save(extra) {
    const state = Object.assign({
      url: pageKey(),
      scrollY: Math.max(0, Math.round(global.scrollY || global.pageYOffset || 0)),
      savedAt: Date.now()
    }, extra || {});
    try { sessionStorage.setItem(storageKey(), JSON.stringify(state)); } catch (_) {}
    return state;
  }

  function restore(options) {
    const opts = options || {};
    const state = read();
    if (!state) return null;

    if (typeof opts.apply === "function") opts.apply(state);

    const y = Number(state.scrollY);
    if (Number.isFinite(y) && y > 0) {
      // Rendering may finish after DOMContentLoaded, so restore after layout settles.
      requestAnimationFrame(() => requestAnimationFrame(() => global.scrollTo(0, y)));
    }
    return state;
  }

  function captureBookLink(link, extra) {
    if (!link) return;
    link.addEventListener("click", function () { save(extra); });
  }

  function captureBookLinks(root, getExtra) {
    (root || document).addEventListener("click", function (event) {
      const link = event.target.closest && event.target.closest('a.view-book[href*="book-details.html"]');
      if (!link) return;
      const extra = typeof getExtra === "function" ? getExtra() : null;
      save(extra || {});
    });
  }

  function backTarget(fallback) {
    const from = new URLSearchParams(global.location.search).get("from");
    return from || fallback || "index.html";
  }

  global.CambridgeCatalogueNavigation = Object.freeze({
    save,
    read,
    restore,
    captureBookLink,
    captureBookLinks,
    backTarget,
    pageKey
  });
})(window);
