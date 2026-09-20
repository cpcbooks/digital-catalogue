/* CPC Digital Catalogue — source bootstrap
 * Static remains default. Supabase is enabled only when ?catalogueSource=supabase.
 */
(function (global) {
  "use strict";

  const params = new URLSearchParams(global.location.search);
  const requestedSource = params.get("catalogueSource");
  const config = global.CPC_CATALOGUE_CONFIG || {};

  async function ready() {
    if (requestedSource !== "supabase") {
      return { source: "static", books: global.CAMBRIDGE_CATALOGUE || [] };
    }

    if (!global.CambridgeSupabaseCatalogue) {
      throw new Error("Supabase catalogue adapter is not loaded.");
    }

    const books = await global.CambridgeSupabaseCatalogue.load({
      supabaseUrl: config.supabaseUrl,
      anonKey: config.publishableKey
    });

    global.CAMBRIDGE_CATALOGUE = books;
    return { source: "supabase", books };
  }

  global.CambridgeCatalogueBootstrap = Object.freeze({
    requestedSource: requestedSource === "supabase" ? "supabase" : "static",
    ready
  });
})(window);
