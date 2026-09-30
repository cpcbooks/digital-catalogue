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
    return String(value || "").trim().toLocaleLowerCase();
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
    createProvider
  });
})(window);
