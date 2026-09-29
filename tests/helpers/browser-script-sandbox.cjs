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
  const document = {
    readyState: "loading",
    documentElement: { style: {} },
    head: { appendChild() {} },
    body: { classList: { add() {}, remove() {} }, appendChild() {} },
    addEventListener() {},
    getElementById() { return null; },
    createElement() { return { style: {}, appendChild() {}, append() {}, setAttribute() {}, addEventListener() {} }; },
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
  const window = {
    localStorage,
    sessionStorage,
    location,
    document,
    scrollY: 0,
    pageYOffset: 0,
    addEventListener(name, listener) { listeners.set(name, listener); },
    dispatchEvent(event) { const listener = listeners.get(event.type); if (listener) listener(event); },
    scrollTo() {}
  };
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
    history: { length: 0, back() {} },
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
