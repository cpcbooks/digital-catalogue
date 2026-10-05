/* Carry an explicitly selected catalogue source through local catalogue links. */
(function (global) {
  "use strict";
  function apply() {
    const bootstrap = global.CambridgeCatalogueBootstrap;
    if (!bootstrap || bootstrap.requestedSource !== "supabase") return;
    document.querySelectorAll("a[href]").forEach(link => {
      link.setAttribute("href", bootstrap.withSource(link.getAttribute("href")));
    });
    document.querySelectorAll("[data-href]").forEach(node => {
      node.dataset.href = bootstrap.withSource(node.dataset.href);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})(window);
