/* Cambridge Digital Catalogue — shared selection controls */
(function () {
  "use strict";

  const ORDER_KEY = "cambridgeOrder";
  const MAX_QUANTITY = 10000;
  const CHANGE_EVENT = "cambridge-selection-change";
  const FLOATING_BAR_ID = "cambridgeFloatingSelection";
  const FLOATING_STYLE_ID = "cambridgeFloatingSelectionStyle";
  const BODY_ACTIVE_CLASS = "cambridge-floating-selection-active";

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

    return items
      .filter(item => item && typeof item === "object")
      .map(item => ({
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
    return [
      "book",
      item.title || "",
      item.series || "",
      item.class || "",
      item.level || "",
      item.subject || "",
      item.medium || ""
    ].join(":");
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

  function selectedItems() {
    return readOrder().filter(item => item.type !== "custom-kit");
  }

  function selectedCount() {
    return selectedItems().length;
  }

  function selectedQuantityTotal() {
    return selectedItems().reduce((total, item) => {
      return total + (validQty(item.quantity) ? Number(item.quantity) : 1);
    }, 0);
  }

  function isSelectionPage() {
    const path = (window.location && window.location.pathname) || "";
    return /(?:^|\/)order\.html$/i.test(path);
  }

  function ensureFloatingStyle() {
    if (document.getElementById(FLOATING_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = FLOATING_STYLE_ID;
    style.textContent = `
      /* The compact floating pane is the single catalogue-wide selection shortcut. */
      .selection-bar { display: none !important; }

      .cambridge-floating-selection {
        position: fixed;
        left: auto;
        right: max(16px, env(safe-area-inset-right));
        bottom: max(16px, env(safe-area-inset-bottom));
        z-index: 1000;
        width: auto;
        max-width: calc(100% - 32px);
        transform: none;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 9px 9px 9px 12px;
        border: 1px solid rgba(255,255,255,.16);
        border-radius: 12px;
        background: #12233f;
        color: #fff;
        box-shadow: 0 10px 28px rgba(18,35,63,.22);
        font-family: inherit;
      }

      .cambridge-floating-selection[hidden] { display: none !important; }

      .cambridge-floating-selection__summary {
        min-width: 0;
        display: flex;
        align-items: baseline;
        gap: 4px;
        flex-wrap: nowrap;
        white-space: nowrap;
        font-size: 10px;
        line-height: 1.3;
      }

      .cambridge-floating-selection__summary strong {
        font-size: 11px;
        font-weight: 800;
      }

      .cambridge-floating-selection__separator { opacity: .6; }

      .cambridge-floating-selection__link {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 32px;
        padding: 0 10px;
        border-radius: 7px;
        background: #fff;
        color: #12233f;
        text-decoration: none;
        font-size: 9px;
        font-weight: 800;
        white-space: nowrap;
      }

      body.cambridge-floating-selection-active { padding-bottom: 68px; }

      @media (max-width: 520px) {
        .cambridge-floating-selection {
          right: max(10px, env(safe-area-inset-right));
          bottom: max(10px, env(safe-area-inset-bottom));
          max-width: calc(100% - 20px);
          padding: 8px 8px 8px 10px;
        }
        .cambridge-floating-selection__summary { font-size: 9px; }
        .cambridge-floating-selection__summary strong { font-size: 10px; }
        .cambridge-floating-selection__link {
          min-height: 30px;
          padding: 0 9px;
        }
        body.cambridge-floating-selection-active { padding-bottom: 62px; }
      }
    `;
    document.head.appendChild(style);
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
    bar.setAttribute("aria-label", "Current book selection");

    const summary = document.createElement("div");
    summary.className = "cambridge-floating-selection__summary";
    summary.setAttribute("aria-live", "polite");

    const titleText = document.createElement("span");
    titleText.dataset.role = "titles";

    const separator = document.createElement("span");
    separator.className = "cambridge-floating-selection__separator";
    separator.textContent = "·";

    const quantityText = document.createElement("span");
    quantityText.dataset.role = "quantity";

    const link = document.createElement("a");
    link.className = "cambridge-floating-selection__link";
    link.href = "order.html";
    link.textContent = "View Selection →";

    summary.append(titleText, separator, quantityText);
    bar.append(summary, link);
    document.body.appendChild(bar);
    return bar;
  }

  function updateFloatingBar() {
    if (!document.body || isSelectionPage()) return;

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

    if (titles) {
      titles.innerHTML = "<strong>" + count + "</strong> " + (count === 1 ? "title" : "titles");
    }
    if (quantity) {
      quantity.innerHTML = "<strong>" + total + "</strong> " + (total === 1 ? "book" : "books");
    }

    bar.hidden = false;
    document.body.classList.add(BODY_ACTIVE_CLASS);
  }

  function updateBar() {
    const legacyBar = document.getElementById("selectionBar");
    if (legacyBar) legacyBar.hidden = true;
    updateFloatingBar();
  }

  function add(book, extra = {}) {
    const items = readOrder();
    if (indexOfBook(book, items) >= 0) return true;

    items.push({
      id: book.id || "",
      sku: book.sku || "",
      isbn: book.isbn || "",
      title: book.title || "Untitled Book",
      series: book.series || "",
      family: book.family || "",
      class: book.class || "",
      level: extra.level || book.level || "",
      levelName: extra.levelName || "",
      subject: book.subject || "",
      type: book.type || "",
      medium: book.medium || "",
      mrp: Number.isFinite(book.mrp) ? book.mrp : null,
      cover: book.cover || "",
      quantity: 1
    });

    return saveOrder(items);
  }

  function remove(book) {
    const items = readOrder();
    const index = indexOfBook(book, items);
    if (index < 0) return true;
    items.splice(index, 1);
    return saveOrder(items);
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

    items[index].quantity = quantity;
    return saveOrder(items);
  }

  function emitChange() {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }

  function detailsUrl(book) {
    const base = "book-details.html?id=" + encodeURIComponent(book.id || "");
    const level = window.SELECTION_EXTRA && window.SELECTION_EXTRA.level
      ? window.SELECTION_EXTRA.level
      : "";
    return level ? base + "&level=" + encodeURIComponent(level) : base;
  }

  function coverNode(book) {
    const wrapper = document.createElement("div");
    wrapper.className = "book-cover";

    if (!book.cover) {
      wrapper.textContent = "BOOK COVER";
      return wrapper;
    }

    const image = document.createElement("img");
    image.src = book.cover;
    image.alt = (book.title || "Book") + " cover";
    image.loading = "lazy";
    image.onerror = () => {
      wrapper.innerHTML = "";
      wrapper.textContent = "BOOK COVER";
    };
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
    actions.appendChild(view);

    const selected = selectedItem(book);
    if (!selected) {
      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "add-book";
      addButton.textContent = "+ Add to Selection";
      addButton.onclick = () => {
        if (add(book, window.SELECTION_EXTRA || {})) emitChange();
      };
      actions.appendChild(addButton);
      return actions;
    }

    const control = document.createElement("div");
    control.className = "qty-control";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.setAttribute("aria-label", "Decrease quantity");
    minus.textContent = "−";

    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "numeric";
    input.pattern = "[0-9]*";
    input.autocomplete = "off";
    input.enterKeyHint = "done";
    input.maxLength = 5;
    input.value = String(selected.quantity);
    input.setAttribute("aria-label", "Quantity");

    const plus = document.createElement("button");
    plus.type = "button";
    plus.setAttribute("aria-label", "Increase quantity");
    plus.textContent = "+";

    const error = document.createElement("div");
    error.className = "qty-error";
    error.setAttribute("aria-live", "polite");

    const clearError = () => {
      control.classList.remove("invalid");
      error.textContent = "";
    };

    const showError = message => {
      control.classList.add("invalid");
      error.textContent = message;
    };

    const restoreCurrent = () => {
      const current = selectedItem(book);
      input.value = String(current ? current.quantity : selected.quantity);
    };

    minus.onclick = () => {
      clearError();
      const current = selectedItem(book);
      if (!current) {
        emitChange();
        return;
      }
      const quantity = Number(current.quantity);
      if (quantity <= 1) {
        if (remove(book)) emitChange();
        return;
      }
      if (setQty(book, quantity - 1)) emitChange();
    };

    plus.onclick = () => {
      clearError();
      const current = selectedItem(book);
      if (!current) {
        if (add(book, window.SELECTION_EXTRA || {})) emitChange();
        return;
      }
      const quantity = Number(current.quantity);
      if (quantity >= MAX_QUANTITY) {
        showError("Maximum quantity is 10,000.");
        return;
      }
      if (setQty(book, quantity + 1)) emitChange();
    };

    input.oninput = () => {
      const digits = input.value.replace(/\D/g, "");
      input.value = digits;

      if (digits === "") {
        showError("Enter a quantity from 0 to 10,000.");
        return;
      }

      const quantity = Number(digits);
      if (digits.length > 5 || !Number.isSafeInteger(quantity) || quantity > MAX_QUANTITY) {
        restoreCurrent();
        showError("Maximum quantity is 10,000.");
        return;
      }

      if (quantity === 0) {
        clearError();
        return;
      }

      clearError();
      setQty(book, quantity);
      updateFloatingBar();
    };

    input.onblur = () => {
      const digits = input.value.replace(/\D/g, "");

      if (digits === "") {
        restoreCurrent();
        showError("Enter a quantity from 0 to 10,000.");
        return;
      }

      const quantity = Number(digits);
      if (!Number.isSafeInteger(quantity) || quantity > MAX_QUANTITY) {
        restoreCurrent();
        showError(quantity > MAX_QUANTITY
          ? "Maximum quantity is 10,000."
          : "Enter a quantity from 0 to 10,000.");
        return;
      }

      if (quantity === 0) {
        if (remove(book)) emitChange();
        return;
      }

      input.value = String(quantity);
      clearError();
      updateFloatingBar();
    };

    input.onkeydown = event => {
      if (event.key === "Enter") {
        event.preventDefault();
        input.blur();
      }
    };

    control.append(minus, input, plus);
    actions.append(control, error);
    return actions;
  }

  window.addEventListener("storage", event => {
    if (event.key === ORDER_KEY) emitChange();
  });

  window.addEventListener(CHANGE_EVENT, updateBar);
  document.addEventListener("DOMContentLoaded", updateBar);

  window.CambridgeSelection = Object.freeze({
    ORDER_KEY,
    MAX_QUANTITY,
    CHANGE_EVENT,
    validQty,
    readOrder,
    saveOrder,
    itemKey,
    indexOfBook,
    selectedItem,
    selectedItems,
    selectedCount,
    selectedQuantityTotal,
    updateBar,
    updateFloatingBar,
    add,
    remove,
    setQty,
    detailsUrl,
    coverNode,
    actionNode
  });
})();
