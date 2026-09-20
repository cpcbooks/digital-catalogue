(function () {
  "use strict";

  const query = window.CambridgeCatalogueQuery;
  const books = query ? query.active() : [];
  const params = new URLSearchParams(window.location.search);
  const fields = Object.fromEntries(["category", "class", "series", "subject", "type"].map(key => [key, document.getElementById(key)]));
  const search = document.getElementById("browseSearch");
  const summary = document.getElementById("browseSummary");
  const results = document.getElementById("browseResults");
  const categoryNames = { "early-learning": "Early Learning", school: "School Learning", exam: "School Exam Preparation", "higher-education": "College and University", "competitive-exams": "Competitive Exams" };
  const view = params.get("view");

  if (view === "series") document.getElementById("browseTitle").textContent = "Browse all series";
  if (view === "subjects") document.getElementById("browseTitle").textContent = "Subjects & book types";

  function values(book, field) {
    if (field === "class") return query.classValues(book);
    const value = field === "type" ? book.type || book.bookType : book[field];
    return value ? [String(value)] : [];
  }

  function addOptions(field) {
    const distinct = [...new Set(books.flatMap(book => values(book, field)))];
    distinct.sort((a, b) => field === "class" ? classOrder(a) - classOrder(b) : a.localeCompare(b));
    distinct.forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = field === "category" ? categoryNames[value] || value : value;
      fields[field].appendChild(option);
    });
  }

  function classOrder(value) {
    const early = { Nursery: -3, LKG: -2, UKG: -1 };
    return Object.prototype.hasOwnProperty.call(early, value) ? early[value] : Number(value) || 999;
  }

  function render() {
    const term = search.value.trim().toLocaleLowerCase();
    const matched = books.filter(book => {
      if (Object.entries(fields).some(([field, select]) => select.value && !values(book, field).includes(select.value))) return false;
      if (!term) return true;
      const classes = query.classValues(book);
      const searchable = [book.title, book.series, book.family, book.subject, book.displaySubject, book.type, book.bookType, book.medium, categoryNames[book.category], ...classes, ...classes.map(value => "Class " + value)].filter(Boolean).join(" ").toLocaleLowerCase();
      return searchable.includes(term);
    });

    summary.textContent = `${matched.length} publication${matched.length === 1 ? "" : "s"} found`;
    results.replaceChildren();
    if (!matched.length) {
      const empty = document.createElement("div");
      empty.className = "browse-empty";
      const heading = document.createElement("h2");
      heading.textContent = "No matching publications";
      const help = document.createElement("p");
      help.textContent = "Try another search term or clear a filter.";
      empty.append(heading, help);
      results.appendChild(empty);
      return;
    }

    matched.forEach(book => {
      const row = document.createElement("article");
      row.className = "browse-book";
      const cover = document.createElement("div");
      cover.className = "browse-cover";
      cover.textContent = "BOOK COVER";
      const info = document.createElement("div");
      const heading = document.createElement("h2");
      heading.textContent = book.title;
      const meta = document.createElement("p");
      meta.textContent = [categoryNames[book.category] || book.category, query.classValues(book).join(", "), book.series, book.displaySubject || book.subject, book.type || book.bookType].filter(Boolean).join(" · ");
      info.append(heading, meta);
      const link = document.createElement("a");
      link.className = "browse-view";
      link.href = "book-details.html?id=" + encodeURIComponent(book.id);
      link.textContent = "View Book →";
      row.append(cover, info, link);
      results.appendChild(row);
    });
  }

  Object.keys(fields).forEach(addOptions);
  search.value = params.get("q") || "";
  if (view === "series") fields.series.focus();
  if (view === "subjects") fields.subject.focus();
  search.addEventListener("input", render);
  Object.values(fields).forEach(field => field.addEventListener("change", render));
  render();
})();
