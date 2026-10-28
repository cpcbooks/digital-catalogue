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
    style.href = "css/ux-refinement.css";
    document.head.appendChild(style);
  }
  function addSearchAssets() {
    if (global.CambridgeCatalogueQuery) {
      addRefinementAsset("js/catalogue-search-suggestions.js", "catalogue-search-suggestions");
      return;
    }
    if (document.getElementById("catalogue-query-for-search")) return;
    const query = document.createElement("script");
    query.id = "catalogue-query-for-search";
    query.src = "js/catalogue-query.js";
    query.onload = () => addRefinementAsset("js/catalogue-search-suggestions.js", "catalogue-search-suggestions");
    document.head.appendChild(query);
  }
  function structureFooter(bootstrap) {
    const footer = document.querySelector("footer");
    const note = footer && footer.querySelector(".footer-note");
    if (!footer || !note || footer.querySelector(".footer-links")) return;
    const links = document.createElement("nav");
    links.className = "footer-links";
    links.setAttribute("aria-label", "Catalogue links");
    [["Browse Publications", "browse.html"], ["Early Learning", "early-learning.html"], ["School Learning", "school-education.html"], ["My Selection", "order.html"], ["Privacy Notice", "privacy.html"]].forEach(([label, href]) => {
      const link = document.createElement("a");
      link.href = bootstrap ? bootstrap.withSource(href) : href;
      link.textContent = label;
      links.appendChild(link);
    });
    const legal = document.createElement("div");
    legal.className = "footer-meta";
    note.textContent = "Digital Catalogue 2026–27";
    const copyright = document.createElement("p");
    copyright.className = "footer-copyright";
    copyright.textContent = "© 2026 Cambridge Publishing Company Pvt. Ltd.";
    legal.append(copyright, note);
    footer.append(links, legal);
  }
  function apply() {
    const bootstrap = global.CambridgeCatalogueBootstrap;
    addRefinementStyles();
    addBrandLink(bootstrap);
    structureFooter(bootstrap);
    if (document.getElementById("homeSearch") || document.getElementById("browseSearch")) addSearchAssets();
    if (document.getElementById("kitName")) addRefinementAsset("js/kit-builder-refinement.js", "kit-builder-refinement");
    if (document.querySelector(".home-category.exams") || document.querySelector(".stage-hero .stage-grid")) addRefinementAsset("js/competitive-exams-refinement.js", "competitive-exams-refinement");
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
