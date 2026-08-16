/*
=========================================================
CAMBRIDGE DIGITAL CATALOGUE — CENTRAL PRODUCT DATA
=========================================================
Canonical rules:
- `class` is always an array.
- Nursery/LKG/UKG and Classes 1–10 use the same `class` field.
- There is no `levels` field.
- Subject and medium are independent.
- Current school textbook records are English medium, including
  Kannada/Hindi language-subject books.
- Empty SKU / ISBN / MRP / cover fields are intentional until
  verified master data is available.
=========================================================
*/

(function (global) {
  "use strict";

  const records = [];
  const cls = value => [String(value)];
  const earlyAll = ["Nursery", "LKG", "UKG"];

  function add(book) {
    records.push({
      sku: "",
      isbn: "",
      series: "",
      medium: "",
      mrp: null,
      cover: "",
      active: true,
      ...book,
      class: Array.isArray(book.class) ? [...book.class] : cls(book.class)
    });
  }

  /* =====================================================
     SCHOOL BOOKS — CLASSES 1–4
  ===================================================== */
  [1, 2, 3, 4].forEach(classNumber => {
    [1, 2].forEach(semester => add({
      id: `semester-${classNumber}-${semester}`,
      title: `Semester ${semester}`,
      series: "Semester Series",
      class: cls(classNumber),
      subject: "Semester",
      category: "school",
      medium: "English"
    }));
  });

  /* =====================================================
     SCHOOL BOOKS — CLASSES 5–10
     Language subjects remain English-medium textbook records.
  ===================================================== */
  const schoolBooks = [
    ["english-reader", "English Reader", "English"],
    ["english-workbook", "English Workbook", "English"],
    ["kannada-reader", "Kannada Reader", "Kannada"],
    ["kannada-workbook", "Kannada Workbook", "Kannada"],
    ["hindi-reader", "Hindi Reader", "Hindi"],
    ["hindi-workbook", "Hindi Workbook", "Hindi"],
    ["mathematics", "Mathematics", "Mathematics"],
    ["science", "Science", "Science"],
    ["social-science", "Social Science", "Social Science"]
  ];

  [5, 6, 7, 8, 9, 10].forEach(classNumber => {
    schoolBooks.forEach(([idPrefix, title, subject]) => add({
      id: `${idPrefix}-${classNumber}`,
      title,
      class: cls(classNumber),
      subject,
      category: "school",
      medium: "English"
    }));
  });

  /* =====================================================
     HONEST SUCCESS SERIES — SCHOOL EXAM/GUIDE RANGE
  ===================================================== */
  const hssBase = [
    ["combined", "Combined", "Combined", "English"],
    ["english", "English", "English I Language", "English"],
    ["kannada", "Kannada", "Kannada I Language", "Kannada"],
    ["hindi", "Hindi", "Hindi III Language", "English"],
    ["mathematics", "Mathematics", "Mathematics", "English"]
  ];

  function addHss(classNumber, idSuffix, titleSuffix, subject, medium, displaySubject) {
    add({
      id: `hs-${classNumber}-${idSuffix}`,
      title: `Honest Success Series – ${titleSuffix}`,
      series: "Honest Success Series",
      family: "Honest Success Series",
      class: cls(classNumber),
      subject,
      ...(displaySubject ? { displaySubject } : {}),
      category: "exam",
      medium
    });
  }

  hssBase.forEach(x => addHss(8, ...x));
  addHss(8, "science", "Science", "Science", "English");
  addHss(8, "social-science", "Social Science", "Social Science", "English");

  hssBase.forEach(x => addHss(9, ...x));
  addHss(9, "vignana", "Vignana", "Science", "Kannada", "Vignana");
  addHss(9, "samaja", "Samaja", "Social Science", "Kannada", "Samaja");

  hssBase.forEach(x => addHss(10, ...x));
  addHss(10, "science", "Science", "Science", "English");
  addHss(10, "social-science", "Social Science", "Social Science", "English");
  addHss(10, "vignana", "Vignana", "Science", "Kannada", "Vignana");
  addHss(10, "samaja-vignana", "Samaja", "Social Science", "Kannada", "Samaja");

  /* =====================================================
     EARLY LEARNING
     Legacy blank level mappings previously behaved as available across
     Nursery/LKG/UKG. That behaviour is preserved explicitly using class arrays.
  ===================================================== */
  const earlyBooks = [
    ["el-abc-book", "Little Master's ABC Book", "English", "Reader"],
    ["el-my-book-alphabet", "My Book of Alphabet", "English", "Reader"],
    ["el-my-book-words", "My Book of Words", "English", "Reader"],
    ["el-capital-letter-writing", "Capital Letter Writing", "English", "Writing"],
    ["el-small-letter-writing", "Small Letter Writing", "English", "Writing"],
    ["el-english-capital-activity", "English Capital Activity", "English", "Activity"],
    ["el-numbers-0-9", "Numbers 0–9", "Mathematics", "Numbers"],
    ["el-counting-1-20", "Counting Numbers 1 to 20", "Mathematics", "Numbers"],
    ["el-play-learn-1-20", "Play & Learn Numbers 1 to 20", "Mathematics", "Writing"],
    ["el-numbers-activities-0-50", "Numbers with Activities 0 to 50", "Mathematics", "Activity"],
    ["el-akshara-parichaya", "Akshara Parichaya", "Kannada", "Reader"],
    ["el-kannada-varnamale", "Kannada Varnamale", "Kannada", "Reader"],
    ["el-siri-kannada-varnamale", "Siri Kannada Varnamale", "Kannada", "Reader"],
    ["el-kannada-akshara-baravanige", "Kannada Akshara Baravanige", "Kannada", "Writing"],
    ["el-kannada-aksharamale-activity", "Kannada Aksharamale Activity Book", "Kannada", "Activity"],
    ["el-akshar-jyothi", "Akshar Jyothi", "Hindi", "Reader"],
    ["el-shabdh-jyothi", "Shabdh Jyothi", "Hindi", "Reader"],
    ["el-akshar-gnan", "Akshar Gnan", "Hindi", "Reader"],
    ["el-swar-gnan", "Swar Gnan", "Hindi", "Reader"],
    ["el-hindi-bharhakadi", "Hindi Bharhakadi", "Hindi", "Activity"],
    ["el-art-craft-a", "Art & Craft – A", "Creative Learning", "Art & Craft"],
    ["el-rhymes-a", "My Book of Rhymes – A", "Creative Learning", "Rhymes"],
    ["el-first-patterns", "My First Book of Patterns", "Creative Learning", "Patterns"]
  ];

  earlyBooks.forEach(([id, title, subject, type]) => add({
    id,
    title,
    class: earlyAll,
    subject,
    type,
    category: "early-learning"
  }));

  [
    ["el-draw-colour-a", "My Book of Draw & Colour – A", "Nursery"],
    ["el-draw-colour-b", "My Book of Draw & Colour – B", "LKG"],
    ["el-draw-colour-c", "My Book of Draw & Colour – C", "UKG"]
  ].forEach(([id, title, className]) => add({
    id,
    title,
    series: "Little Master's",
    class: [className],
    subject: "Creative Learning",
    type: "Drawing & Colouring",
    category: "early-learning"
  }));

  /* =====================================================
     EXAM PREPARATION — CLASS 8
  ===================================================== */
  [
    ["lba-8-combined", "LBA – Combined", "LBA"],
    ["ia-8-combined", "Internal Assessment – Combined", "Internal Assessment"],
    ["workbook-8-combined", "Workbook – Combined", "Workbooks"]
  ].forEach(([id, title, series]) => add({
    id,
    title,
    series,
    family: series,
    class: cls(8),
    subject: "Combined",
    category: "exam",
    medium: "English"
  }));

  /* =====================================================
     EXAM PREPARATION — CLASSES 9–10
     Current known guide media are English/Kannada only.
  ===================================================== */
  const examSubjects = [
    ["english", "English", "English I Language", "English"],
    ["kannada", "Kannada", "Kannada I Language", "Kannada"],
    ["hindi", "Hindi", "Hindi III Language", "English"],
    ["mathematics", "Mathematics", "Mathematics", "English"],
    ["science", "Science", "Science", "English"],
    ["social-science", "Social Science", "Social Science", "English"]
  ];

  const examFamilies = [
    ["lba", "LBA", "LBA"],
    ["ia", "Internal Assessment", "Internal Assessment"],
    ["workbook", "Workbook", "Workbooks"]
  ];

  [9, 10].forEach(classNumber => {
    examSubjects.forEach(([subjectId, titleSubject, subject, medium]) => {
      examFamilies.forEach(([idPrefix, titlePrefix, series]) => add({
        id: `${idPrefix}-${classNumber}-${subjectId}`,
        title: `${titlePrefix} – ${titleSubject}`,
        series,
        family: series,
        class: cls(classNumber),
        subject,
        category: "exam",
        medium
      }));
    });
  });

  global.CAMBRIDGE_CATALOGUE = records;

  /* Active catalogue accessor used by older pages. */
  global.catalogue = function catalogue() {
    return Array.isArray(global.CAMBRIDGE_CATALOGUE)
      ? global.CAMBRIDGE_CATALOGUE.filter(book => book && typeof book === "object" && book.active !== false)
      : [];
  };

  /* Optional developer-only validator: add ?validate=1 to a catalogue URL. */
  if (typeof document !== "undefined") {
    try {
      const params = new URLSearchParams(global.location.search);
      if (params.get("validate") === "1") {
        const script = document.createElement("script");
        const currentScript = document.currentScript;
        script.src = currentScript && currentScript.src
          ? new URL("catalogue-validator.js", currentScript.src).href
          : "js/catalogue-validator.js";
        script.async = true;
        script.dataset.cambridgeCatalogueValidator = "true";
        script.onerror = () => console.warn("Cambridge Catalogue: optional validator could not be loaded.");
        document.head.appendChild(script);
      }
    } catch (error) {
      console.warn("Cambridge Catalogue: optional validation could not start.", error);
    }
  }
})(window);
