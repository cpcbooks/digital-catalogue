(function () {
  "use strict";
  function target() {
    const href = "browse.html?category=competitive-exams";
    return window.CambridgeCatalogueBootstrap ? window.CambridgeCatalogueBootstrap.withSource(href) : href;
  }
  function apply() {
    const home = document.querySelector(".home-category.exams");
    if (home) {
      const shortcuts = home.querySelector(".home-shortcuts");
      if (shortcuts) shortcuts.remove();
      const link = home.querySelector(".category-link");
      if (link) link.href = target();
    }
    const landing = document.querySelector(".stage-hero .stage-grid");
    if (landing) location.replace(target());
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply); else apply();
})();
