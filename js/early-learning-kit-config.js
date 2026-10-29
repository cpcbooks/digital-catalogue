/* CPC Digital Catalogue — local Early Learning Custom Kit stage configuration.
   This browser-local provider matches the shape a future stage-config data source
   will supply; it intentionally contains no Supabase access. */
(function (global) {
  "use strict";

  const STAGES = Object.freeze({
    playgroup: Object.freeze({ stageCode: "playgroup", displayName: "Playgroup", enabled: true, minimumDistinctTitles: 8, completionEnabled: true }),
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

  function groupBooksForDisplay(books) {
    const available = Array.isArray(books) ? books.filter(Boolean) : [];
    return available.length ? [{ title: "Choose Books", description: "", books: available }] : [];
  }

  function createProvider(stageConfigs) {
    function getStageConfig(value) {
      const config = stageConfigs[stageCode(value)] || null;
      return config && config.enabled === true ? config : null;
    }

    return Object.freeze({ getStageConfig });
  }

  function landingGuidance(config) {
    if (!config) return { available: false, text: "Custom Kit is unavailable for this level." };
    if (!config.completionEnabled || !Number.isInteger(config.minimumDistinctTitles) || config.minimumDistinctTitles < 1) {
      return { available: true, text: "Custom Kit completion is not configured for this level." };
    }
    return { available: true, text: "Minimum " + config.minimumDistinctTitles + " books required to create a kit" };
  }

  global.CambridgeEarlyLearningKitConfig = Object.freeze({
    ...createProvider(STAGES),
    createProvider,
    landingGuidance,
    belongsToStage,
    isEligible,
    groupBooksForDisplay
  });
})(window);
