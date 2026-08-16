/* Cambridge Digital Catalogue — request submission contract
   Builds the internal, backend-ready request payload.
   This module does NOT pretend to submit a request. A real backend adapter
   must return success before the customer is shown a confirmation page. */
(function () {
  "use strict";

  const SCHEMA_VERSION = "1.0";
  const CATALOGUE_VERSION = "2026-27";
  const ORDER_KEY = "cambridgeOrder";
  const REQUEST_KEY = "cambridgeRequestDetails";
  const MAX_QUANTITY = 10000;

  function text(value) { return value == null ? "" : String(value).trim(); }
  function nullable(value) { const v = text(value); return v || null; }
  function numberOrNull(value) { const n = Number(value); return Number.isFinite(n) ? n : null; }

  function readJSON(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value == null ? fallback : value;
    } catch (error) { return fallback; }
  }

  function catalogueProducts() {
    return Array.isArray(window.CAMBRIDGE_CATALOGUE) ? window.CAMBRIDGE_CATALOGUE : [];
  }

  function findMasterProduct(item) {
    const products = catalogueProducts();
    if (item && item.id) {
      const byId = products.find(product => product && product.id === item.id);
      if (byId) return byId;
    }
    if (item && item.sku) {
      const bySku = products.find(product => product && product.sku && product.sku === item.sku);
      if (bySku) return bySku;
    }
    if (item && item.isbn) {
      const byIsbn = products.find(product => product && product.isbn && product.isbn === item.isbn);
      if (byIsbn) return byIsbn;
    }
    return null;
  }

  function operationalIdentity(item) {
    const master = findMasterProduct(item) || {};
    return {
      productId: nullable(master.productId || master.id || item.productId || item.id),
      sku: nullable(master.sku || item.sku),
      tallyName: nullable(master.tallyName || master.tallyItemName || item.tallyName || item.tallyItemName),
      isbn: nullable(master.isbn || item.isbn),
      displayName: text(master.title || item.title || "Untitled Book"),
      series: nullable(master.series || item.series),
      subject: nullable(master.subject || item.subject),
      medium: nullable(master.medium || item.medium),
      class: master.class ?? item.class ?? null,
      level: nullable(item.level || master.level),
      mrp: numberOrNull(master.mrp ?? item.mrp)
    };
  }

  function normalQuantity(value) {
    const n = Number(value);
    if (!Number.isSafeInteger(n) || n < 1 || n > MAX_QUANTITY) throw new Error("Invalid request quantity.");
    return n;
  }

  function bookLine(item) {
    return {
      lineType: "book",
      ...operationalIdentity(item),
      quantity: normalQuantity(item.quantity)
    };
  }

  function kitComponent(book) {
    return {
      ...operationalIdentity(book),
      componentQuantityPerSet: 1
    };
  }

  function kitLine(item) {
    const components = Array.isArray(item.books) ? item.books.map(kitComponent) : [];
    return {
      lineType: "custom-kit",
      kitId: nullable(item.id),
      productId: null,
      sku: null,
      tallyName: null,
      isbn: null,
      displayName: text(item.title || ((item.levelName || "Custom") + " Custom Kit")),
      level: nullable(item.level),
      levelName: nullable(item.levelName),
      quantity: normalQuantity(item.quantity),
      componentCount: components.length,
      components
    };
  }

  function customerPayload(details) {
    const whatsapp = details.whatsappSameAsMobile ? details.mobile : details.whatsapp;
    return {
      customerType: nullable(details.customerType),
      contactName: nullable(details.contactName),
      organisationName: nullable(details.organisationName),
      mobile: nullable(details.mobile),
      whatsapp: nullable(whatsapp),
      email: nullable(details.email),
      preferredContact: nullable(details.preferredContact || "call"),
      location: {
        city: nullable(details.city),
        district: nullable(details.district),
        state: nullable(details.state),
        pincode: nullable(details.pincode)
      },
      existingCambridgeCustomer: nullable(details.existingCustomer),
      notes: nullable(details.notes)
    };
  }

  function buildPayload() {
    const order = readJSON(ORDER_KEY, []);
    const details = readJSON(REQUEST_KEY, {});
    if (!Array.isArray(order) || !order.length) throw new Error("The request has no selected items.");
    const lines = order.map(item => item && item.type === "custom-kit" ? kitLine(item) : bookLine(item || {}));
    return {
      schemaVersion: SCHEMA_VERSION,
      requestId: null,
      status: "new",
      catalogueVersion: CATALOGUE_VERSION,
      submittedAt: null,
      source: "digital-catalogue",
      customer: customerPayload(details),
      selection: {
        lineCount: lines.length,
        totalCopiesOrSets: lines.reduce((sum, line) => sum + line.quantity, 0),
        lines
      }
    };
  }

  /* Adapter contract for the future backend:
     submit(payload) must resolve with an authoritative object such as
     { requestId, submittedAt, status }. The backend — not the browser —
     owns request-ID generation and final acceptance. */
  async function submit(adapter) {
    if (!adapter || typeof adapter.submit !== "function") throw new Error("Request submission service is not connected.");
    const payload = buildPayload();
    const result = await adapter.submit(payload);
    if (!result || !result.requestId) throw new Error("The request was not confirmed by the submission service.");
    return { payload, result };
  }

  window.CambridgeRequestSubmission = Object.freeze({
    SCHEMA_VERSION, CATALOGUE_VERSION, buildPayload, submit
  });
})();
