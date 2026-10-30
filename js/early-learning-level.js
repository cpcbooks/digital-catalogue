(async function () {
  "use strict";
  const Bootstrap = window.CambridgeCatalogueBootstrap, KitConfig = window.CambridgeEarlyLearningKitConfig;
  async function standardKitConfig() {
    if (window.CambridgeStandardKitConfig) return window.CambridgeStandardKitConfig;
    await new Promise((resolve, reject) => { const script = document.createElement("script"); script.src = "js/standard-kit-config.js"; script.onload = resolve; script.onerror = reject; document.head.appendChild(script); });
    return window.CambridgeStandardKitConfig;
  }
  const stageCodes = ["playgroup", "nursery", "lkg", "ukg"], fallbackLabels = { playgroup: "Playgroup", nursery: "Nursery", lkg: "LKG", ukg: "UKG" };
  const params = new URLSearchParams(location.search);
  let level = params.get("level") || "nursery";
  if (!stageCodes.includes(level)) level = "nursery";
  const config = KitConfig && KitConfig.getStageConfig(level), displayName = config ? config.displayName : fallbackLabels[level];
  document.getElementById("title").textContent = displayName + " Publications";
  document.getElementById("intro").textContent = "Browse Cambridge publications available for " + displayName + ".";
  const tabs = document.getElementById("tabs");
  stageCodes.forEach(code => { const stageConfig = KitConfig && KitConfig.getStageConfig(code), a = document.createElement("a"); a.href = Bootstrap.withSource("?level=" + code); a.textContent = stageConfig ? stageConfig.displayName : fallbackLabels[code]; if (code === level) a.className = "active"; tabs.appendChild(a); });
  const grid = document.getElementById("grid"), standardUrl = Bootstrap.withSource("standard-kit.html?level=" + encodeURIComponent(level)), individualUrl = Bootstrap.withSource("early-learning-books.html?level=" + encodeURIComponent(level));
  const standard = document.createElement("article"); standard.className = "choice-card"; standard.innerHTML = '<div class="choice-label">READY-MADE</div><h2>Cambridge Standard Kit</h2><p>A carefully selected combination of Cambridge books for this level.</p><span class="standard-unavailable">Checking availability…</span>'; grid.appendChild(standard);
  const custom = document.createElement("article"), guidance = KitConfig && KitConfig.landingGuidance(config); custom.className = "choice-card custom-kit"; custom.innerHTML = '<div class="choice-label">PERSONALISE</div><h2>Build Your Own Kit</h2><p>Choose books from our range and create a combination that suits your requirement.</p><div class="kit-rule">' + (guidance ? guidance.text : "Custom Kit is unavailable for this level.") + "</div>"; if (guidance && guidance.available) { const customLink = document.createElement("a"); customLink.href = Bootstrap.withSource("kit-builder.html?level=" + encodeURIComponent(level)); customLink.textContent = "Build My Kit →"; custom.appendChild(customLink); } grid.appendChild(custom);
  const individual = document.createElement("article"); individual.className = "choice-card"; individual.innerHTML = '<div class="choice-label">EXPLORE</div><h2>Individual Books</h2><p>Browse the complete range and select individual books according to your requirement.</p><a href="' + individualUrl + '">Browse Books →</a>'; grid.appendChild(individual);
  try {
    const StandardKitConfig = await standardKitConfig();
    const [catalogue, definitions] = await Promise.all([Bootstrap.ready(), Bootstrap.standardKitDefinitions()]);
    const provider = Bootstrap.requestedSource === "supabase" ? StandardKitConfig.createProvider(Object.fromEntries(definitions.map(definition => [definition.stageCode, definition]))) : StandardKitConfig;
    const available = StandardKitConfig.resolve(provider.get(level), catalogue.books).available;
    if (available) { standard.querySelector(".standard-unavailable").replaceWith(Object.assign(document.createElement("a"), { href: standardUrl, textContent: "View Standard Kit →" })); window.CambridgeInnerPageRefinement?.activateCard(standard); }
    else { standard.classList.add("is-unavailable"); standard.querySelector(".choice-label").textContent = "COMING SOON"; standard.querySelector("p").textContent = "A Cambridge Standard Kit is not available for this stage yet."; standard.querySelector(".standard-unavailable").textContent = "Coming Soon"; }
  } catch (_) {
    standard.classList.add("is-unavailable"); standard.querySelector(".choice-label").textContent = "AVAILABILITY PENDING"; standard.querySelector(".standard-unavailable").textContent = "Check again shortly";
  }
})();
