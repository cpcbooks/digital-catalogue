/* CPC Digital Catalogue — source bootstrap
 * Static remains default. Supabase is enabled only when ?catalogueSource=supabase.
 */
(function (global) {
  "use strict";

  const params = new URLSearchParams(global.location.search);
  const requestedSource = params.get("catalogueSource");
  const config = global.CPC_CATALOGUE_CONFIG || {};
  const CACHE_KEY = "cpc_catalogue_supabase_v1";
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

  async function ready() {
    if (requestedSource !== "supabase") {
      return { source: "static", books: global.CAMBRIDGE_CATALOGUE || [], cached: false };
    }

    const cached = readCache();
    if (cached) {
      global.CAMBRIDGE_CATALOGUE = cached;
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
    global.CAMBRIDGE_CATALOGUE = books;
    return { source: "supabase", books, cached: false };
  }

  global.CambridgeCatalogueBootstrap = Object.freeze({
    requestedSource: requestedSource === "supabase" ? "supabase" : "static",
    ready,
    clearCache: function () { try { sessionStorage.removeItem(CACHE_KEY); } catch (_) {} }
  });
})(window);
