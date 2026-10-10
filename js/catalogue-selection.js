/* Cambridge Digital Catalogue — shared selection controls */
(function () {
  "use strict";

  const ORDER_KEY = "cambridgeOrder";
  const MAX_QUANTITY = 10000;
  const CHANGE_EVENT = "cambridge-selection-change";
  const FLOATING_BAR_ID = "cambridgeFloatingSelection";
  const HEADER_LINK_ID = "cambridgeHeaderSelection";
  const FLOATING_STYLE_ID = "cambridgeFloatingSelectionStyle";
  const BODY_ACTIVE_CLASS = "cambridge-floating-selection-active";
  const BOOK_RETURN_KEY = "cambridgeBookReturn";
  const CHECKLIST_RETURN_KEY = "cambridgeChecklistReturn";
  let detailsVisitEditedBookId = "";

  function validQty(value) {
    const n = Number(value);
    return Number.isInteger(n) && n >= 1 && n <= MAX_QUANTITY;
  }

  function readOrder() {
    let items = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
      if (Array.isArray(parsed)) items = parsed;
    } catch (error) {
      console.warn("Cambridge Catalogue: could not read selection.", error);
    }
    return items.filter(item => item && typeof item === "object").map(item => ({
      ...item,
      quantity: validQty(item.quantity) ? Number(item.quantity) : 1
    }));
  }

  function saveOrder(items) {
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(items));
      return true;
    } catch (error) {
      console.error("Cambridge Catalogue: could not save selection.", error);
      alert("Your selection could not be saved on this device. Please try again.");
      return false;
    }
  }

  function itemKey(item) {
    if (item.id) return "id:" + item.id;
    if (item.sku) return "sku:" + item.sku;
    if (item.isbn) return "isbn:" + item.isbn;
    return ["book", item.title || "", item.series || "", item.class || "", item.level || "", item.subject || "", item.medium || ""].join(":");
  }

  function indexOfBook(book, items = readOrder()) {
    const wanted = itemKey(book);
    return items.findIndex(item => item.type !== "custom-kit" && itemKey(item) === wanted);
  }

  function selectedItem(book) {
    const items = readOrder();
    const index = indexOfBook(book, items);
    return index < 0 ? null : items[index];
  }

  function selectedItems() { return readOrder().filter(item => item.type !== "custom-kit"); }
  function selectedCount() { return selectedItems().length; }
  function selectedQuantityTotal() {
    return selectedItems().reduce((total, item) => total + (validQty(item.quantity) ? Number(item.quantity) : 1), 0);
  }

  function isSelectionPage() {
    return /(?:^|\/)order(?:\.html)?$/i.test((window.location && window.location.pathname) || "");
  }

  function isBookDetailsPage() {
    return /(?:^|\/)book-details(?:\.html)?$/i.test((window.location && window.location.pathname) || "");
  }

  function isKitBuilderPage() {
    return /(?:^|\/)kit-builder(?:\.html)?$/i.test((window.location && window.location.pathname) || "");
  }

  function currentRelativeUrl() {
    return window.location.pathname + window.location.search + window.location.hash;
  }

  function detailsBookId() {
    return new URLSearchParams(window.location.search).get("id") || "";
  }

  function rememberDetailsEdit(book, changed) {
    const id = detailsBookId();
    if (changed && isBookDetailsPage() && id && String(book.id || "") === id) detailsVisitEditedBookId = id;
  }

  /* Book Details: one-time return state. This is intentionally separate from checklist navigation. */
  function rememberBookReturn(bookId = "") {
    if (isBookDetailsPage()) return;
    try {
      sessionStorage.setItem(BOOK_RETURN_KEY, JSON.stringify({
        url: currentRelativeUrl(),
        bookId: String(bookId || ""),
        y: Math.max(0, Math.round(window.scrollY || window.pageYOffset || 0)),
        createdAt: Date.now()
      }));
    } catch (error) {
      console.warn("Cambridge Catalogue: could not remember book return position.", error);
    }
  }

  function navigationType() {
    try {
      const entries = performance.getEntriesByType && performance.getEntriesByType("navigation");
      if (entries && entries[0] && entries[0].type) return entries[0].type;
    } catch (error) {}
    return "";
  }

  function restoreBookReturn() {
    if (isBookDetailsPage()) return false;
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(BOOK_RETURN_KEY) || "null"); }
    catch (error) { sessionStorage.removeItem(BOOK_RETURN_KEY); return false; }
    if (!saved || saved.url !== currentRelativeUrl()) return false;
    if (!Number.isFinite(saved.createdAt) || Date.now() - saved.createdAt > 30 * 60 * 1000) {
      sessionStorage.removeItem(BOOK_RETURN_KEY); return false;
    }
    if (navigationType() !== "back_forward" && saved.directReturn !== true) return false;
    sessionStorage.removeItem(BOOK_RETURN_KEY);
    const y = Number(saved.y);
    if (!Number.isFinite(y) || y < 0) return false;
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, y);
    root.style.scrollBehavior = previous;
    return true;
  }

  function scheduleBookReturnRestore() {
    if (!isBookDetailsPage()) requestAnimationFrame(() => restoreBookReturn());
  }

  function localReturn(url) {
    const bootstrap = window.CambridgeCatalogueBootstrap;
    return bootstrap && url ? bootstrap.localReturnHref(url) : "";
  }

  function freshBookReturn() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(BOOK_RETURN_KEY) || "null");
      return saved && saved.bookId && Number.isFinite(saved.createdAt) && Date.now() - saved.createdAt <= 30 * 60 * 1000 ? saved : null;
    } catch (_) { return null; }
  }

  function currentBookReturn() {
    const saved = freshBookReturn();
    const id = new URLSearchParams(window.location.search).get("id") || "";
    return saved && saved.bookId === id ? saved : null;
  }

  function bookDetailsSelectionReturn() {
    const params = new URLSearchParams(window.location.search);
    const explicit = localReturn(params.get("returnTo"));
    if (explicit) return explicit;

    const saved = currentBookReturn();
    if (saved) {
      const origin = localReturn(saved.url);
      if (origin) return origin;
    }

    const back = document.getElementById("back");
    const href = back && ((typeof back.getAttribute === "function" && back.getAttribute("href")) || back.href);
    return localReturn(href) || localReturn("index.html");
  }

  /* Final Checklist: remember where the floating pane was opened from. */
  function rememberChecklistReturn(url = currentRelativeUrl(), useHistory = true, bookId = "") {
    if (isSelectionPage()) return;
    try {
      const saved = {
        url,
        y: Math.max(0, Math.round(window.scrollY || window.pageYOffset || 0)),
        createdAt: Date.now(),
        useHistory
      };
      if (bookId) saved.bookId = String(bookId);
      sessionStorage.setItem(CHECKLIST_RETURN_KEY, JSON.stringify(saved));
    } catch (error) {
      console.warn("Cambridge Catalogue: could not remember checklist return context.", error);
    }
  }

  function rememberKitSelectionReturn(event) {
    const target = event.target && event.target.closest && event.target.closest(".complete-button, #content .kit-actions button");
    if (!target) return;
    const level = new URLSearchParams(window.location.search).get("level");
    if (level) {
      const href = "early-learning-level.html?level=" + encodeURIComponent(level);
      rememberChecklistReturn(window.CambridgeCatalogueBootstrap ? window.CambridgeCatalogueBootstrap.withSource(href) : href, false);
      return;
    }
    rememberChecklistReturn();
  }

  function ensureFloatingStyle() {
    if (document.getElementById(FLOATING_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = FLOATING_STYLE_ID;
    style.textContent = `
      .selection-bar{display:none!important}
      .cambridge-floating-selection{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:1000;display:flex;align-items:center;gap:10px;max-width:calc(100% - 32px);padding:9px 9px 9px 12px;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:#12233f;color:#fff;box-shadow:0 10px 28px rgba(18,35,63,.22);font-family:inherit;cursor:pointer;touch-action:manipulation}
      .cambridge-floating-selection[hidden]{display:none!important}
      .cambridge-floating-selection:focus-visible{outline:3px solid rgba(18,35,63,.28);outline-offset:3px}
      .cambridge-floating-selection__summary{display:flex;align-items:baseline;gap:4px;white-space:nowrap;font-size:10px;line-height:1.3}
      .cambridge-floating-selection__summary strong{font-size:11px;font-weight:800}
      .cambridge-floating-selection__separator{opacity:.6}
      .cambridge-floating-selection__link{display:inline-flex;align-items:center;justify-content:center;min-height:32px;padding:0 10px;border-radius:7px;background:#fff;color:#12233f;text-decoration:none;font-size:9px;font-weight:800;white-space:nowrap}
      body.cambridge-floating-selection-active{padding-bottom:68px}
      @media(max-width:520px){.cambridge-floating-selection{right:max(10px,env(safe-area-inset-right));bottom:max(10px,env(safe-area-inset-bottom));max-width:calc(100% - 20px);padding:8px 8px 8px 10px}.cambridge-floating-selection__summary{font-size:9px}.cambridge-floating-selection__summary strong{font-size:10px}.cambridge-floating-selection__link{min-height:30px;padding:0 9px}body.cambridge-floating-selection-active{padding-bottom:62px}}
    `;
    document.head.appendChild(style);
  }

  function openSelection() {
    if (isBookDetailsPage()) {
      const id = detailsBookId();
      if (id && detailsVisitEditedBookId === id) {
        const origin = bookDetailsSelectionReturn();
        const saved = currentBookReturn();
        const bookId = saved && localReturn(saved.url) === origin ? saved.bookId : "";
        rememberChecklistReturn(origin, false, bookId);
      } else {
        rememberChecklistReturn(currentRelativeUrl(), false);
      }
    } else {
      const saved = freshBookReturn();
      const origin = saved && localReturn(saved.url);
      if (saved && origin && origin === localReturn(currentRelativeUrl())) rememberChecklistReturn(origin, false, saved.bookId);
      else rememberChecklistReturn();
    }
    const orderUrl = window.CambridgeCatalogueBootstrap
      ? window.CambridgeCatalogueBootstrap.withSource("order.html")
      : "order.html";
    window.location.href = orderUrl;
  }

  function ensureHeaderSelection() {
    if (isSelectionPage()) return null;
    let link = document.getElementById(HEADER_LINK_ID);
    if (link) return link;
    const header = document.querySelector(".catalogue-header");
    if (!header) return null;
    link = document.createElement("a");
    link.id = HEADER_LINK_ID;
    link.className = "catalogue-header-selection";
    link.addEventListener("click", event => { event.preventDefault(); openSelection(); });
    const year = header.querySelector(".catalogue-year");
    header.insertBefore(link, year || null);
    return link;
  }

  function updateHeaderSelection() {
    const link = ensureHeaderSelection();
    if (!link) return;
    const source = window.CambridgeCatalogueBootstrap;
    link.href = source ? source.withSource("order.html") : "order.html";
    link.textContent = "My Selection";
    link.setAttribute("aria-label", "My Selection");
  }

  function currentPage() {
    const filename = ((window.location && window.location.pathname) || "").split("/").pop() || "index";
    return filename.replace(/\.html$/i, "").toLowerCase();
  }

  function stageLabel(value) {
    const stages = { playgroup: "Playgroup", nursery: "Nursery", lkg: "LKG", ukg: "UKG" };
    return stages[String(value || "").toLowerCase()] || "";
  }

  function classLabel(value) {
    return /^(?:[1-9]|10)$/.test(String(value || "")) ? "Class " + value : "";
  }

  function breadcrumbItems() {
    const page = currentPage(), params = new URLSearchParams((window.location && window.location.search) || "");
    const home = { label: "Home", href: "index.html" };
    const early = { label: "Early Learning", href: "early-learning.html" };
    const school = { label: "School Learning", href: "school-education.html" };
    const college = { label: "College & University", href: "college-university.html" };
    const competitive = { label: "Competitive Exams", href: "competitive-exams.html" };
    const level = stageLabel(params.get("level"));
    const className = classLabel(params.get("class"));
    if (page === "index" || page === "order" || page === "request" || page === "review-request" || page === "request-details") return [];
    if (page === "browse" || page === "early-learning" || page === "school-education" || page === "college-university" || page === "competitive-exams") return [home];
    if (page === "early-learning-level" || page === "early-learning-books") return [home, early];
    if (page === "school-learning" || page === "school-books") return [home, school];
    if (page === "exam-preparation") return [home, school].concat(className ? [{ label: className, href: "school-learning.html?class=" + encodeURIComponent(params.get("class")) }] : []);
    if (page === "college-books") return [home, college];
    if (page === "competitive-exam-books") return [home, competitive];
    if (page === "standard-kit" || page === "kit-builder" || page === "kit-review") return [home, early].concat(level ? [{ label: level, href: "early-learning-level.html?level=" + encodeURIComponent(params.get("level")) }] : []);
    if (page === "book-details") return [home];
    return [];
  }

  function breadcrumbRoot() {
    if (!document.querySelector) return null;
    const existing = document.getElementById && document.getElementById("catalogueBreadcrumbs");
    if (existing) return existing;
    const legacy = document.querySelector(".context-nav");
    const browseBack = document.querySelector(".browse-back");
    const anchor = legacy || browseBack;
    if (!anchor || !anchor.parentNode || !document.createElement) return null;
    const root = document.createElement("nav");
    root.id = "catalogueBreadcrumbs";
    root.className = "catalogue-breadcrumbs";
    root.setAttribute("aria-label", "Catalogue hierarchy");
    anchor.parentNode.insertBefore(root, anchor);

    if (legacy) {
      const page = currentPage();
      const action = page === "book-details" || page === "standard-kit" ? legacy.querySelector("#back") : legacy.querySelector("#editNav");
      if (action) {
        if (page === "standard-kit") {
          const level = stageLabel(new URLSearchParams((window.location && window.location.search) || "").get("level"));
          action.textContent = "← Back to " + (level || "Early Learning");
        }
        action.classList.add("catalogue-context-action");
        root.parentNode.insertBefore(action, legacy.nextSibling);
      }
      legacy.remove();
    } else browseBack.remove();
    return root;
  }

  function setBreadcrumbs(items = breadcrumbItems()) {
    if (!Array.isArray(items) || !items.length) return;
    const root = breadcrumbRoot();
    if (!root) return;
    root.replaceChildren();
    const source = window.CambridgeCatalogueBootstrap;
    items.forEach((item, index) => {
      if (index) {
        const separator = document.createElement("span");
        separator.className = "catalogue-breadcrumbs__separator";
        separator.setAttribute("aria-hidden", "true");
        separator.textContent = "›";
        root.appendChild(separator);
      }
      const node = item.href ? document.createElement("a") : document.createElement("span");
      node.textContent = item.label;
      if (item.href) node.href = source ? source.withSource(item.href) : item.href;
      else node.setAttribute("aria-current", "page");
      root.appendChild(node);
    });
  }

  function ensureFloatingBar() {
    if (isSelectionPage()) return null;
    let bar = document.getElementById(FLOATING_BAR_ID);
    if (bar) return bar;
    ensureFloatingStyle();
    bar = document.createElement("aside");
    bar.id = FLOATING_BAR_ID;
    bar.className = "cambridge-floating-selection";
    bar.hidden = true;
    bar.tabIndex = 0;
    bar.setAttribute("role", "link");
    bar.setAttribute("aria-label", "View current book selection");

    const summary = document.createElement("div");
    summary.className = "cambridge-floating-selection__summary";
    summary.setAttribute("aria-live", "polite");
    const titleText = document.createElement("span"); titleText.dataset.role = "titles";
    const separator = document.createElement("span"); separator.className = "cambridge-floating-selection__separator"; separator.textContent = "·";
    const quantityText = document.createElement("span"); quantityText.dataset.role = "quantity";
    const link = document.createElement("span"); link.className = "cambridge-floating-selection__link"; link.textContent = "View Selection →";
    summary.append(titleText, separator, quantityText);
    bar.append(summary, link);
    bar.addEventListener("click", openSelection);
    bar.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openSelection(); }
    });
    document.body.appendChild(bar);
    return bar;
  }

  function updateFloatingBar() {
    if (!document.body || isSelectionPage()) return;
    if (isKitBuilderPage()) {
      const existing = document.getElementById(FLOATING_BAR_ID);
      if (existing) existing.hidden = true;
      document.body.classList.remove(BODY_ACTIVE_CLASS);
      return;
    }
    const count = selectedCount();
    const total = selectedQuantityTotal();
    const bar = ensureFloatingBar();
    if (!bar) return;
    if (count === 0) {
      bar.hidden = true;
      document.body.classList.remove(BODY_ACTIVE_CLASS);
      return;
    }
    const titles = bar.querySelector('[data-role="titles"]');
    const quantity = bar.querySelector('[data-role="quantity"]');
    if (titles) titles.innerHTML = "<strong>" + count + "</strong> " + (count === 1 ? "title" : "titles");
    if (quantity) quantity.innerHTML = "<strong>" + total + "</strong> " + (total === 1 ? "book" : "books");
    bar.hidden = false;
    document.body.classList.add(BODY_ACTIVE_CLASS);
  }

  function updateBar() {
    const legacyBar = document.getElementById("selectionBar");
    if (legacyBar) legacyBar.hidden = true;
    updateHeaderSelection();
    updateFloatingBar();
    const listing = document.getElementById("list") || document.getElementById("browseResults") || document.getElementById("results");
    if (listing && listing.children && listing.children.length) restoreBookReturn();
  }

  function add(book, extra = {}) {
    const items = readOrder();
    if (indexOfBook(book, items) >= 0) return true;
    items.push({
      id: book.id || "", sku: book.sku || "", isbn: book.isbn || "",
      title: book.title || "Untitled Book", series: book.series || "", family: book.family || "",
      class: book.class || "", level: extra.level || book.level || "", levelName: extra.levelName || "",
      subject: book.subject || "", type: book.type || "", medium: book.medium || "",
      mrp: Number.isFinite(book.mrp) ? book.mrp : null, cover: book.cover || "", quantity: 1
    });
    const saved = saveOrder(items);
    rememberDetailsEdit(book, saved);
    return saved;
  }

  function remove(book) {
    const items = readOrder();
    const index = indexOfBook(book, items);
    if (index < 0) return true;
    items.splice(index, 1);
    const saved = saveOrder(items);
    rememberDetailsEdit(book, saved);
    return saved;
  }

  function setQty(book, value) {
    let quantity = Number(value);
    if (!Number.isFinite(quantity)) return false;
    quantity = Math.trunc(quantity);
    if (quantity < 1) return remove(book);
    if (quantity > MAX_QUANTITY) quantity = MAX_QUANTITY;
    const items = readOrder();
    const index = indexOfBook(book, items);
    if (index < 0) {
      if (!add(book, window.SELECTION_EXTRA || {})) return false;
      return setQty(book, quantity);
    }
    if (Number(items[index].quantity) === quantity) return true;
    items[index].quantity = quantity;
    const saved = saveOrder(items);
    rememberDetailsEdit(book, saved);
    return saved;
  }

  function emitChange() { window.dispatchEvent(new CustomEvent(CHANGE_EVENT)); }

  function detailsUrl(book) {
    const params = new URLSearchParams({ id: book.id || "" });
    const level = window.SELECTION_EXTRA && window.SELECTION_EXTRA.level ? window.SELECTION_EXTRA.level : "";
    if (level) params.set("level", level);
    if (!isBookDetailsPage()) params.set("returnTo", currentRelativeUrl());
    const href = "book-details.html?" + params.toString();
    return window.CambridgeCatalogueBootstrap ? window.CambridgeCatalogueBootstrap.withSource(href) : href;
  }

  function coverNode(book) {
    const wrapper = document.createElement("div");
    wrapper.className = "book-cover";
    if (!book.cover) { wrapper.textContent = "BOOK COVER"; return wrapper; }
    const image = document.createElement("img");
    image.src = book.cover;
    image.alt = (book.title || "Book") + " cover";
    image.loading = "lazy";
    image.onerror = () => { wrapper.innerHTML = ""; wrapper.textContent = "BOOK COVER"; };
    wrapper.appendChild(image);
    return wrapper;
  }

  function actionNode(book) {
    const actions = document.createElement("div");
    actions.className = "book-actions";
    const view = document.createElement("a");
    view.className = "view-book";
    view.href = detailsUrl(book);
    view.textContent = "View Book →";
    view.addEventListener("click", () => rememberBookReturn(book.id));
    actions.appendChild(view);

    const selected = selectedItem(book);
    if (!selected) {
      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "add-book";
      addButton.textContent = "+ Add to Selection";
      addButton.onclick = () => { if (add(book, window.SELECTION_EXTRA || {})) { if (!isBookDetailsPage()) rememberBookReturn(book.id); emitChange(); } };
      actions.appendChild(addButton);
      return actions;
    }

    const control = document.createElement("div"); control.className = "qty-control";
    const minus = document.createElement("button"); minus.type = "button"; minus.setAttribute("aria-label", "Decrease quantity"); minus.textContent = "−";
    const input = document.createElement("input");
    input.type = "text"; input.inputMode = "numeric"; input.pattern = "[0-9]*"; input.autocomplete = "off"; input.enterKeyHint = "done"; input.maxLength = 5; input.value = String(selected.quantity); input.setAttribute("aria-label", "Quantity");
    const plus = document.createElement("button"); plus.type = "button"; plus.setAttribute("aria-label", "Increase quantity"); plus.textContent = "+";
    const error = document.createElement("div"); error.className = "qty-error"; error.setAttribute("aria-live", "polite");
    const clearError = () => { control.classList.remove("invalid"); error.textContent = ""; };
    const showError = message => { control.classList.add("invalid"); error.textContent = message; };
    const restoreCurrent = () => { const current = selectedItem(book); input.value = String(current ? current.quantity : selected.quantity); };

    minus.onclick = () => {
      clearError(); const current = selectedItem(book); if (!current) { emitChange(); return; }
      const quantity = Number(current.quantity);
      if (quantity <= 1) { if (remove(book)) emitChange(); return; }
      if (setQty(book, quantity - 1)) emitChange();
    };

    plus.onclick = () => {
      clearError(); const current = selectedItem(book);
      if (!current) { if (add(book, window.SELECTION_EXTRA || {})) emitChange(); return; }
      const quantity = Number(current.quantity);
      if (quantity >= MAX_QUANTITY) { showError("Maximum quantity is 10,000."); return; }
      if (setQty(book, quantity + 1)) emitChange();
    };

    input.oninput = () => {
      const digits = input.value.replace(/\D/g, ""); input.value = digits;
      if (digits === "") { showError("Enter a quantity from 0 to 10,000."); return; }
      const quantity = Number(digits);
      if (digits.length > 5 || !Number.isSafeInteger(quantity) || quantity > MAX_QUANTITY) { restoreCurrent(); showError("Maximum quantity is 10,000."); return; }
      if (quantity === 0) { clearError(); return; }
      clearError(); setQty(book, quantity); updateFloatingBar();
    };

    input.onblur = () => {
      const digits = input.value.replace(/\D/g, "");
      if (digits === "") { restoreCurrent(); showError("Enter a quantity from 0 to 10,000."); return; }
      const quantity = Number(digits);
      if (!Number.isSafeInteger(quantity) || quantity > MAX_QUANTITY) { restoreCurrent(); showError(quantity > MAX_QUANTITY ? "Maximum quantity is 10,000." : "Enter a quantity from 0 to 10,000."); return; }
      if (quantity === 0) { if (remove(book)) emitChange(); return; }
      input.value = String(quantity); clearError(); updateFloatingBar();
    };

    input.onkeydown = event => { if (event.key === "Enter") { event.preventDefault(); input.blur(); } };
    control.append(minus, input, plus);
    actions.append(control, error);
    return actions;
  }

  document.addEventListener("click", event => {
    if (!isBookDetailsPage()) return;
    const link = event.target.closest && event.target.closest("#back");
    if (!link) return;
    if (currentBookReturn() && history.length > 1) { event.preventDefault(); history.back(); }
  });
  document.addEventListener("click", rememberKitSelectionReturn, true);

  window.addEventListener("storage", event => { if (event.key === ORDER_KEY) emitChange(); });
  window.addEventListener(CHANGE_EVENT, updateBar);
  document.addEventListener("DOMContentLoaded", () => { setBreadcrumbs(); updateBar(); });
  window.addEventListener("pageshow", event => { if (event.persisted) scheduleBookReturnRestore(); });

  window.CambridgeSelection = Object.freeze({
    ORDER_KEY, MAX_QUANTITY, CHANGE_EVENT, CHECKLIST_RETURN_KEY,
    validQty, readOrder, saveOrder, itemKey, indexOfBook, selectedItem, selectedItems,
    selectedCount, selectedQuantityTotal, updateBar, updateFloatingBar, add, remove, setQty,
    detailsUrl, coverNode, actionNode, rememberBookReturn, restoreBookReturn, rememberChecklistReturn, setBreadcrumbs
  });
})();
