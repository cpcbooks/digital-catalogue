(function () {
  "use strict";

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
    const params = new URLSearchParams(window.location.search);
    const fields = Object.fromEntries(["category", "class", "series", "subject", "type", "medium"].map(key => [key, document.getElementById(key)]));
    const search = document.getElementById("browseSearch"), summary = document.getElementById("browseSummary"), results = document.getElementById("browseResults"), active = document.getElementById("browseActive");
    const categoryNames = { "early-learning": "Early Learning", school: "School Learning", exam: "School Exam Preparation", "college-university": "College and University", "higher-education": "College and University", "competitive-exams": "Competitive Exams" };
    const view = params.get("view");
    if (view === "series") document.getElementById("browseTitle").textContent = "Browse all series";
    if (view === "subjects") document.getElementById("browseTitle").textContent = "Subjects & book types";

    function addOptions(field) { const distinct = [...new Set(books.flatMap(book => query.browseValues(book, field)))]; distinct.sort((a,b) => field === "class" ? query.classOrder(a)-query.classOrder(b) : a.localeCompare(b)); distinct.forEach(value => { const option=document.createElement("option"); option.value=value; option.textContent=field === "category" ? categoryNames[value] || value : value; fields[field].appendChild(option); }); }
    function currentBrowseUrl() { const p=new URLSearchParams(location.search); p.delete("returnTo"); return location.pathname.split("/").pop()+"?"+p.toString(); }
    function hasActive(filters) { return Boolean(search.value.trim() || Object.values(filters).some(Boolean)); }
    function clear() { search.value=""; Object.values(fields).forEach(field=>field.value=""); render(); }
    function syncUrl(filters) { const next=new URLSearchParams(location.search); next.delete("q"); Object.keys(fields).forEach(field=>next.delete(field)); if(search.value.trim())next.set("q",search.value.trim()); Object.entries(filters).forEach(([field,value])=>{if(value)next.set(field,value)}); history.replaceState(null,"",location.pathname+(next.toString()?"?"+next.toString():"")); }
    function renderActive(filters) { active.replaceChildren(); if(!hasActive(filters)) return; if(search.value.trim()){const chip=document.createElement("button");chip.className="browse-chip";chip.type="button";chip.textContent=`Search: ${search.value.trim()} ×`;chip.addEventListener("click",()=>{search.value="";render()});active.appendChild(chip)} Object.entries(filters).forEach(([field,value])=>{if(!value)return;const chip=document.createElement("button");chip.className="browse-chip";chip.type="button";chip.textContent=`${field === "category" ? "Category" : field[0].toUpperCase()+field.slice(1)}: ${fields[field].selectedOptions[0].textContent} ×`;chip.addEventListener("click",()=>{fields[field].value="";render()});active.appendChild(chip)}); const button=document.createElement("button");button.className="browse-clear";button.type="button";button.textContent="Clear all";button.addEventListener("click",clear);active.appendChild(button); }

    function render() {
      const filters = Object.fromEntries(Object.entries(fields).map(([field, select]) => [field, select.value]));
      const matched = query.browseMatches(books, filters, search.value, categoryNames);
      syncUrl(filters); renderActive(filters);
      summary.textContent = `${matched.length} publication${matched.length === 1 ? "" : "s"} found`;
      results.replaceChildren();
      if (!matched.length) { const empty=document.createElement("div"); empty.className="browse-empty"; const heading=document.createElement("h2"); heading.textContent="No matching publications"; const help=document.createElement("p"); help.textContent="Try another search term or clear a filter."; const reset=document.createElement("button");reset.className="browse-reset";reset.type="button";reset.textContent="Reset all filters";reset.addEventListener("click",clear);empty.append(heading,help,reset); results.appendChild(empty); return; }
      matched.forEach(book => { const row=document.createElement("article"); row.className="browse-book"; const cover=document.createElement("div"); cover.className="browse-cover"; if(book.cover){const img=document.createElement("img");img.src=book.cover;img.alt="Cover of "+book.title;img.loading="lazy";cover.appendChild(img)}else cover.textContent="BOOK COVER"; const info=document.createElement("div"),heading=document.createElement("h2"),meta=document.createElement("p"); heading.textContent=book.title; meta.textContent=[categoryNames[book.category]||book.category,query.classValues(book).join(", "),book.series,book.displaySubject||book.subject,book.type||book.bookType].filter(Boolean).join(" · "); info.append(heading,meta); const mrp=Number(book.mrp);if(Number.isFinite(mrp)&&mrp>0){const price=document.createElement("p");price.className="browse-mrp";price.textContent="₹"+mrp;info.appendChild(price)} const link=document.createElement("a"); link.className="browse-view"; const linkParams=new URLSearchParams({id:book.id,returnTo:currentBrowseUrl()}); if(bootstrap&&bootstrap.requestedSource==="supabase")linkParams.set("catalogueSource","supabase"); link.href=bootstrap?bootstrap.withSource("book-details.html?"+linkParams.toString()):"book-details.html?"+linkParams.toString(); link.textContent="View Book →"; row.append(cover,info,link); results.appendChild(row); });
    }

    Object.keys(fields).forEach(addOptions);
    search.value = params.get("q") || "";
    Object.entries(fields).forEach(([key, select]) => { const requested=params.get(key); if(requested && [...select.options].some(option=>option.value===requested)) select.value=requested; });
    if (view === "series") fields.series.focus();
    if (view === "subjects") fields.subject.focus();
    search.addEventListener("input", render); Object.values(fields).forEach(field => field.addEventListener("change", render)); render();
  }
  init();
})();
