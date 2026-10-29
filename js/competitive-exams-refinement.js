(function (global) {
  "use strict";
  function competitiveBooks(books) {
    return (books || []).filter(book => book && book.category === "competitive-exams");
  }
  function page() {
    const hero = document.querySelector(".stage-hero");
    if (!hero || document.getElementById("competitiveResults")) return null;
    hero.className = "page-hero competitive-exams-page";
    hero.innerHTML = '<div class="hero-inner"><nav class="context-nav" aria-label="Catalogue navigation"><a href="index.html">⌂ Home</a></nav><p class="eyebrow">EXAM PREPARATION RESOURCES</p><h1>Competitive Exams</h1><p class="hero-description">Explore Cambridge publications for competitive exam preparation.</p></div>';
    const content = document.createElement("section");
    content.className = "catalogue-section competitive-exams-page";
    content.innerHTML = '<div class="results-summary" id="competitiveSummary" hidden><h2>Publications</h2><p class="results-count" id="competitiveCount"></p></div><div id="competitiveResults"></div>';
    hero.after(content);
    if (global.CambridgeSelection) global.CambridgeSelection.setBreadcrumbs();
    return content;
  }
  function render(books) {
    const results = document.getElementById("competitiveResults");
    const summary = document.getElementById("competitiveSummary");
    const count = document.getElementById("competitiveCount");
    const selection = global.CambridgeSelection;
    if (!results || !summary || !count || !selection) return;
    results.replaceChildren();
    const matches = competitiveBooks(books);
    if (!matches.length) {
      const empty = document.createElement("div");
      empty.className = "competitive-empty";
      empty.innerHTML = "<h2>No publications available yet</h2><p>Competitive exam publications will appear here when available.</p>";
      results.appendChild(empty);
      return;
    }
    const grid = document.createElement("div");
    grid.className = "publication-grid";
    matches.forEach(book => grid.appendChild(selection.cardNode(book, [book.series, book.displaySubject || book.subject, book.type || book.bookType])));
    count.textContent = matches.length + (matches.length === 1 ? " publication" : " publications");
    summary.hidden = false;
    results.appendChild(grid);
  }
  async function start() {
    const content = page();
    const bootstrap = global.CambridgeCatalogueBootstrap;
    const query = global.CambridgeCatalogueQuery;
    if (!content || !bootstrap || !query) return;
    try { await bootstrap.ready(); }
    catch (error) {
      content.querySelector("#competitiveResults").innerHTML = '<div class="competitive-empty"><h2>Catalogue unavailable</h2><p>The catalogue could not be loaded. Please try again.</p></div>';
      return;
    }
    render(query.byCategory("competitive-exams"));
  }
  global.CambridgeCompetitiveExams = Object.freeze({ competitiveBooks, render });
  if (typeof document === "undefined") return;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})(window);
