/* CPC Digital Catalogue — source bootstrap
 * Static remains default. Supabase is enabled only when ?catalogueSource=supabase.
 */
(function (global) {
  "use strict";

  const ROUTE_HASH = "#cpc-route=";

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
  async function standardKitDefinitions() {
    if (requestedSource !== "supabase") return [];
    if (!global.CambridgeSupabaseCatalogue) throw new Error("Supabase catalogue adapter is not loaded.");
    return global.CambridgeSupabaseCatalogue.loadStandardKitDefinitions({
      supabaseUrl: config.supabaseUrl,
      anonKey: config.publishableKey
    });
  }

  // Keep an explicit pilot choice through local catalogue navigation. Static is
  // deliberately the default, so it does not add noise to ordinary URLs.
  function withSource(href) {
    if (requestedSource !== "supabase" || !href) return href;
    try {
      const target = new URL(href, global.location.href);
      if (target.origin !== new URL(global.location.href).origin) return href;
      if (target.hash.startsWith(ROUTE_HASH)) {
        const context = new URLSearchParams(decodeURIComponent(target.hash.slice(ROUTE_HASH.length)));
        context.forEach((value, key) => target.searchParams.set(key, value));
        target.hash = "";
      }
      target.searchParams.set("catalogueSource", "supabase");
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
      if (target.origin !== current.origin || targetDirectory !== directory || !/\.html$/i.test(target.pathname)) return null;
      target.searchParams.delete("catalogueSource");
      return withSource(target.pathname.split("/").pop() + target.search + target.hash);
    } catch (_) { return null; }
  }

  global.CambridgeCatalogueBootstrap = Object.freeze({
    requestedSource: requestedSource === "supabase" ? "supabase" : "static",
    ready,
    standardKitDefinitions,
    withSource,
    localReturnHref,
    clearCache: function () { try { sessionStorage.removeItem(CACHE_KEY); } catch (_) {} }
  });
})(window);
