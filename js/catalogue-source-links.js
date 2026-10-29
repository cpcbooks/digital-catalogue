/* Carry an explicitly selected catalogue source through local catalogue links. */
(function (global) {
  "use strict";
  function addBrandLink(bootstrap) {
    const brand = document.querySelector(".catalogue-header > .brand");
    if (!brand) return;
    const link = document.createElement("a");
    link.className = "catalogue-header-brand";
    link.href = bootstrap ? bootstrap.withSource("index.html") : "index.html";
    link.setAttribute("aria-label", "Cambridge — Go to homepage");
    brand.parentNode.insertBefore(link, brand);
    link.appendChild(brand);
  }
  function addRefinementAsset(src, id) {
    if (document.getElementById(id)) return;
    const asset = document.createElement("script");
    asset.id = id;
    asset.src = src;
    asset.defer = true;
    document.head.appendChild(asset);
  }
  function addRefinementStyles() {
    if (document.getElementById("catalogue-ux-refinement")) return;
    const style = document.createElement("link");
    style.id = "catalogue-ux-refinement";
    style.rel = "stylesheet";
    style.href = "css/ux-refinement.css?v=ux2";
    document.head.appendChild(style);
  }
  function addSearchAssets() {
    if (global.CambridgeCatalogueQuery) {
      addRefinementAsset("js/catalogue-search-suggestions.js?v=ux2", "catalogue-search-suggestions");
      return;
    }
    if (document.getElementById("catalogue-query-for-search")) return;
    const query = document.createElement("script");
    query.id = "catalogue-query-for-search";
    query.src = "js/catalogue-query.js";
    query.onload = () => addRefinementAsset("js/catalogue-search-suggestions.js?v=ux2", "catalogue-search-suggestions");
    document.head.appendChild(query);
  }
  function addCompetitiveExamsAssets() {
    const addPage = () => addRefinementAsset("js/competitive-exams-refinement.js?v=ux3", "competitive-exams-refinement");
    if (global.CambridgeCatalogueQuery) { addPage(); return; }
    if (document.getElementById("catalogue-query-for-competitive-exams")) return;
    const query = document.createElement("script");
    query.id = "catalogue-query-for-competitive-exams";
    query.src = "js/catalogue-query.js";
    query.onload = addPage;
    document.head.appendChild(query);
  }
  function refineCompetitiveExamsLink(bootstrap) {
    const home = document.querySelector(".home-category.exams");
    if (!home) return;
    const shortcuts = home.querySelector(".home-shortcuts");
    if (shortcuts) shortcuts.remove();
    const link = home.querySelector(".category-link");
    if (link) link.href = bootstrap ? bootstrap.withSource("competitive-exams.html") : "competitive-exams.html";
  }
  function addPrivacyLink(bootstrap) {
    const footer = document.querySelector("footer");
    const note = footer && footer.querySelector(".footer-note");
    if (!footer || !note || footer.querySelector(".footer-meta")) return;
    const meta = document.createElement("div");
    const link = document.createElement("a");
    const separator = document.createElement("span");
    meta.className = "footer-meta";
    link.href = bootstrap ? bootstrap.withSource("privacy.html") : "privacy.html";
    link.textContent = "Privacy Notice";
    separator.className = "footer-separator";
    separator.setAttribute("aria-hidden", "true");
    separator.textContent = "·";
    meta.append(link, separator, note);
    footer.appendChild(meta);
  }
  function apply() {
    const bootstrap = global.CambridgeCatalogueBootstrap;
    addRefinementStyles();
    addBrandLink(bootstrap);
    addPrivacyLink(bootstrap);
    refineCompetitiveExamsLink(bootstrap);
    if (document.getElementById("homeSearch") || document.getElementById("browseSearch")) addSearchAssets();
    if (document.getElementById("kitName")) addRefinementAsset("js/kit-builder-refinement.js?v=ux2", "kit-builder-refinement");
    if (location.pathname.endsWith("/competitive-exams.html")) addCompetitiveExamsAssets();
    if (bootstrap && bootstrap.requestedSource === "supabase") {
      document.querySelectorAll("a[href]").forEach(link => {
        link.setAttribute("href", bootstrap.withSource(link.getAttribute("href")));
      });
      document.querySelectorAll("[data-href]").forEach(node => {
        node.dataset.href = bootstrap.withSource(node.dataset.href);
      });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})(window);
