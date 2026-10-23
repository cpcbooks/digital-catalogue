/* CPC Digital Catalogue — source bootstrap
 * Supabase is the customer catalogue. Static remains an explicit compatibility fallback.
 */
(function (global) {
  "use strict";

  const ROUTE_HASH = "#cpc-route=";
  const LOCAL_CATALOGUE_PAGES = new Set([
    "index", "browse", "book-details", "early-learning", "early-learning-level",
    "early-learning-books", "standard-kit", "kit-builder", "kit-review", "school-education",
    "school-learning", "school-books", "exam-preparation", "college-university", "college-books",
    "competitive-exams", "competitive-exam-books", "order", "request", "request-details", "review-request", "privacy"
  ]);

  function restoreRouteContext() {
    const hash = String(global.location.hash || "");
    if (!hash.startsWith(ROUTE_HASH)) return;
    try {
      const query = decodeURIComponent(hash.slice(ROUTE_HASH.length));
      if (!/^[^#]*$/.test(query)) return;
      const path = global.location.pathname.split("/").pop() || "index.html";
      global.history.replaceState(null, "", path + (query ? "?" + query : ""));
    } catch (_) { /* A malformed route fragment is not navigation context. */ }
  }

  restoreRouteContext();
  const params = new URLSearchParams(global.location.search);
  const requestedSource = params.get("catalogueSource") === "static" ? "static" : "supabase";
  const sourceWasExplicit = params.has("catalogueSource");
  const config = global.CPC_CATALOGUE_CONFIG || {};
  const CACHE_KEY = "cpc_catalogue_supabase_v2";
  const CACHE_TTL_MS = 10 * 60 * 1000;
  let pending = null;

  function readCache() {
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
      if (!cached || !Array.isArray(cached.books) || !cached.savedAt) return null;
      if (Date.now() - cached.savedAt > CACHE_TTL_MS) {
        sessionStorage.removeItem(CACHE_KEY);
        return null;
      }
      return cached.books;
    } catch (_) { return null; }
  }

  function writeCache(books) {
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), books })); }
    catch (_) { /* Cache is an optimization only. */ }
  }

  function installSupabaseBooks(books) {
    global.CAMBRIDGE_CATALOGUE = books;
    if (global.CambridgeSelection) global.CambridgeSelection.reconcileCatalogue(books);
  }

  async function ready() {
    if (requestedSource === "static") {
      return { source: "static", books: global.CAMBRIDGE_CATALOGUE || [], cached: false };
    }

    const cached = readCache();
    if (cached) {
      installSupabaseBooks(cached);
      return { source: "supabase", books: cached, cached: true };
    }

    if (!global.CambridgeSupabaseCatalogue) throw new Error("Supabase catalogue adapter is not loaded.");
    if (!pending) {
      pending = global.CambridgeSupabaseCatalogue.load({
        supabaseUrl: config.supabaseUrl,
        anonKey: config.publishableKey
      }).then(books => {
        writeCache(books);
        return books;
      }).finally(() => { pending = null; });
    }
    const books = await pending;
    installSupabaseBooks(books);
    return { source: "supabase", books, cached: false };
  }
  async function standardKitDefinitions() {
    if (requestedSource !== "supabase") return [];
    if (!global.CambridgeSupabaseCatalogue) throw new Error("Supabase catalogue adapter is not loaded.");
    return global.CambridgeSupabaseCatalogue.loadStandardKitDefinitions({
      supabaseUrl: config.supabaseUrl,
      anonKey: config.publishableKey
    });
  }

  // Keep an explicit compatibility choice through local catalogue navigation.
  // The default customer catalogue is Supabase and keeps ordinary URLs clean.
  function withSource(href) {
    if (!sourceWasExplicit || !href) return href;
    try {
      const target = new URL(href, global.location.href);
      if (target.origin !== new URL(global.location.href).origin) return href;
      if (target.hash.startsWith(ROUTE_HASH)) {
        const context = new URLSearchParams(decodeURIComponent(target.hash.slice(ROUTE_HASH.length)));
        context.forEach((value, key) => target.searchParams.set(key, value));
        target.hash = "";
      }
      target.searchParams.set("catalogueSource", requestedSource);
      const query = target.searchParams.toString();
      if (!query) return target.pathname.split("/").pop() + target.hash;
      return target.pathname.split("/").pop() + ROUTE_HASH + encodeURIComponent(query);
    } catch (_) { return href; }
  }

  function localReturnHref(href) {
    try {
      const current = new URL(global.location.href);
      const target = new URL(href, current);
      const directory = current.pathname.slice(0, current.pathname.lastIndexOf("/") + 1);
      const targetDirectory = target.pathname.slice(0, target.pathname.lastIndexOf("/") + 1);
      const filename = target.pathname.split("/").pop() || "index";
      const page = filename.replace(/\.html$/i, "");
      if (target.origin !== current.origin || targetDirectory !== directory || !LOCAL_CATALOGUE_PAGES.has(page)) return null;
      target.searchParams.delete("catalogueSource");
      return withSource(target.pathname.split("/").pop() + target.search + target.hash);
    } catch (_) { return null; }
  }

  global.CambridgeCatalogueBootstrap = Object.freeze({
    requestedSource,
    ready,
    standardKitDefinitions,
    withSource,
    localReturnHref,
    clearCache: function () { try { sessionStorage.removeItem(CACHE_KEY); } catch (_) {} }
  });
})(window);
