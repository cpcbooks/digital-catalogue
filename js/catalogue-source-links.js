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
    style.href = "css/ux-refinement.css?v=ux2";
    document.head.appendChild(style);
    const inner = document.createElement("link");
    inner.id = "catalogue-inner-pages-refinement";
    inner.rel = "stylesheet";
    inner.href = "css/inner-pages-refinement.css?v=inner2";
    document.head.appendChild(inner);
  }

  function setInnerPageTone() {
    const pathname = location.pathname;
    if (/(?:^|\/)index\.html$/.test(pathname)) return;
    const tone = /early-learning|kit-/.test(pathname) ? "early"
      : /exam-preparation|competitive-exam-books/.test(pathname) ? "exam"
        : /school-/.test(pathname) ? "school"
        : /college-/.test(pathname) ? "college"
          : /competitive-exams/.test(pathname) ? "competitive" : "catalogue";
    document.body.classList.add("catalogue-inner-page");
    document.body.dataset.catalogueTone = tone;
  }
  function addSearchAssets() {
    if (global.CambridgeCatalogueQuery) {
      addRefinementAsset("js/catalogue-search-suggestions.js?v=ux2", "catalogue-search-suggestions");
      return;
    }
    if (document.getElementById("catalogue-query-for-search")) return;
    const query = document.createElement("script");
    query.id = "catalogue-query-for-search";
    query.src = "js/catalogue-query.js";
    query.onload = () => addRefinementAsset("js/catalogue-search-suggestions.js?v=ux2", "catalogue-search-suggestions");
    document.head.appendChild(query);
  }
  function addCompetitiveExamsAssets() {
    const addPage = () => addRefinementAsset("js/competitive-exams-refinement.js?v=ux3", "competitive-exams-refinement");
    if (global.CambridgeCatalogueQuery) { addPage(); return; }
    if (document.getElementById("catalogue-query-for-competitive-exams")) return;
    const query = document.createElement("script");
    query.id = "catalogue-query-for-competitive-exams";
    query.src = "js/catalogue-query.js";
    query.onload = addPage;
    document.head.appendChild(query);
  }
  function refineCompetitiveExamsLink(bootstrap) {
    const home = document.querySelector(".home-category.exams");
    if (!home) return;
    const shortcuts = home.querySelector(".home-shortcuts");
    if (shortcuts) shortcuts.remove();
    const link = home.querySelector(".category-link");
    if (link) link.href = bootstrap ? bootstrap.withSource("competitive-exams.html") : "competitive-exams.html";
  }
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
  function refineOptionCHeaders() {
    const pathname = location.pathname;
    const category = pathname.endsWith("/early-learning.html")
      ? { title: "Early Learning", tagline: "Books for little learners." }
      : pathname.endsWith("/school-education.html")
        ? { title: "School Learning", tagline: "Books for every school year." }
        : pathname.endsWith("/college-university.html")
          ? { title: "College & University", tagline: "Continue your academic journey." }
          : null;
    if (category) {
      const centre = document.querySelector(".stage-center");
      const title = centre && centre.querySelector("h1");
      const description = centre && centre.querySelector(".stage-intro");
      if (title && description && !centre.querySelector(".category-heading-group")) {
        const group = document.createElement("div");
        const accent = document.createElement("span");
        const copy = document.createElement("div");
        const tagline = document.createElement("p");
        group.className = "category-heading-group";
        accent.className = "heading-accent";
        accent.setAttribute("aria-hidden", "true");
        copy.className = "heading-copy";
        tagline.className = "category-tagline";
        tagline.textContent = category.tagline;
        title.textContent = category.title;
        copy.append(title, tagline);
        group.append(accent, copy, description);
        centre.querySelector(".eyebrow")?.remove();
        centre.prepend(group);
      }
    }
    if (/\/(early-learning-level|early-learning-books|school-learning|school-books|exam-preparation|college-books)\.html$/.test(pathname)) {
      document.documentElement.classList.add("stage-level-page");
    }
  }
  const cardIcons = {
    shapes: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="7" r="3"></circle><rect x="12" y="4" width="7" height="7" rx="1"></rect><path d="m7 14 4 6H3z"></path></svg>',
    blocks: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h7v7H4zM13 4h7v7h-7zM13 13h7v7h-7z"></path></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A3.5 3.5 0 0 1 7.5 5H12v14H7.5A3.5 3.5 0 0 0 4 22zM20 5.5A3.5 3.5 0 0 0 16.5 5H12v14h4.5a3.5 3.5 0 0 1 3.5 3z"></path></svg>',
    cap: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 9-5 9 5-9 5zM7 12v4.5c2.8 1.9 7.2 1.9 10 0V12M21 10v5"></path></svg>',
    library: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V5h4v15m1 0V3h4v17m1 0V7h4v13"></path></svg>',
    package: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 7 8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10"></path></svg>'
  };
  function setCardIcon(card, name) {
    if (!card) return;
    const icon = document.createElement("span");
    icon.className = "catalogue-card-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = cardIcons[name] || cardIcons.book;
    const marker = card.querySelector(".stage-number,.level-number,.catalogue-card-icon");
    if (marker) marker.replaceWith(icon);
    else card.prepend(icon);
  }
  function activateCard(card) {
    const link = card && card.querySelector("a[href]");
    if (!link || card.classList.contains("card-link")) return;
    card.classList.add("card-link");
  }
  function refineLandingCards() {
    const pathname = location.pathname;
    if (pathname.endsWith("/early-learning.html")) {
      const descriptions = ["A playful start to learning.", "Discover, explore and grow.", "Building strong learning foundations.", "Growing confident, school-ready learners."];
      const icons = ["shapes", "blocks", "book", "cap"];
      document.querySelectorAll(".stage-grid .stage-card").forEach((card, index) => { setCardIcon(card, icons[index]); const text = card.querySelector("p"); if (text) text.textContent = descriptions[index]; });
    }
    if (pathname.endsWith("/school-education.html")) {
      document.querySelectorAll(".stage-grid .stage-card").forEach(card => { setCardIcon(card, "book"); card.querySelector("p")?.remove(); });
    }
    if (pathname.endsWith("/college-university.html")) {
      ["book", "library", "cap"].forEach((name, index) => setCardIcon(document.querySelectorAll(".stage-grid .stage-card")[index], name));
      document.querySelector(".notice")?.remove();
    }
    if (pathname.endsWith("/early-learning-level.html")) {
      document.querySelectorAll(".choice-card").forEach(card => {
        setCardIcon(card, card.classList.contains("custom-kit") ? "blocks" : card.textContent.includes("Individual") ? "book" : "package");
        const text = card.querySelector("p");
        if (text) text.textContent = card.classList.contains("custom-kit") ? "Choose at least 8 titles." : card.textContent.includes("Individual") ? "Browse and select publications." : "Ready-made book collection.";
        activateCard(card);
      });
    }
    if (pathname.endsWith("/school-learning.html")) {
      document.querySelectorAll(".category-card").forEach(card => {
        setCardIcon(card, card.classList.contains("exam-card") ? "package" : "book");
        const text = card.querySelector("p");
        if (text) text.textContent = card.classList.contains("exam-card") ? "Guides, workbooks and assessments." : "Textbooks and subject books.";
        activateCard(card);
      });
    }
  }
  function refineListingEmptyStates() {
    const results = document.getElementById("results");
    if (!results || results.dataset.emptyStateRefined) return;
    results.dataset.emptyStateRefined = "true";
    const update = () => results.querySelectorAll(".empty").forEach(box => {
      const heading = box.querySelector("h2"), copy = box.querySelector("p");
      if (!heading || !copy) return;
      if (/^Titles will be added here$/i.test(heading.textContent.trim())) {
        const label = (document.getElementById("title")?.textContent || "").replace(/ Publications$/i, "").trim() || "Catalogue";
        heading.textContent = "No publications available yet";
        copy.textContent = label + " publications will appear here as they become available in our catalogue.";
      }
      if (/^Catalogue unavailable$/i.test(heading.textContent.trim())) {
        heading.textContent = "Unable to load publications";
        copy.textContent = "Please try again.";
      }
      if (/^No matching publications$/i.test(heading.textContent.trim())) heading.textContent = "No publications match your search.";
    });
    new MutationObserver(update).observe(results, { childList: true, subtree: true });
    update();
  }
  function apply() {
    const bootstrap = global.CambridgeCatalogueBootstrap;
    addRefinementStyles();
    setInnerPageTone();
    addBrandLink(bootstrap);
    addPrivacyLink(bootstrap);
    refineOptionCHeaders();
    refineLandingCards();
    refineListingEmptyStates();
    refineCompetitiveExamsLink(bootstrap);
    if (document.getElementById("homeSearch") || document.getElementById("browseSearch")) addSearchAssets();
    if (document.getElementById("kitName")) addRefinementAsset("js/kit-builder-refinement.js?v=ux2", "kit-builder-refinement");
    if (location.pathname.endsWith("/competitive-exams.html")) addCompetitiveExamsAssets();
    if (bootstrap && bootstrap.requestedSource === "supabase") {
      document.querySelectorAll("a[href]").forEach(link => {
        link.setAttribute("href", bootstrap.withSource(link.getAttribute("href")));
      });
      document.querySelectorAll("[data-href]").forEach(node => {
        node.dataset.href = bootstrap.withSource(node.dataset.href);
      });
    }
  }
  global.CambridgeInnerPageRefinement = { activateCard };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})(window);
