/* CPC Digital Catalogue — local Early Learning Custom Kit stage configuration.
   This browser-local provider matches the shape a future stage-config data source
   will supply; it intentionally contains no Supabase access. */
(function (global) {
  "use strict";

  const STAGES = Object.freeze({
    playgroup: Object.freeze({ stageCode: "playgroup", displayName: "Playgroup", enabled: true, minimumDistinctTitles: null, completionEnabled: false }),
    nursery: Object.freeze({ stageCode: "nursery", displayName: "Nursery", enabled: true, minimumDistinctTitles: 8, completionEnabled: true }),
    lkg: Object.freeze({ stageCode: "lkg", displayName: "LKG", enabled: true, minimumDistinctTitles: 8, completionEnabled: true }),
    ukg: Object.freeze({ stageCode: "ukg", displayName: "UKG", enabled: true, minimumDistinctTitles: 8, completionEnabled: true })
  });

  function stageCode(value) {
    const code = String(value || "").trim().toLocaleLowerCase();
    return code === "nur" ? "nursery" : code;
  }

  function belongsToStage(book, stage) {
    const wanted = stageCode(stage);
    return Boolean(wanted && book && Array.isArray(book.class) && book.class.some(value => stageCode(value) === wanted));
  }

  // Compatibility contract: an absent future flag preserves today's eligible Early Learning titles.
  function isEligible(book, stage) {
    return belongsToStage(book, stage) && book.customKitEligible !== false;
  }

  function groupBooksForDisplay(books, categories) {
    const available = Array.isArray(books) ? books : [];
    const knownCategories = categories && typeof categories === "object" ? categories : {};
    const groups = Object.keys(knownCategories).map(subject => ({
      title: subject,
      description: knownCategories[subject],
      books: available.filter(book => book && book.subject === subject)
    })).filter(group => group.books.length);
    const otherBooks = available.filter(book => book && !Object.prototype.hasOwnProperty.call(knownCategories, book.subject));
    if (otherBooks.length) groups.push({ title: "Other", description: "Additional Early Learning books.", books: otherBooks });
    return groups;
  }

  function createProvider(stageConfigs) {
    function getStageConfig(value) {
      const config = stageConfigs[stageCode(value)] || null;
      return config && config.enabled === true ? config : null;
    }

    return Object.freeze({ getStageConfig });
  }

  global.CambridgeEarlyLearningKitConfig = Object.freeze({
    ...createProvider(STAGES),
    createProvider,
    belongsToStage,
    isEligible,
    groupBooksForDisplay
  });
})(window);
