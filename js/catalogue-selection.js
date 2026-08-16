/* Cambridge Digital Catalogue — shared selection controls */
(function () {
  "use strict";

  const ORDER_KEY = "cambridgeOrder";
  const MAX_QUANTITY = 10000;
  const CHANGE_EVENT = "cambridge-selection-change";

  const FLOATING_BAR_ID =
    "cambridgeFloatingSelection";

  const FLOATING_STYLE_ID =
    "cambridgeFloatingSelectionStyle";

  const BODY_ACTIVE_CLASS =
    "cambridge-floating-selection-active";


  /* =====================================================
     QUANTITY VALIDATION
  ===================================================== */

  function validQty(value) {
    const n = Number(value);

    return (
      Number.isInteger(n) &&
      n >= 1 &&
      n <= MAX_QUANTITY
    );
  }


  /* =====================================================
     READ SELECTION
  ===================================================== */

  function readOrder() {
    let items = [];

    try {
      const parsed =
        JSON.parse(
          localStorage.getItem(
            ORDER_KEY
          ) || "[]"
        );

      if (
        Array.isArray(parsed)
      ) {
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
      .map(
        item => ({
          ...item,

          quantity:
            validQty(
              item.quantity
            )
              ? Number(
                  item.quantity
                )
              : 1
        })
      );
  }


  /* =====================================================
     SAVE SELECTION
  ===================================================== */

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


  /* =====================================================
     UNIQUE BOOK KEY
  ===================================================== */

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

    const wanted =
      itemKey(book);

    return items.findIndex(
      item =>
        item.type !==
          "custom-kit" &&
        itemKey(item) ===
          wanted
    );
  }


  function selectedItem(book) {

    const items =
      readOrder();

    const index =
      indexOfBook(
        book,
        items
      );

    return index < 0
      ? null
      : items[index];
  }


  /* =====================================================
     SELECTED NORMAL BOOKS
  ===================================================== */

  function selectedItems() {

    return readOrder().filter(
      item =>
        item.type !==
        "custom-kit"
    );
  }


  function selectedCount() {

    return selectedItems()
      .length;
  }


  /*
   * Total physical quantity.
   *
   * Example:
   *
   * Book A = 8
   * Book B = 4
   *
   * Titles = 2
   * Books  = 12
   */
  function selectedQuantityTotal() {

    return selectedItems()
      .reduce(
        (total, item) => {

          const quantity =
            validQty(
              item.quantity
            )
              ? Number(
                  item.quantity
                )
              : 1;

          return (
            total +
            quantity
          );
        },
        0
      );
  }


  /* =====================================================
     ORDER PAGE CHECK
  ===================================================== */

  function isSelectionPage() {

    const path =
      (
        window.location &&
        window.location.pathname
      ) || "";

    return /(?:^|\/)order\.html$/i
      .test(path);
  }


  /* =====================================================
     FLOATING SELECTION BAR CSS
  ===================================================== */

  function ensureFloatingStyle() {

    if (
      document.getElementById(
        FLOATING_STYLE_ID
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      FLOATING_STYLE_ID;

    style.textContent = `

      .cambridge-floating-selection {

        position: fixed;

        left: 50%;

        bottom:
          max(
            14px,
            env(
              safe-area-inset-bottom
            )
          );

        z-index: 1000;

        width:
          min(
            680px,
            calc(
              100% - 28px
            )
          );

        transform:
          translateX(-50%);

        box-sizing:
          border-box;

        display: flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap: 14px;

        padding:
          11px
          12px
          11px
          16px;

        border:
          1px solid
          rgba(
            255,
            255,
            255,
            .16
          );

        border-radius:
          13px;

        background:
          #12233f;

        color:
          #ffffff;

        box-shadow:
          0
          12px
          34px
          rgba(
            18,
            35,
            63,
            .24
          );

        font-family:
          inherit;
      }


      .cambridge-floating-selection[hidden] {

        display:
          none !important;
      }


      .cambridge-floating-selection__summary {

        min-width: 0;

        display: flex;

        align-items:
          baseline;

        gap: 6px;

        flex-wrap:
          wrap;

        font-size:
          11px;

        line-height:
          1.3;
      }


      .cambridge-floating-selection__summary strong {

        font-size:
          12px;

        font-weight:
          800;
      }


      .cambridge-floating-selection__separator {

        opacity:
          .6;
      }


      .cambridge-floating-selection__link {

        flex:
          0 0 auto;

        display:
          inline-flex;

        align-items:
          center;

        justify-content:
          center;

        min-height:
          38px;

        padding:
          0 14px;

        border-radius:
          8px;

        background:
          #ffffff;

        color:
          #12233f;

        text-decoration:
          none;

        font-size:
          10px;

        font-weight:
          800;

        white-space:
          nowrap;
      }


      /*
       * Prevent the floating bar
       * from hiding the final
       * catalogue content.
       */
      body.cambridge-floating-selection-active {

        padding-bottom:
          88px;
      }


      @media (
        max-width: 520px
      ) {

        .cambridge-floating-selection {

          width:
            calc(
              100% - 20px
            );

          bottom:
            max(
              10px,
              env(
                safe-area-inset-bottom
              )
            );

          padding:
            10px
            10px
            10px
            13px;

          border-radius:
            12px;
        }


        .cambridge-floating-selection__summary {

          gap:
            4px;

          font-size:
            10px;
        }


        .cambridge-floating-selection__summary strong {

          font-size:
            11px;
        }


        .cambridge-floating-selection__link {

          min-height:
            36px;

          padding:
            0 11px;

          font-size:
            9px;
        }


        body.cambridge-floating-selection-active {

          padding-bottom:
            82px;
        }
      }

    `;

    document.head.appendChild(
      style
    );
  }


  /* =====================================================
     CREATE FLOATING BAR
  ===================================================== */

  function ensureFloatingBar() {

    /*
     * We don't need a shortcut to
     * My Selection while the user
     * is already on My Selection.
     */
    if (
      isSelectionPage()
    ) {
      return null;
    }


    let bar =
      document.getElementById(
        FLOATING_BAR_ID
      );


    if (bar) {
      return bar;
    }


    ensureFloatingStyle();


    bar =
      document.createElement(
        "aside"
      );


    bar.id =
      FLOATING_BAR_ID;


    bar.className =
      "cambridge-floating-selection";


    bar.hidden =
      true;


    bar.setAttribute(
      "aria-label",
      "Current book selection"
    );


    const summary =
      document.createElement(
        "div"
      );


    summary.className =
      "cambridge-floating-selection__summary";


    summary.setAttribute(
      "aria-live",
      "polite"
    );


    const titleText =
      document.createElement(
        "span"
      );


    titleText.dataset.role =
      "titles";


    const separator =
      document.createElement(
        "span"
      );


    separator.className =
      "cambridge-floating-selection__separator";


    separator.textContent =
      "·";


    const quantityText =
      document.createElement(
        "span"
      );


    quantityText.dataset.role =
      "quantity";


    const link =
      document.createElement(
        "a"
      );


    link.className =
      "cambridge-floating-selection__link";


    link.href =
      "order.html";


    link.textContent =
      "View Selection →";


    summary.append(
      titleText,
      separator,
      quantityText
    );


    bar.append(
      summary,
      link
    );


    document.body.appendChild(
      bar
    );


    return bar;
  }


  /* =====================================================
     UPDATE FLOATING BAR
  ===================================================== */

  function updateFloatingBar() {

    /*
     * May execute before body exists.
     */
    if (
      !document.body ||
      isSelectionPage()
    ) {
      return;
    }


    const count =
      selectedCount();


    const total =
      selectedQuantityTotal();


    const bar =
      ensureFloatingBar();


    if (!bar) {
      return;
    }


    /*
     * EMPTY SELECTION
     */
    if (
      count === 0
    ) {

      bar.hidden =
        true;


      document.body
        .classList
        .remove(
          BODY_ACTIVE_CLASS
        );


      return;
    }


    const titles =
      bar.querySelector(
        '[data-role="titles"]'
      );


    const quantity =
      bar.querySelector(
        '[data-role="quantity"]'
      );


    if (titles) {

      titles.innerHTML =
        "<strong>" +
        count +
        "</strong> " +
        (
          count === 1
            ? "title"
            : "titles"
        );
    }


    if (quantity) {

      quantity.innerHTML =
        "<strong>" +
        total +
        "</strong> " +
        (
          total === 1
            ? "book"
            : "books"
        );
    }


    bar.hidden =
      false;


    document.body
      .classList
      .add(
        BODY_ACTIVE_CLASS
      );
  }


  /* =====================================================
     EXISTING TOP SELECTION BAR
  ===================================================== */

  function updateBar() {

    const count =
      selectedCount();


    const bar =
      document.getElementById(
        "selectionBar"
      );


    const status =
      document.getElementById(
        "selectionStatus"
      );


    /*
     * Existing top bar remains
     * unchanged where it exists.
     */
    if (
      bar &&
      status
    ) {

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


    /*
     * Floating bar works even on
     * pages where the old top bar
     * does not exist.
     */
    updateFloatingBar();
  }


  /* =====================================================
     ADD BOOK
  ===================================================== */

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
        extra.levelName ||
        "",

      subject:
        book.subject ||
        "",

      type:
        book.type ||
        "",

      medium:
        book.medium ||
        "",

      mrp:
        Number.isFinite(
          book.mrp
        )
          ? book.mrp
          : null,

      cover:
        book.cover ||
        "",

      quantity:
        1
    });


    return saveOrder(
      items
    );
  }


  /* =====================================================
     REMOVE BOOK
  ===================================================== */

  function remove(book) {

    const items =
      readOrder();


    const index =
      indexOfBook(
        book,
        items
      );


    if (
      index < 0
    ) {

      return true;
    }


    items.splice(
      index,
      1
    );


    return saveOrder(
      items
    );
  }


  /* =====================================================
     SET QUANTITY
  ===================================================== */

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
      Math.trunc(
        quantity
      );


    /*
     * 0 removes selection.
     */
    if (
      quantity < 1
    ) {

      return remove(
        book
      );
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


    if (
      index < 0
    ) {

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


    return saveOrder(
      items
    );
  }


  /* =====================================================
     SELECTION CHANGE EVENT
  ===================================================== */

  function emitChange() {

    window.dispatchEvent(
      new CustomEvent(
        CHANGE_EVENT
      )
    );
  }


  /* =====================================================
     BOOK DETAILS URL
  ===================================================== */

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


  /* =====================================================
     BOOK COVER
  ===================================================== */

  function coverNode(book) {

    const wrapper =
      document.createElement(
        "div"
      );


    wrapper.className =
      "book-cover";


    if (
      !book.cover
    ) {

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
      (
        book.title ||
        "Book"
      ) +
      " cover";


    image.loading =
      "lazy";


    image.onerror =
      () => {

        wrapper.innerHTML =
          "";


        wrapper.textContent =
          "BOOK COVER";
      };


    wrapper.appendChild(
      image
    );


    return wrapper;
  }


  /* =====================================================
     BOOK ACTIONS
  ===================================================== */

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
      detailsUrl(
        book
      );


    view.textContent =
      "View Book →";


    actions.appendChild(
      view
    );


    const selected =
      selectedItem(
        book
      );


    /* ===================================================
       NOT YET SELECTED
    =================================================== */

    if (
      !selected
    ) {

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


    /* ===================================================
       QUANTITY CONTROL
    =================================================== */

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


    /* ===================================================
       ERROR HELPERS
    =================================================== */

    const clearError =
      () => {

        control.classList
          .remove(
            "invalid"
          );


        error.textContent =
          "";
      };


    const showError =
      message => {

        control.classList
          .add(
            "invalid"
          );


        error.textContent =
          message;
      };


    /*
     * Always restore from CURRENT
     * stored value.
     *
     * This preserves the stale-state
     * fix we implemented earlier.
     */
    const restoreCurrent =
      () => {

        const current =
          selectedItem(
            book
          );


        input.value =
          String(
            current
              ? current.quantity
              : selected.quantity
          );
      };


    /* ===================================================
       MINUS
    =================================================== */

    minus.onclick =
      () => {

        clearError();


        const current =
          selectedItem(
            book
          );


        if (
          !current
        ) {

          emitChange();

          return;
        }


        const quantity =
          Number(
            current.quantity
          );


        /*
         * 1 → minus removes item.
         */
        if (
          quantity <= 1
        ) {

          if (
            remove(
              book
            )
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


    /* ===================================================
       PLUS
    =================================================== */

    plus.onclick =
      () => {

        clearError();


        const current =
          selectedItem(
            book
          );


        if (
          !current
        ) {

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


    /* ===================================================
       MANUAL QUANTITY ENTRY
    =================================================== */

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
         * Temporarily allow blank
         * while editing.
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
          Number(
            digits
          );


        /*
         * Prevent values above
         * 10,000 immediately.
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
         * 0 is allowed while the user
         * is still editing.
         *
         * Actual removal happens on
         * blur / Enter.
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


        /*
         * Manual quantity changes
         * do not rerender the whole
         * page immediately.
         *
         * Update floating total here.
         */
        updateFloatingBar();
      };


    /* ===================================================
       INPUT BLUR
    =================================================== */

    input.onblur =
      () => {

        const digits =
          input.value.replace(
            /\D/g,
            ""
          );


        /*
         * Blank does NOT remove.
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
          Number(
            digits
          );


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
         * LOCKED BEHAVIOUR
         *
         * 0 → finish editing
         *   → remove selection
         */
        if (
          quantity === 0
        ) {

          if (
            remove(
              book
            )
          ) {

            emitChange();
          }


          return;
        }


        input.value =
          String(
            quantity
          );


        clearError();


        updateFloatingBar();
      };


    /* ===================================================
       ENTER
    =================================================== */

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


  /* =====================================================
     MULTIPLE-TAB SYNCHRONIZATION
  ===================================================== */

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


  /* =====================================================
     CENTRAL FLOATING BAR UPDATE
  ===================================================== */

  window.addEventListener(
    CHANGE_EVENT,
    updateBar
  );


  /*
   * Show floating bar immediately
   * when opening another catalogue
   * page with an existing selection.
   */
  document.addEventListener(
    "DOMContentLoaded",
    () => {

      updateFloatingBar();
    }
  );


  /* =====================================================
     PUBLIC SHARED API
  ===================================================== */

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
