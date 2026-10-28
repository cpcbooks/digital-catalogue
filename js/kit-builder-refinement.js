(function () {
  "use strict";
  function apply() {
    const title = document.getElementById("pageTitle"), catalogue = document.getElementById("catalogue");
    if (!title || !catalogue || !catalogue.children.length || catalogue.dataset.continuousGrid) return;
    const stage = title.textContent.replace(/^Build Your\s+|\s+Kit$/g, "").trim();
    const cards = [...catalogue.querySelectorAll(".book-card")];
    if (!cards.length) return;
    const section = document.createElement("section"), heading = document.createElement("h2"), grid = document.createElement("div");
    section.className = "category kit-continuous-grid";
    heading.textContent = "Choose Books for Your " + stage + " Kit";
    grid.className = "book-grid";
    cards.forEach(card => grid.appendChild(card));
    section.append(heading, grid);
    catalogue.replaceChildren(section);
    catalogue.dataset.continuousGrid = "true";
  }
  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply); else apply();
})();
