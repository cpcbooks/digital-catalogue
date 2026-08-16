/* Cambridge Digital Catalogue — shared selection controls */
(function () {
  "use strict";

  const ORDER_KEY = "cambridgeOrder";
  const MAX_QUANTITY = 10000;

  function validQty(v) {
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 && n <= MAX_QUANTITY;
  }

  function order() {
    let a = [];

    try {
      const v = JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
      if (Array.isArray(v)) a = v;
    } catch (e) {}

    return a
      .filter(x => x && typeof x === "object")
      .map(x => ({
        ...x,
        quantity: validQty(x.quantity) ? Number(x.quantity) : 1
      }));
  }

  function save(a) {
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(a));
      return true;
    } catch (e) {
      alert(
        "Your selection could not be saved on this device. Please try again."
      );
      return false;
    }
  }

  function key(x) {
    if (x.id) return "id:" + x.id;
    if (x.sku) return "sku:" + x.sku;
    if (x.isbn) return "isbn:" + x.isbn;

    return [
      "book",
      x.title || "",
      x.series || "",
      x.class || "",
      x.level || "",
      x.subject || "",
      x.medium || ""
    ].join(":");
  }

  function indexOfBook(book, a = order()) {
    const k = key(book);

    return a.findIndex(
      x => x.type !== "custom-kit" && key(x) === k
    );
  }

  function selectedItem(book) {
    const a = order();
    const i = indexOfBook(book, a);

    return i < 0 ? null : a[i];
  }

  function selectedCount() {
    return order().filter(x => x.type !== "custom-kit").length;
  }

  function updateBar() {
    const bar = document.getElementById("selectionBar");
    const s = document.getElementById("selectionStatus");

    if (!bar || !s) return;

    const n = selectedCount();

    bar.hidden = n === 0;

    s.innerHTML =
      "<strong>" +
      n +
      "</strong> " +
      (n === 1 ? "title selected" : "titles selected");
  }

  function add(book, extra = {}) {
    const a = order();

    if (indexOfBook(book, a) >= 0) return true;

    a.push({
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

    return save(a);
  }

  function setQty(book, value) {
    let n = Number(value);

    if (!Number.isFinite(n)) return false;

    n = Math.trunc(n);

    if (n < 1) return remove(book);

    if (n > MAX_QUANTITY) {
      n = MAX_QUANTITY;
    }

    const a = order();
    const i = indexOfBook(book, a);

    if (i < 0) {
      if (!add(book, window.SELECTION_EXTRA || {})) {
        return false;
      }

      return setQty(book, n);
    }

    a[i].quantity = n;

    return save(a);
  }

  function remove(book) {
    const a = order();
    const i = indexOfBook(book, a);

    if (i < 0) return true;

    a.splice(i, 1);

    return save(a);
  }

  function detailsUrl(book) {
    const base =
      "book-details.html?id=" +
      encodeURIComponent(book.id || "");

    return window.SELECTION_EXTRA &&
      window.SELECTION_EXTRA.level
      ? base +
          "&level=" +
          encodeURIComponent(window.SELECTION_EXTRA.level)
      : base;
  }

  function coverNode(book) {
    const d = document.createElement("div");

    d.className = "book-cover";

    if (book.cover) {
      const img = document.createElement("img");

      img.src = book.cover;
      img.alt = (book.title || "Book") + " cover";
      img.loading = "lazy";

      img.onerror = () => {
        d.innerHTML = "";
        d.textContent = "BOOK COVER";
      };

      d.appendChild(img);
    } else {
      d.textContent = "BOOK COVER";
    }

    return d;
  }

  function actionNode(book) {
    const wrap = document.createElement("div");
    wrap.className = "book-actions";

    const view = document.createElement("a");

    view.className = "view-book";
    view.href = detailsUrl(book);
    view.textContent = "View Book →";

    wrap.appendChild(view);

    const item = selectedItem(book);

    if (!item) {
      const b = document.createElement("button");

      b.type = "button";
      b.className = "add-book";
      b.textContent = "+ Add to Selection";

      b.onclick = () => {
        if (add(book, window.SELECTION_EXTRA || {})) {
          refresh();
        }
      };

      wrap.appendChild(b);

      return wrap;
    }

    const q = document.createElement("div");
    q.className = "qty-control";

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
    input.value = String(item.quantity);
    input.setAttribute("aria-label", "Quantity");

    const plus = document.createElement("button");

    plus.type = "button";
    plus.setAttribute("aria-label", "Increase quantity");
    plus.textContent = "+";

    const error = document.createElement("div");

    error.className = "qty-error";
    error.setAttribute("aria-live", "polite");

    const clearError = () => {
      q.classList.remove("invalid");
      error.textContent = "";
    };

    const showError = message => {
      q.classList.add("invalid");
      error.textContent = message;
    };

    minus.onclick = () => {
      clearError();

      /*
       * IMPORTANT:
       * Always read the latest stored quantity.
       * Do not rely on the quantity that existed when
       * this control was originally rendered.
       */
      const current = selectedItem(book);

      if (!current) {
        refresh();
        return;
      }

      const qty = Number(current.quantity);

      if (qty <= 1) {
        if (remove(book)) refresh();
      } else if (setQty(book, qty - 1)) {
        refresh();
      }
    };

    plus.onclick = () => {
      clearError();

      /*
       * Same fresh-state rule as the minus button.
       */
      const current = selectedItem(book);

      if (!current) {
        if (add(book, window.SELECTION_EXTRA || {})) {
          refresh();
        }

        return;
      }

      const qty = Number(current.quantity);

      if (qty >= MAX_QUANTITY) {
        showError("Maximum quantity is 10,000.");
        return;
      }

      if (setQty(book, qty + 1)) {
        refresh();
      }
    };

    input.oninput = () => {
      const digits = input.value.replace(/\D/g, "");

      input.value = digits;

      /*
       * Blank is temporarily allowed while the user
       * is editing the field.
       */
      if (digits === "") {
        showError("Enter a quantity from 0 to 10,000.");
        return;
      }

      const n = Number(digits);

      if (
        digits.length > 5 ||
        !Number.isSafeInteger(n) ||
        n > MAX_QUANTITY
      ) {
        input.value = String(
          selectedItem(book)?.quantity || item.quantity
        );

        showError("Maximum quantity is 10,000.");

        return;
      }

      /*
       * 0 is a valid temporary editing value.
       * The item is removed only when editing is committed
       * through blur or Enter.
       */
      if (n === 0) {
        clearError();
        return;
      }

      clearError();

      setQty(book, n);
    };

    input.onblur = () => {
      const digits = input.value.replace(/\D/g, "");

      /*
       * Completely blank input does NOT remove the title.
       * Restore the latest valid quantity instead.
       */
      if (digits === "") {
        input.value = String(
          selectedItem(book)?.quantity || item.quantity
        );

        showError("Enter a quantity from 0 to 10,000.");

        return;
      }

      const n = Number(digits);

      if (
        !Number.isSafeInteger(n) ||
        n > MAX_QUANTITY
      ) {
        input.value = String(
          selectedItem(book)?.quantity || item.quantity
        );

        showError(
          n > MAX_QUANTITY
            ? "Maximum quantity is 10,000."
            : "Enter a quantity from 0 to 10,000."
        );

        return;
      }

      /*
       * Our locked behaviour:
       *
       * Type 0
       * → finish editing
       * → remove the title from My Selection.
       */
      if (n === 0) {
        if (remove(book)) {
          refresh();
        }

        return;
      }

      input.value = String(n);

      clearError();
    };

    input.onkeydown = e => {
      if (e.key === "Enter") {
        e.preventDefault();
        input.blur();
      }
    };

    q.append(minus, input, plus);

    wrap.append(q, error);

    return wrap;
  }

  /*
   * Keep different open catalogue tabs synchronized.
   */
  window.addEventListener("storage", e => {
    if (
      e.key === ORDER_KEY &&
      typeof refresh === "function"
    ) {
      refresh();
    }
  });

  /*
   * Expose the shared catalogue-selection API.
   *
   * Existing pages can continue calling the same function
   * names, so the refactor does not change their behaviour.
   */
  Object.assign(window, {
    CAMBRIDGE_ORDER_KEY: ORDER_KEY,
    CAMBRIDGE_MAX_QUANTITY: MAX_QUANTITY,

    order,
    validQty,
    save,
    key,
    indexOfBook,
    selectedItem,
    selectedCount,
    updateBar,
    add,
    setQty,
    remove,
    detailsUrl,
    coverNode,
    actionNode
  });
})();
