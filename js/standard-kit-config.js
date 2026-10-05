/* CPC-defined Standard Kit contract. Real definitions remain empty until CPC
   supplies canonical publication IDs; a future source may provide the same shape. */
(function (global) {
  "use strict";

  const DEFINITIONS = Object.freeze({});
  const stageCode = value => String(value || "").trim().toLowerCase();

  function createProvider(definitions) {
    const source = definitions || {};
    function get(stage) {
      const definition = source[stageCode(stage)];
      return definition && definition.enabled === true && Array.isArray(definition.publicationIds) && definition.publicationIds.length
        ? Object.freeze({ stageCode: stageCode(definition.stageCode || stage), displayName: definition.displayName || "", enabled: true, publicationIds: Object.freeze(definition.publicationIds.map(String)) })
        : null;
    }
    return Object.freeze({ get });
  }

  function resolve(definition, books) {
    if (!definition || !definition.enabled || !Array.isArray(definition.publicationIds) || !definition.publicationIds.length) {
      return { available: false, reason: "unconfigured", books: [], missingIds: [] };
    }
    const byId = new Map((Array.isArray(books) ? books : []).map(book => [String(book.id), book]));
    const missingIds = definition.publicationIds.filter(id => { const book = byId.get(String(id)); return !book || book.active === false; });
    if (missingIds.length) return { available: false, reason: "unavailable", books: [], missingIds };
    return { available: true, reason: null, books: definition.publicationIds.map(id => byId.get(String(id))), missingIds: [] };
  }

  function mrpTotal(books) {
    const values = (Array.isArray(books) ? books : []).map(book => Number(book && book.mrp));
    return values.length && values.every(value => Number.isFinite(value) && value > 0)
      ? values.reduce((sum, value) => sum + value, 0)
      : null;
  }

  global.CambridgeStandardKitConfig = Object.freeze({ ...createProvider(DEFINITIONS), createProvider, resolve, mrpTotal, stageCode });
})(window);
