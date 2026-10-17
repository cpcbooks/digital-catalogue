/* Carry an explicitly selected catalogue source through local catalogue links. */
(function (global) {
  "use strict";
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
    addPrivacyLink(bootstrap);
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
