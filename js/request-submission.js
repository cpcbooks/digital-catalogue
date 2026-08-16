/* Cambridge Digital Catalogue — request submission contract + live backend adapter */
(function () {
  "use strict";

  const SCHEMA_VERSION = "1.0";
  const CATALOGUE_VERSION = "2026-27";
  const ORDER_KEY = "cambridgeOrder";
  const REQUEST_KEY = "cambridgeRequestDetails";
  const MAX_QUANTITY = 10000;
  const SUBMISSION_URL = "https://ysaxagxortpxyifyaydx.supabase.co/functions/v1/submit-catalogue-request";

  function text(value) { return value == null ? "" : String(value).trim(); }
  function nullable(value) { const v = text(value); return v || null; }
  function numberOrNull(value) { const n = Number(value); return Number.isFinite(n) ? n : null; }
  function readJSON(key, fallback) { try { const value = JSON.parse(localStorage.getItem(key) || "null"); return value == null ? fallback : value; } catch (error) { return fallback; } }
  function catalogueProducts() { return Array.isArray(window.CAMBRIDGE_CATALOGUE) ? window.CAMBRIDGE_CATALOGUE : []; }
  function findMasterProduct(item) {
    const products = catalogueProducts();
    if (item && item.id) { const x = products.find(p => p && p.id === item.id); if (x) return x; }
    if (item && item.sku) { const x = products.find(p => p && p.sku && p.sku === item.sku); if (x) return x; }
    if (item && item.isbn) { const x = products.find(p => p && p.isbn && p.isbn === item.isbn); if (x) return x; }
    return null;
  }
  function operationalIdentity(item) {
    const master = findMasterProduct(item) || {};
    return { productId: nullable(master.productId || master.id || item.productId || item.id), sku: nullable(master.sku || item.sku), tallyName: nullable(master.tallyName || master.tallyItemName || item.tallyName || item.tallyItemName), isbn: nullable(master.isbn || item.isbn), displayName: text(master.title || item.title || "Untitled Book"), series: nullable(master.series || item.series), subject: nullable(master.subject || item.subject), medium: nullable(master.medium || item.medium), class: master.class ?? item.class ?? null, level: nullable(item.level || master.level), mrp: numberOrNull(master.mrp ?? item.mrp) };
  }
  function normalQuantity(value) { const n = Number(value); if (!Number.isSafeInteger(n) || n < 1 || n > MAX_QUANTITY) throw new Error("Invalid request quantity."); return n; }
  function bookLine(item) { return { lineType: "book", ...operationalIdentity(item), quantity: normalQuantity(item.quantity) }; }
  function kitComponent(book) { return { ...operationalIdentity(book), componentQuantityPerSet: 1 }; }
  function kitLine(item) {
    const components = Array.isArray(item.books) ? item.books.map(kitComponent) : [];
    return { lineType: "custom-kit", kitId: nullable(item.id), productId: null, sku: null, tallyName: null, isbn: null, displayName: text(item.title || ((item.levelName || "Custom") + " Custom Kit")), level: nullable(item.level), levelName: nullable(item.levelName), quantity: normalQuantity(item.quantity), componentCount: components.length, components };
  }
  function customerPayload(details) {
    const whatsapp = details.whatsappSameAsMobile ? details.mobile : details.whatsapp;
    return { customerType: nullable(details.customerType), contactName: nullable(details.contactName), organisationName: nullable(details.organisationName), mobile: nullable(details.mobile), whatsapp: nullable(whatsapp), email: nullable(details.email), preferredContact: nullable(details.preferredContact || "call"), location: { city: nullable(details.city), district: nullable(details.district), state: nullable(details.state), pincode: nullable(details.pincode) }, existingCambridgeCustomer: nullable(details.existingCustomer), notes: nullable(details.notes) };
  }
  function buildPayload() {
    const order = readJSON(ORDER_KEY, []), details = readJSON(REQUEST_KEY, {});
    if (!Array.isArray(order) || !order.length) throw new Error("The request has no selected items.");
    const lines = order.map(item => item && item.type === "custom-kit" ? kitLine(item) : bookLine(item || {}));
    return { schemaVersion: SCHEMA_VERSION, requestId: null, status: "new", catalogueVersion: CATALOGUE_VERSION, submittedAt: null, source: "digital-catalogue", customer: customerPayload(details), selection: { lineCount: lines.length, totalCopiesOrSets: lines.reduce((sum, line) => sum + line.quantity, 0), lines } };
  }
  function buildBackendPayload() {
    const order = readJSON(ORDER_KEY, []), d = readJSON(REQUEST_KEY, {});
    if (!Array.isArray(order) || !order.length) throw new Error("The request has no selected items.");
    const whatsapp = d.whatsappSameAsMobile ? d.mobile : d.whatsapp;
    return {
      customer: { name: text(d.contactName), phone: text(d.mobile), email: nullable(d.email), organisation: nullable(d.organisationName), place: nullable(d.city), district: nullable(d.district), state: nullable(d.state), pincode: nullable(d.pincode), whatsapp: nullable(whatsapp), customerType: nullable(d.customerType), existingCustomer: nullable(d.existingCustomer), preferredContact: nullable(d.preferredContact) },
      notes: nullable(d.notes),
      items: order.map(item => {
        const q = normalQuantity(item.quantity);
        if (item.type === "custom-kit") return { ...item, type: "custom-kit", title: text(item.title || ((item.levelName || "Custom") + " Custom Kit")), quantity: q, books: Array.isArray(item.books) ? item.books : [] };
        return { ...item, type: "book", title: text(item.title || "Untitled Book"), quantity: q };
      })
    };
  }
  async function submit(adapter) {
    if (!adapter || typeof adapter.submit !== "function") throw new Error("Request submission service is not connected.");
    const payload = buildPayload(), result = await adapter.submit(payload);
    if (!result || !result.requestId) throw new Error("The request was not confirmed by the submission service.");
    return { payload, result };
  }
  async function submitLive() {
    const payload = buildBackendPayload();
    const response = await fetch(SUBMISSION_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    let result = null; try { result = await response.json(); } catch (e) {}
    if (!response.ok || !result || result.ok !== true || !result.reference) throw new Error(result && result.error ? result.error : "We could not submit your request. Please try again.");
    return result;
  }
  function clearSubmittedDraft() { localStorage.removeItem(ORDER_KEY); localStorage.removeItem(REQUEST_KEY); }

  window.CambridgeRequestSubmission = Object.freeze({ SCHEMA_VERSION, CATALOGUE_VERSION, buildPayload, buildBackendPayload, submit, submitLive, clearSubmittedDraft });
})();
