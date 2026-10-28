(function (global) {
  "use strict";
  function suggestionBooks(books, query) {
    const text = String(query || "").trim();
    if (!text) return [];
    const sku = text.toUpperCase();
    if (/^(?:CPC)?\d+$/i.test(text)) return books.filter(book => String(book.sku || "").toUpperCase() === sku).slice(0, 6);
    const terms = text.toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return books.filter(book => terms.every(term => [book.title, book.series, book.subject, book.displaySubject, book.class, book.level, book.type, book.bookType, book.isbn].some(value => String(value || "").toLocaleLowerCase().includes(term)))).slice(0, 6);
  }
  function destination(book, bootstrap) {
    const returnTo = location.pathname.split("/").pop() + location.search;
    const href = "book-details.html?id=" + encodeURIComponent(book.id) + "&returnTo=" + encodeURIComponent(returnTo);
    return bootstrap ? bootstrap.withSource(href) : href;
  }
  function init() {
    const input = document.getElementById("catalogueSearch") || document.getElementById("browseSearch");
    if (!input || input.dataset.suggestionsReady) return;
    input.dataset.suggestionsReady = "true";
    const form = input.closest("form") || input.parentElement;
    const bootstrap = global.CambridgeCatalogueBootstrap;
    const query = global.CambridgeCatalogueQuery;
    const list = document.createElement("div");
    let current = -1;
    list.className = "search-suggestions";
    list.id = input.id + "Suggestions";
    list.setAttribute("role", "listbox");
    list.hidden = true;
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-controls", list.id);
    form.appendChild(list);
    function books() { return query && query.active ? query.active() : []; }
    function close() { current = -1; list.hidden = true; list.replaceChildren(); input.removeAttribute("aria-activedescendant"); }
    function render() {
      const matches = suggestionBooks(books(), input.value);
      list.replaceChildren(); current = -1;
      if (!matches.length) { list.hidden = true; return; }
      matches.forEach((book, index) => {
        const item = document.createElement("a");
        item.className = "search-suggestion";
        item.id = list.id + "Option" + index;
        item.href = destination(book, bootstrap);
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", "false");
        item.innerHTML = '<span class="search-suggestion-title"></span><span class="search-suggestion-meta"></span>';
        item.firstChild.textContent = book.title || "Untitled publication";
        item.lastChild.textContent = [book.class || book.level, book.sku ? "SKU: " + book.sku : ""].filter(Boolean).join(" · ");
        list.appendChild(item);
      });
      const all = document.createElement("a");
      all.className = "search-suggestions-all";
      all.href = bootstrap ? bootstrap.withSource("browse.html?q=" + encodeURIComponent(input.value.trim())) : "browse.html?q=" + encodeURIComponent(input.value.trim());
      all.textContent = "View All Matching Publications";
      list.appendChild(all);
      list.hidden = false;
    }
    function select(index) {
      const options = [...list.querySelectorAll(".search-suggestion")];
      if (!options.length) return;
      current = (index + options.length) % options.length;
      options.forEach((option, position) => option.setAttribute("aria-selected", String(position === current)));
      input.setAttribute("aria-activedescendant", options[current].id);
      options[current].scrollIntoView({ block: "nearest" });
    }
    input.addEventListener("input", render);
    input.addEventListener("keydown", event => {
      if (event.key === "Escape") { close(); return; }
      if (event.key === "ArrowDown") { if (!list.hidden) { event.preventDefault(); select(current + 1); } return; }
      if (event.key === "ArrowUp") { if (!list.hidden) { event.preventDefault(); select(current - 1); } return; }
      if (event.key === "Enter" && current >= 0) { const option = list.querySelectorAll(".search-suggestion")[current]; if (option) { event.preventDefault(); option.click(); } }
    });
    input.addEventListener("blur", () => setTimeout(close, 120));
  }
  global.CambridgeCatalogueSuggestions = { suggestionBooks };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})(window);
