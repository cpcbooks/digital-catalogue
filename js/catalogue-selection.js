/* Cambridge Digital Catalogue — shared selection controls */
(function () {
  "use strict";

  const ORDER_KEY = "cambridgeOrder";
  const MAX_QUANTITY = 10000;
  const CHANGE_EVENT = "cambridge-selection-change";

  function validQty(value) {
    const n = Number(value);
    return Number.isInteger(n) && n >= 1 && n <= MAX_QUANTITY;
  }

  function readOrder() {
    let items = [];

    try {
      const parsed = JSON.parse(
        localStorage.getItem(ORDER_KEY) || "[]"
      );

      if (Array.isArray(parsed)) {
        items = parsed;
      }
    } catch (error) {
      console.warn(
        "Cambridge Catalogue: could not read selection.",
        error
      );
    }

    return items
      .filter(
        item =>
          item &&
          typeof item === "object"
      )
      .map(item => ({
        ...item,
        quantity: validQty(item.quantity)
          ? Number(item.quantity)
          : 1
      }));
  }

  function saveOrder(items) {
    try {
      localStorage.setItem(
        ORDER_KEY,
        JSON.stringify(items)
      );

      return true;
    } catch (error) {
      console.error(
        "Cambridge Catalogue: could not save selection.",
        error
      );

      alert(
        "Your selection could not be saved on this device. Please try again."
      );

      return false;
    }
  }

  function itemKey(item) {
    if (item.id) {
      return "id:" + item.id;
    }

    if (item.sku) {
      return "sku:" + item.sku;
    }

    if (item.isbn) {
      return "isbn:" + item.isbn;
    }

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

  function indexOfBook(
    book,
    items = readOrder()
  ) {
    const wanted = itemKey(book);

    return items.findIndex(
      item =>
        item.type !== "custom-kit" &&
        itemKey(item) === wanted
    );
  }

  function selectedItem(book) {
    const items = readOrder();

    const index = indexOfBook(
      book,
      items
    );

    return index < 0
      ? null
      : items[index];
  }

  function selectedCount() {
    return readOrder().filter(
      item =>
        item.type !== "custom-kit"
    ).length;
  }

  function updateBar() {
    const bar =
      document.getElementById(
        "selectionBar"
      );

    const status =
      document.getElementById(
        "selectionStatus"
      );

    if (!bar || !status) {
      return;
    }

    const count =
      selectedCount();

    bar.hidden =
      count === 0;

    status.innerHTML =
      "<strong>" +
      count +
      "</strong> " +
      (
        count === 1
          ? "title selected"
          : "titles selected"
      );
  }

  function add(
    book,
    extra = {}
  ) {
    const items =
      readOrder();

    if (
      indexOfBook(
        book,
        items
      ) >= 0
    ) {
      return true;
    }

    items.push({
      id:
        book.id || "",

      sku:
        book.sku || "",

      isbn:
        book.isbn || "",

      title:
        book.title ||
        "Untitled Book",

      series:
        book.series || "",

      family:
        book.family || "",

      class:
        book.class || "",

      level:
        extra.level ||
        book.level ||
        "",

      levelName:
        extra.levelName || "",

      subject:
        book.subject || "",

      type:
        book.type || "",

      medium:
        book.medium || "",

      mrp:
        Number.isFinite(
          book.mrp
        )
          ? book.mrp
          : null,

      cover:
        book.cover || "",

      quantity: 1
    });

    return saveOrder(items);
  }

  function remove(book) {
    const items =
      readOrder();

    const index =
      indexOfBook(
        book,
        items
      );

    if (index < 0) {
      return true;
    }

    items.splice(
      index,
      1
    );

    return saveOrder(items);
  }

  function setQty(
    book,
    value
  ) {
    let quantity =
      Number(value);

    if (
      !Number.isFinite(
        quantity
      )
    ) {
      return false;
    }

    quantity =
      Math.trunc(quantity);

    if (quantity < 1) {
      return remove(book);
    }

    if (
      quantity >
      MAX_QUANTITY
    ) {
      quantity =
        MAX_QUANTITY;
    }

    const items =
      readOrder();

    const index =
      indexOfBook(
        book,
        items
      );

    if (index < 0) {
      if (
        !add(
          book,
          window.SELECTION_EXTRA ||
            {}
        )
      ) {
        return false;
      }

      return setQty(
        book,
        quantity
      );
    }

    items[index].quantity =
      quantity;

    return saveOrder(items);
  }

  function emitChange() {
    window.dispatchEvent(
      new CustomEvent(
        CHANGE_EVENT
      )
    );
  }

  function detailsUrl(book) {
    const base =
      "book-details.html?id=" +
      encodeURIComponent(
        book.id || ""
      );

    const level =
      window.SELECTION_EXTRA &&
      window.SELECTION_EXTRA.level
        ? window.SELECTION_EXTRA.level
        : "";

    return level
      ? base +
          "&level=" +
          encodeURIComponent(
            level
          )
      : base;
  }

  function coverNode(book) {
    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.className =
      "book-cover";

    if (!book.cover) {
      wrapper.textContent =
        "BOOK COVER";

      return wrapper;
    }

    const image =
      document.createElement(
        "img"
      );

    image.src =
      book.cover;

    image.alt =
      (book.title || "Book") +
      " cover";

    image.loading =
      "lazy";

    image.onerror = () => {
      wrapper.innerHTML = "";

      wrapper.textContent =
        "BOOK COVER";
    };

    wrapper.appendChild(
      image
    );

    return wrapper;
  }

  function actionNode(book) {
    const actions =
      document.createElement(
        "div"
      );

    actions.className =
      "book-actions";

    /*
     * VIEW BOOK
     */
    const view =
      document.createElement(
        "a"
      );

    view.className =
      "view-book";

    view.href =
      detailsUrl(book);

    view.textContent =
      "View Book →";

    actions.appendChild(
      view
    );

    const selected =
      selectedItem(book);

    /*
     * NOT YET SELECTED
     */
    if (!selected) {
      const addButton =
        document.createElement(
          "button"
        );

      addButton.type =
        "button";

      addButton.className =
        "add-book";

      addButton.textContent =
        "+ Add to Selection";

      addButton.onclick =
        () => {
          if (
            add(
              book,
              window.SELECTION_EXTRA ||
                {}
            )
          ) {
            emitChange();
          }
        };

      actions.appendChild(
        addButton
      );

      return actions;
    }

    /*
     * QUANTITY CONTROL
     */
    const control =
      document.createElement(
        "div"
      );

    control.className =
      "qty-control";

    const minus =
      document.createElement(
        "button"
      );

    minus.type =
      "button";

    minus.setAttribute(
      "aria-label",
      "Decrease quantity"
    );

    minus.textContent =
      "−";

    const input =
      document.createElement(
        "input"
      );

    input.type =
      "text";

    input.inputMode =
      "numeric";

    input.pattern =
      "[0-9]*";

    input.autocomplete =
      "off";

    input.enterKeyHint =
      "done";

    input.maxLength =
      5;

    input.value =
      String(
        selected.quantity
      );

    input.setAttribute(
      "aria-label",
      "Quantity"
    );

    const plus =
      document.createElement(
        "button"
      );

    plus.type =
      "button";

    plus.setAttribute(
      "aria-label",
      "Increase quantity"
    );

    plus.textContent =
      "+";

    const error =
      document.createElement(
        "div"
      );

    error.className =
      "qty-error";

    error.setAttribute(
      "aria-live",
      "polite"
    );

    /*
     * ERROR HELPERS
     */
    const clearError =
      () => {
        control.classList.remove(
          "invalid"
        );

        error.textContent =
          "";
      };

    const showError =
      message => {
        control.classList.add(
          "invalid"
        );

        error.textContent =
          message;
      };

    /*
     * Always restore from
     * CURRENT stored quantity.
     *
     * This prevents the stale-state
     * bug we found earlier.
     */
    const restoreCurrent =
      () => {
        const current =
          selectedItem(book);

        input.value =
          String(
            current
              ? current.quantity
              : selected.quantity
          );
      };

    /*
     * MINUS
     */
    minus.onclick =
      () => {
        clearError();

        const current =
          selectedItem(book);

        if (!current) {
          emitChange();
          return;
        }

        const quantity =
          Number(
            current.quantity
          );

        /*
         * 1 → minus
         * removes selection.
         */
        if (quantity <= 1) {
          if (
            remove(book)
          ) {
            emitChange();
          }

          return;
        }

        if (
          setQty(
            book,
            quantity - 1
          )
        ) {
          emitChange();
        }
      };

    /*
     * PLUS
     */
    plus.onclick =
      () => {
        clearError();

        const current =
          selectedItem(book);

        if (!current) {
          if (
            add(
              book,
              window.SELECTION_EXTRA ||
                {}
            )
          ) {
            emitChange();
          }

          return;
        }

        const quantity =
          Number(
            current.quantity
          );

        if (
          quantity >=
          MAX_QUANTITY
        ) {
          showError(
            "Maximum quantity is 10,000."
          );

          return;
        }

        if (
          setQty(
            book,
            quantity + 1
          )
        ) {
          emitChange();
        }
      };

    /*
     * MANUAL QUANTITY ENTRY
     */
    input.oninput =
      () => {
        const digits =
          input.value.replace(
            /\D/g,
            ""
          );

        input.value =
          digits;

        /*
         * Blank is temporarily
         * allowed while editing.
         */
        if (
          digits === ""
        ) {
          showError(
            "Enter a quantity from 0 to 10,000."
          );

          return;
        }

        const quantity =
          Number(digits);

        /*
         * Prevent > 10,000
         * immediately.
         */
        if (
          digits.length > 5 ||
          !Number.isSafeInteger(
            quantity
          ) ||
          quantity >
            MAX_QUANTITY
        ) {
          restoreCurrent();

          showError(
            "Maximum quantity is 10,000."
          );

          return;
        }

        /*
         * 0 is allowed while
         * the user is editing.
         *
         * Removal happens only
         * after blur / Enter.
         */
        if (
          quantity === 0
        ) {
          clearError();
          return;
        }

        clearError();

        setQty(
          book,
          quantity
        );
      };

    /*
     * USER FINISHES EDITING
     */
    input.onblur =
      () => {
        const digits =
          input.value.replace(
            /\D/g,
            ""
          );

        /*
         * Blank does NOT remove.
         * Restore previous valid
         * quantity.
         */
        if (
          digits === ""
        ) {
          restoreCurrent();

          showError(
            "Enter a quantity from 0 to 10,000."
          );

          return;
        }

        const quantity =
          Number(digits);

        if (
          !Number.isSafeInteger(
            quantity
          ) ||
          quantity >
            MAX_QUANTITY
        ) {
          restoreCurrent();

          showError(
            quantity >
              MAX_QUANTITY
              ? "Maximum quantity is 10,000."
              : "Enter a quantity from 0 to 10,000."
          );

          return;
        }

        /*
         * LOCKED BEHAVIOUR:
         *
         * Type 0
         * → finish editing
         * → remove title.
         */
        if (
          quantity === 0
        ) {
          if (
            remove(book)
          ) {
            emitChange();
          }

          return;
        }

        input.value =
          String(quantity);

        clearError();
      };

    /*
     * ENTER commits the field.
     */
    input.onkeydown =
      event => {
        if (
          event.key ===
          "Enter"
        ) {
          event.preventDefault();

          input.blur();
        }
      };

    control.append(
      minus,
      input,
      plus
    );

    actions.append(
      control,
      error
    );

    return actions;
  }

  /*
   * Synchronize selection changes
   * between different browser tabs.
   */
  window.addEventListener(
    "storage",
    event => {
      if (
        event.key ===
        ORDER_KEY
      ) {
        emitChange();
      }
    }
  );

  /*
   * EXPLICIT SHARED API
   *
   * Catalogue pages now access
   * selection behaviour through:
   *
   * window.CambridgeSelection
   *
   * instead of depending on many
   * generic global functions.
   */
  window.CambridgeSelection =
    Object.freeze({
      ORDER_KEY,
      MAX_QUANTITY,
      CHANGE_EVENT,

      validQty,
      readOrder,
      saveOrder,
      itemKey,
      indexOfBook,
      selectedItem,
      selectedCount,
      updateBar,
      add,
      remove,
      setQty,
      detailsUrl,
      coverNode,
      actionNode
    });
})();
