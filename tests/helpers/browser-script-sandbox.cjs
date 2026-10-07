const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial).map(([key, value]) => [key, String(value)]));
  return {
    get length() { return values.size; },
    key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
    setItem(key, value) { values.set(String(key), String(value)); },
    removeItem(key) { values.delete(String(key)); },
    clear() { values.clear(); },
    snapshot() { return Object.fromEntries(values); }
  };
}

function createBrowserSandbox(options = {}) {
  const localStorage = options.localStorage || createStorage(options.localStorageData);
  const sessionStorage = options.sessionStorage || createStorage(options.sessionStorageData);
  const location = Object.assign({
    href: "https://catalogue.example.test/index.html",
    pathname: "/index.html",
    search: "",
    hash: ""
  }, options.location);
  const listeners = new Map();
  const documentListeners = new Map();
  const document = {
    readyState: "loading",
    documentElement: { style: {} },
    head: { appendChild() {} },
    body: { classList: { add() {}, remove() {} }, appendChild() {} },
    addEventListener(name, listener) {
      const handlers = documentListeners.get(name) || [];
      handlers.push(listener);
      documentListeners.set(name, handlers);
    },
    dispatchEvent(event) {
      (documentListeners.get(event.type) || []).forEach(listener => listener(event));
    },
    getElementById() { return null; },
    createElement() { return { style: {}, appendChild() {}, append() {}, setAttribute() {}, addEventListener() {} }; },
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
  const history = {
    length: 0,
    back() {},
    replaceState(_, __, value) {
      const next = new URL(String(value), location.href);
      location.href = next.href;
      location.pathname = next.pathname;
      location.search = next.search;
      location.hash = next.hash;
    }
  };
  const window = {
    localStorage,
    sessionStorage,
    location,
    document,
    scrollY: 0,
    pageYOffset: 0,
    history,
    addEventListener(name, listener) { listeners.set(name, listener); },
    dispatchEvent(event) { const listener = listeners.get(event.type); if (listener) listener(event); },
    scrollTo() {}
  };
  let uuidCounter = 0;
  window.crypto = options.crypto || { randomUUID: () => `11111111-1111-4111-8111-${String(++uuidCounter).padStart(12, "0")}` };
  window.window = window;
  const context = vm.createContext({
    window,
    document,
    localStorage,
    sessionStorage,
    location,
    URL,
    URLSearchParams,
    console: options.console || { warn() {}, error() {}, groupCollapsed() {}, table() {}, groupEnd() {} },
    fetch: options.fetch || (async () => { throw new Error("Unexpected fetch in unit test."); }),
    alert: options.alert || (() => {}),
    CustomEvent: class CustomEvent { constructor(type, init = {}) { this.type = type; Object.assign(this, init); } },
    performance: { getEntriesByType() { return []; } },
    history,
    requestAnimationFrame(callback) { return callback(); },
    Date,
    Promise,
    Set,
    Map,
    Array,
    Object,
    String,
    Number,
    Boolean,
    JSON,
    Math,
    RegExp,
    Error,
    TypeError
  });
  return { context, window, localStorage, sessionStorage };
}

function loadBrowserScript(sandbox, relativePath) {
  const file = path.resolve(__dirname, "..", "..", relativePath);
  vm.runInContext(fs.readFileSync(file, "utf8"), sandbox.context, { filename: file });
  return sandbox.window;
}

module.exports = { createStorage, createBrowserSandbox, loadBrowserScript };
