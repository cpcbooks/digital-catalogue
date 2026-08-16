/* Cambridge Digital Catalogue — canonical catalogue data validator */
(function (global) {
  "use strict";

  const VALID_CATEGORIES = new Set([
    "early-learning",
    "school",
    "exam",
    "higher-education",
    "competitive-exams"
  ]);
  const EARLY_CLASSES = new Set(["Nursery", "LKG", "UKG"]);
  const SCHOOL_CLASSES = new Set(["1","2","3","4","5","6","7","8","9","10"]);
  const TEXT_FIELDS = ["sku","isbn","series","family","subject","displaySubject","medium","type","cover","description"];

  function issue(severity, code, message, book, index) {
    return { severity, code, message, index, id: book && book.id ? book.id : "", title: book && book.title ? book.title : "" };
  }
  function textOrEmpty(value) { return value === undefined || value === null || typeof value === "string"; }
  function normalizedClass(value) {
    if (value === null || value === undefined) return "";
    const raw = String(value).trim();
    if (/^(?:[1-9]|10)$/.test(raw)) return raw;
    const upper = raw.toUpperCase();
    if (upper === "NURSERY" || upper === "NUR") return "Nursery";
    if (upper === "LKG") return "LKG";
    if (upper === "UKG") return "UKG";
    return raw;
  }

  function validateCatalogue(records) {
    const errors = [], warnings = [], info = [];
    if (!Array.isArray(records)) {
      errors.push(issue("error","CATALOGUE_NOT_ARRAY","CAMBRIDGE_CATALOGUE must be an array.",null,-1));
      return { valid:false, errors, warnings, info, summary:{records:0,errors:1,warnings:0,info:0} };
    }

    const ids = new Map(), skus = new Map(), isbns = new Map();
    records.forEach((book,index) => {
      if (!book || typeof book !== "object" || Array.isArray(book)) {
        errors.push(issue("error","INVALID_RECORD","Catalogue record must be an object.",book,index)); return;
      }

      if (typeof book.id !== "string" || !book.id.trim()) errors.push(issue("error","MISSING_ID","Every catalogue record requires a permanent id.",book,index));
      else if (ids.has(book.id.trim())) errors.push(issue("error","DUPLICATE_ID",`Duplicate id "${book.id.trim()}".`,book,index));
      else ids.set(book.id.trim(), index);

      if (typeof book.title !== "string" || !book.title.trim()) errors.push(issue("error","MISSING_TITLE","Every catalogue record requires a title.",book,index));
      if (!VALID_CATEGORIES.has(book.category)) errors.push(issue("error","INVALID_CATEGORY","Unsupported catalogue category.",book,index));
      if (book.active !== undefined && typeof book.active !== "boolean") errors.push(issue("error","INVALID_ACTIVE","active must be true or false.",book,index));

      TEXT_FIELDS.forEach(field => { if (!textOrEmpty(book[field])) errors.push(issue("error","INVALID_"+field.toUpperCase(),field+" must be text or empty.",book,index)); });

      if (Object.prototype.hasOwnProperty.call(book,"levels")) errors.push(issue("error","LEGACY_LEVELS_FIELD","Legacy `levels` is not allowed in the canonical catalogue model. Use `class` only.",book,index));

      if (!Array.isArray(book.class)) errors.push(issue("error","CLASS_NOT_ARRAY","class must be an array.",book,index));
      else {
        const values = book.class.map(normalizedClass).filter(Boolean);
        if (new Set(values).size !== values.length) warnings.push(issue("warning","DUPLICATE_CLASS","class contains duplicate values.",book,index));
        if (["early-learning","school","exam"].includes(book.category) && values.length === 0) errors.push(issue("error","CLASS_REQUIRED","This catalogue category requires at least one class value.",book,index));
        if (book.category === "early-learning" && values.some(v => !EARLY_CLASSES.has(v))) errors.push(issue("error","INVALID_EARLY_CLASS","Early Learning class values must be Nursery, LKG or UKG.",book,index));
        if (["school","exam"].includes(book.category) && values.some(v => !SCHOOL_CLASSES.has(v))) errors.push(issue("error","INVALID_SCHOOL_CLASS","School/Exam class values must be 1–10.",book,index));
      }

      if (book.category === "school" && book.medium && book.medium !== "English") errors.push(issue("error","SCHOOL_MEDIUM","Current school textbook records must be English medium; subject language does not determine medium.",book,index));
      if (book.category === "exam" && book.medium && !["English","Kannada"].includes(book.medium)) errors.push(issue("error","EXAM_MEDIUM","Current guide/exam records support English or Kannada medium only.",book,index));

      if (typeof book.sku === "string" && book.sku.trim()) {
        const sku = book.sku.trim().toUpperCase();
        if (skus.has(sku)) errors.push(issue("error","DUPLICATE_SKU",`Duplicate SKU "${book.sku.trim()}".`,book,index)); else skus.set(sku,index);
      } else info.push(issue("info","SKU_PENDING","SKU is not populated yet.",book,index));

      if (typeof book.isbn === "string" && book.isbn.trim()) {
        const isbn = book.isbn.replace(/[\s-]/g,"");
        if (!/^(?:\d{10}|\d{13})$/.test(isbn)) warnings.push(issue("warning","ISBN_FORMAT","ISBN should contain 10 or 13 digits after spaces/hyphens are removed.",book,index));
        if (isbns.has(isbn)) errors.push(issue("error","DUPLICATE_ISBN",`Duplicate ISBN "${book.isbn.trim()}".`,book,index)); else isbns.set(isbn,index);
      } else info.push(issue("info","ISBN_PENDING","ISBN is not populated yet.",book,index));

      if (book.mrp === undefined || book.mrp === null || book.mrp === "") info.push(issue("info","MRP_PENDING","MRP is not populated yet.",book,index));
      else if (typeof book.mrp !== "number" || !Number.isFinite(book.mrp) || book.mrp < 0) errors.push(issue("error","INVALID_MRP","mrp must be a non-negative number or null.",book,index));

      if (book.features !== undefined && (!Array.isArray(book.features) || book.features.some(v => typeof v !== "string"))) errors.push(issue("error","INVALID_FEATURES","features must be an array of text values.",book,index));
      if (!book.cover && !(book.images && book.images.front)) info.push(issue("info","COVER_PENDING","Front cover is not populated yet.",book,index));
      if (!book.description) info.push(issue("info","DESCRIPTION_PENDING","Description is not populated yet.",book,index));
      if (book.family && book.series && book.family === book.series) warnings.push(issue("warning","REDUNDANT_FAMILY","family duplicates series; retain only while compatibility requires it.",book,index));
    });

    return { valid:errors.length===0, errors, warnings, info, summary:{records:records.length,errors:errors.length,warnings:warnings.length,info:info.length} };
  }

  function printReport(report) {
    const s=report.summary,label=report.valid?"PASS":"FAIL";
    console.groupCollapsed(`Cambridge Catalogue Validation: ${label} | ${s.records} records | ${s.errors} errors | ${s.warnings} warnings | ${s.info} pending/info`);
    if(report.errors.length) console.table(report.errors);
    if(report.warnings.length) console.table(report.warnings);
    if(report.info.length) console.table(report.info);
    console.groupEnd();
  }
  function run(records) { const report=validateCatalogue(records); printReport(report); return report; }

  global.CambridgeCatalogueValidator=Object.freeze({validateCatalogue,printReport,run});
  if(Array.isArray(global.CAMBRIDGE_CATALOGUE)) run(global.CAMBRIDGE_CATALOGUE);
})(window);
