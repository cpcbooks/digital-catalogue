(function () {
  "use strict";

  const DISCOVERY_FIELDS = ["series", "subject", "type"];
  const VIEW_FIELDS = { series: "series", subject: "subject", type: "type" };
  const MEDIUM_TYPES = new Set(["Assessment Book", "Combined Guide", "Guide", "Question Bank"]);
  const VIEW_COPY = {
    series: ["Choose a series", "Select a series to see its available publications."],
    subject: ["Choose a subject", "Select a subject to see its available publications."],
    type: ["Choose a book type", "Select a verified book type to see its available publications."]
  };

  async function init() {
    const bootstrap = window.CambridgeCatalogueBootstrap;
    if (bootstrap) {
      try { await bootstrap.ready(); }
      catch (error) {
        console.error("Catalogue pilot load failed:", error);
        const summary = document.getElementById("browseSummary"), results = document.getElementById("browseResults");
        if (summary) summary.textContent = "Catalogue pilot could not be loaded.";
        if (results) results.innerHTML = '<div class="browse-empty"><h2>Unable to load pilot catalogue</h2><p>Check the pilot configuration and try again.</p></div>';
        return;
      }
    }

    const query = window.CambridgeCatalogueQuery;
    const books = query ? query.active() : [];
    const fields = Object.fromEntries(["category", "class", "series", "subject", "type", "medium"].map(key => [key, document.getElementById(key)]));
    const search = document.getElementById("browseSearch"), summary = document.getElementById("browseSummary"), results = document.getElementById("browseResults"), active = document.getElementById("browseActive"), discovery = document.getElementById("browseDiscovery"), refine = document.getElementById("browseRefine"), refineStatus = document.getElementById("browseRefineStatus"), mediumField = document.getElementById("mediumField"), tabs = [...document.querySelectorAll(".browse-tab")];
    const categoryNames = { "early-learning": "Early Learning", school: "School Learning", exam: "School Exam Preparation", "college-university": "College and University", "higher-education": "College and University", "competitive-exams": "Competitive Exams" };
    let view = "all";

    function textFor(field, value) { return field === "category" ? categoryNames[value] || value : value; }
    function sortValues(field, values) { return [...values].sort((a, b) => field === "class" ? query.classOrder(a) - query.classOrder(b) || a.localeCompare(b) : a.localeCompare(b)); }
    function setOptions(field, values, label) {
      const select = fields[field], selected = select.value;
      select.replaceChildren(new Option(label, ""));
      sortValues(field, values).forEach(value => select.add(new Option(textFor(field, value), value)));
      if (selected && ![...select.options].some(option => option.value === selected)) select.add(new Option(textFor(field, selected), selected));
      select.value = selected;
    }
    function allValues(field) { return [...new Set(books.flatMap(book => query.browseValues(book, field)))]; }
    function filters() { return Object.fromEntries(Object.entries(fields).map(([field, select]) => [field, select.value])); }
    function currentBrowseUrl() { const params = new URLSearchParams(location.search); params.delete("returnTo"); const text = params.toString(); return location.pathname.split("/").pop() + (text ? "?" + text : ""); }
    function hasActive(current) { return Boolean(search.value.trim() || Object.values(current).some(Boolean)); }
    function activeGeneralCount(current) { return ["category", "class", "medium"].filter(field => current[field]).length; }
    function requestedView(params) {
      const raw = params.get("view");
      if (raw === "subjects") return "subject";
      if (["all", "series", "subject", "type"].includes(raw)) return raw;
      return DISCOVERY_FIELDS.find(field => params.get(field)) || "all";
    }
    function matching(current, ignored) {
      const next = { ...current };
      (ignored || []).forEach(field => { next[field] = ""; });
      return query.browseMatches(books, next, search.value, categoryNames);
    }
    function discoveryValues(field, current) { return [...new Set(matching(current, [field]).flatMap(book => query.browseValues(book, field)))]; }
    function mediumValues(current) {
      return [...new Set(matching(current, ["medium"])
        .filter(book => MEDIUM_TYPES.has(book.type || book.bookType || "") && book.medium)
        .map(book => book.medium))];
    }
    function mediumIsApplicable(current) { return mediumValues(current).length > 1; }
    function refreshFacetOptions(current) {
      setOptions("class", [...new Set(matching(current, ["class"]).flatMap(book => query.browseValues(book, "class")))], "All classes and stages");
      setOptions("medium", mediumValues(current), "All media");
      mediumField.hidden = !mediumIsApplicable(current) && !fields.medium.value;
    }
    function maybeClearMedium(current) {
      if (current.medium && !mediumIsApplicable({ ...current, medium: "" })) fields.medium.value = "";
    }
    function writeUrl(current, mode) {
      const next = new URLSearchParams(location.search);
      ["view", "q", ...Object.keys(fields)].forEach(key => next.delete(key));
      next.set("view", view);
      if (search.value.trim()) next.set("q", search.value.trim());
      Object.entries(current).forEach(([field, value]) => { if (value) next.set(field, value); });
      history[mode === "push" ? "pushState" : "replaceState"](null, "", location.pathname + "?" + next.toString() + location.hash);
    }
    function restoreState() {
      const params = new URLSearchParams(location.search);
      view = requestedView(params);
      search.value = params.get("q") || "";
      Object.entries(fields).forEach(([field, select]) => {
        const requested = params.get(field);
        select.value = requested && [...select.options].some(option => option.value === requested) ? requested : "";
      });
    }
    function renderTabs() {
      tabs.forEach(tab => {
        const selected = tab.dataset.view === view;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
    }
    function renderDiscovery(current) {
      discovery.replaceChildren();
      if (view === "all") { discovery.hidden = true; return; }
      discovery.hidden = false;
      const [heading, copy] = VIEW_COPY[view], title = document.createElement("h2"), text = document.createElement("p"), choices = document.createElement("div"), field = VIEW_FIELDS[view];
      title.className = "browse-discovery-heading";
      title.textContent = heading;
      text.className = "browse-discovery-copy";
      text.textContent = copy;
      choices.className = "browse-choices";
      sortValues(field, discoveryValues(field, current)).forEach(value => {
        const choice = document.createElement("button");
        choice.type = "button";
        choice.className = "browse-choice";
        choice.textContent = value;
        choice.setAttribute("aria-pressed", String(fields[field].value === value));
        choice.addEventListener("click", () => {
          const wasSelected = fields[field].value === value;
          DISCOVERY_FIELDS.forEach(key => { fields[key].value = ""; });
          fields[field].value = wasSelected ? "" : value;
          maybeClearMedium(filters());
          render("replace");
        });
        choices.appendChild(choice);
      });
      discovery.append(title, text, choices);
    }
    function clear() {
      search.value = "";
      Object.values(fields).forEach(field => { field.value = ""; });
      render("replace");
    }
    function renderActive(current) {
      active.replaceChildren();
      if (!hasActive(current)) return;
      if (search.value.trim()) {
        const chip = document.createElement("button");
        chip.className = "browse-chip";
        chip.type = "button";
        chip.textContent = `Search: ${search.value.trim()} ×`;
        chip.addEventListener("click", () => { search.value = ""; render("replace"); });
        active.appendChild(chip);
      }
      Object.entries(current).forEach(([field, value]) => {
        if (!value) return;
        const chip = document.createElement("button");
        chip.className = "browse-chip";
        chip.type = "button";
        chip.textContent = `${field === "category" ? "Category" : field === "class" ? "Class / Stage" : field === "type" ? "Book Type" : field[0].toUpperCase() + field.slice(1)}: ${textFor(field, value)} ×`;
        chip.addEventListener("click", () => { fields[field].value = ""; render("replace"); });
        active.appendChild(chip);
      });
      const button = document.createElement("button");
      button.className = "browse-clear";
      button.type = "button";
      button.textContent = "Clear filters";
      button.addEventListener("click", clear);
      active.appendChild(button);
    }
    function renderResults(current) {
      const matched = query.browseMatches(books, current, search.value, categoryNames);
      summary.textContent = `${matched.length} publication${matched.length === 1 ? "" : "s"} found`;
      results.replaceChildren();
      if (!matched.length) {
        const empty = document.createElement("div"), heading = document.createElement("h2"), help = document.createElement("p"), reset = document.createElement("button");
        empty.className = "browse-empty";
        heading.textContent = "No matching publications";
        help.textContent = "Try another search term or clear a filter.";
        reset.className = "browse-reset";
        reset.type = "button";
        reset.textContent = "Clear filters";
        reset.addEventListener("click", clear);
        empty.append(heading, help, reset);
        results.appendChild(empty);
        return;
      }
      matched.forEach(book => {
        const row = document.createElement("article"), cover = document.createElement("div"), info = document.createElement("div"), heading = document.createElement("h2"), meta = document.createElement("p");
        row.className = "browse-book";
        cover.className = "browse-cover";
        if (book.cover) { const image = document.createElement("img"); image.src = book.cover; image.alt = "Cover of " + book.title; image.loading = "lazy"; cover.appendChild(image); }
        else cover.textContent = "BOOK COVER";
        heading.textContent = book.title;
        meta.textContent = [categoryNames[book.category] || book.category, query.classValues(book).join(", "), book.series, book.displaySubject || book.subject, book.type || book.bookType].filter(Boolean).join(" · ");
        info.append(heading, meta);
        const mrp = Number(book.mrp);
        if (Number.isFinite(mrp) && mrp > 0) { const price = document.createElement("p"); price.className = "browse-mrp"; price.textContent = "₹" + mrp; info.appendChild(price); }
        const selection = window.CambridgeSelection;
        if (selection) {
          const actions = selection.actionNode(book);
          actions.classList.add("browse-actions");
          row.append(cover, info, actions);
        }
        results.appendChild(row);
      });
    }
    function render(mode) {
      let current = filters();
      refreshFacetOptions(current);
      current = filters();
      if (mode) writeUrl(current, mode);
      renderTabs();
      renderDiscovery(current);
      renderActive(current);
      const refinementCount = activeGeneralCount(current);
      refineStatus.textContent = refinementCount ? `${refinementCount} active` : "";
      if (mode && refinementCount) refine.open = true;
      renderResults(current);
      const selection = window.CambridgeSelection;
      if (selection) selection.updateBar();
    }
    function switchView(next) {
      if (next === view) return;
      view = next;
      search.value = "";
      Object.values(fields).forEach(field => { field.value = ""; });
      render("push");
      const tab = tabs.find(item => item.dataset.view === view);
      if (tab && typeof tab.scrollIntoView === "function") tab.scrollIntoView({ block: "nearest", inline: "nearest" });
    }

    ["category", "series", "subject", "type"].forEach(field => setOptions(field, allValues(field), field === "category" ? "All categories" : "All " + (field === "type" ? "book types" : field + "s")));
    setOptions("class", allValues("class"), "All classes and stages");
    setOptions("medium", allValues("medium"), "All media");
    restoreState();
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => switchView(tab.dataset.view));
      tab.addEventListener("keydown", event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const target = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
        tabs[target].focus();
      });
    });
    search.addEventListener("input", () => render("replace"));
    fields.class.addEventListener("change", () => render("replace"));
    fields.medium.addEventListener("change", () => render("replace"));
    window.addEventListener("popstate", () => { restoreState(); render(false); });
    const selection = window.CambridgeSelection;
    if (selection) window.addEventListener(selection.CHANGE_EVENT, () => render(false));
    document.addEventListener("DOMContentLoaded", () => { const selection = window.CambridgeSelection; if (selection) selection.updateBar(); }, { once: true });
    render("replace");
  }
  init();
})();
