/* =========================================================
   CAMBRIDGE DIGITAL CATALOGUE
   CENTRAL PRODUCT DATA

   IMPORTANT:
   - Keep catalogue data here.
   - Do not duplicate book records across HTML pages.
   - Empty SKU / ISBN / MRP / cover values can be populated later.
   - active:false can hide discontinued editions.
========================================================= */


/* =========================================================
   HELPER
========================================================= */

function makeNumberedSeries(config){

    return config.classes.map(function(classNumber){

        return {

            id:
                config.idPrefix +
                "-" +
                classNumber,

            sku:"",

            isbn:"",

            title:
                config.titlePrefix +
                classNumber,

            series:
                config.series,

            class:
                classNumber,

            subject:
                config.subject,

            category:"school",

            medium:
                config.medium ||
                "English",

            mrp:null,

            cover:"",

            active:true

        };

    });

}


/* =========================================================
   MAIN CATALOGUE
========================================================= */

window.CAMBRIDGE_CATALOGUE = [

    /* =====================================================
       SCHOOL BOOKS
       SEMESTER BOOKS
    ===================================================== */

    {
        id:"semester-1-1",
        sku:"",
        isbn:"",
        title:"Little Master's Class 1 Semester 1",
        series:"Little Master's Semester Books",
        class:1,
        subject:"Semester Books",
        category:"school",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"semester-1-2",
        sku:"",
        isbn:"",
        title:"Little Master's Class 1 Semester 2",
        series:"Little Master's Semester Books",
        class:1,
        subject:"Semester Books",
        category:"school",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"semester-2-1",
        sku:"",
        isbn:"",
        title:"Little Master's Class 2 Semester 1",
        series:"Little Master's Semester Books",
        class:2,
        subject:"Semester Books",
        category:"school",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"semester-2-2",
        sku:"",
        isbn:"",
        title:"Little Master's Class 2 Semester 2",
        series:"Little Master's Semester Books",
        class:2,
        subject:"Semester Books",
        category:"school",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"semester-3-1",
        sku:"",
        isbn:"",
        title:"Little Master's Class 3 Semester 1",
        series:"Little Master's Semester Books",
        class:3,
        subject:"Semester Books",
        category:"school",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"semester-3-2",
        sku:"",
        isbn:"",
        title:"Little Master's Class 3 Semester 2",
        series:"Little Master's Semester Books",
        class:3,
        subject:"Semester Books",
        category:"school",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"semester-4-1",
        sku:"",
        isbn:"",
        title:"Little Master's Class 4 Semester 1",
        series:"Little Master's Semester Books",
        class:4,
        subject:"Semester Books",
        category:"school",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"semester-4-2",
        sku:"",
        isbn:"",
        title:"Little Master's Class 4 Semester 2",
        series:"Little Master's Semester Books",
        class:4,
        subject:"Semester Books",
        category:"school",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"semester-5-1",
        sku:"",
        isbn:"",
        title:"Little Master's Class 5 Semester 1",
        series:"Little Master's Semester Books",
        class:5,
        subject:"Semester Books",
        category:"school",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"semester-5-2",
        sku:"",
        isbn:"",
        title:"Little Master's Class 5 Semester 2",
        series:"Little Master's Semester Books",
        class:5,
        subject:"Semester Books",
        category:"school",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },


    /* =====================================================
       ENGLISH
    ===================================================== */

    ...makeNumberedSeries({
        idPrefix:"english-reader",
        titlePrefix:"Inspiring English Reader ",
        series:"Inspiring English Reader",
        subject:"English",
        classes:[1,2,3,4,5,6,7]
    }),

    ...makeNumberedSeries({
        idPrefix:"grammar-today",
        titlePrefix:"The Grammar Today ",
        series:"The Grammar Today",
        subject:"English Grammar",
        classes:[1,2,3,4,5,6,7,8]
    }),

    ...makeNumberedSeries({
        idPrefix:"cursive-big",
        titlePrefix:"Little Master's Cursive Writing (Big) - ",
        series:"Little Master's Cursive Writing (Big)",
        subject:"English Writing",
        classes:[1,2,3,4,5,6,7]
    }),

    ...makeNumberedSeries({
        idPrefix:"cursive-small",
        titlePrefix:"Little Master's Cursive Writing (Small) - ",
        series:"Little Master's Cursive Writing (Small)",
        subject:"English Writing",
        classes:[1,2,3,4,5,6,7,8]
    }),


    /* =====================================================
       KANNADA
    ===================================================== */

    ...makeNumberedSeries({
        idPrefix:"kannada-bhasharathna",
        titlePrefix:"Kannada Bhasharathna - ",
        series:"Kannada Bhasharathna",
        subject:"Kannada",
        classes:[1,2,3,4,5,6,7]
    }),

    ...makeNumberedSeries({
        idPrefix:"kannada-copy-small",
        titlePrefix:"Kannada Copy Pusthaka (Small) - ",
        series:"Kannada Copy Pusthaka (Small)",
        subject:"Kannada Writing",
        classes:[1,2,3,4,5,6,7]
    }),

    ...makeNumberedSeries({
        idPrefix:"kannada-copy-big",
        titlePrefix:"Rama Nama Kannada Copy Pusthaka (Big) - ",
        series:"Rama Nama Kannada Copy Pusthaka (Big)",
        subject:"Kannada Writing",
        classes:[1,2,3,4,5,6,7]
    }),

    ...makeNumberedSeries({
        idPrefix:"kannada-workbook",
        titlePrefix:"Kannada Copy cum Workbook - ",
        series:"Kannada Copy cum Workbook",
        subject:"Kannada Writing",
        classes:[1,2,3,4,5,6,7]
    }),


    /* =====================================================
       HINDI
    ===================================================== */

    ...makeNumberedSeries({
        idPrefix:"hindi-bhasharathna",
        titlePrefix:"Little Master's Hindi Bhasharathna - ",
        series:"Little Master's Hindi Bhasharathna",
        subject:"Hindi",
        classes:[1,2,3,4,5,6,7]
    }),

    ...makeNumberedSeries({
        idPrefix:"hindi-sulekh-small",
        titlePrefix:"Hindi Sulekh Mala (Small) - ",
        series:"Hindi Sulekh Mala (Small)",
        subject:"Hindi Writing",
        classes:[1,2,3,4,5,6,7]
    }),

    ...makeNumberedSeries({
        idPrefix:"hindi-sulekh-big",
        titlePrefix:"Hindi Sulekh Mala (Big) - ",
        series:"Hindi Sulekh Mala (Big)",
        subject:"Hindi Writing",
        classes:[1,2,3,4,5,6,7]
    }),


    /* =====================================================
       MATHEMATICS
    ===================================================== */

    ...makeNumberedSeries({
        idPrefix:"inspiring-mathematics",
        titlePrefix:"Inspiring Mathematics - ",
        series:"Inspiring Mathematics",
        subject:"Mathematics",
        classes:[1,2,3,4,5,6,7,8]
    }),


    /* =====================================================
       EVS
    ===================================================== */

    ...makeNumberedSeries({
        idPrefix:"environmental-studies",
        titlePrefix:"Inspiring Environmental Studies - ",
        series:"Inspiring Environmental Studies",
        subject:"Environmental Studies",
        classes:[1,2,3,4,5]
    }),


    /* =====================================================
       SCIENCE
    ===================================================== */

    ...makeNumberedSeries({
        idPrefix:"inspiring-science",
        titlePrefix:"Inspiring Science - ",
        series:"Inspiring Science",
        subject:"Science",
        classes:[1,2,3,4,5,6,7,8]
    }),


    /* =====================================================
       SOCIAL SCIENCE
    ===================================================== */

    ...makeNumberedSeries({
        idPrefix:"inspiring-social-science",
        titlePrefix:"Inspiring Social Science - ",
        series:"Inspiring Social Science",
        subject:"Social Science",
        classes:[1,2,3,4,5,6,7]
    }),


    /* =====================================================
       COMPUTER SCIENCE
    ===================================================== */

    ...makeNumberedSeries({
        idPrefix:"computer-genius",
        titlePrefix:"Computer for Genius - ",
        series:"Computer for Genius",
        subject:"Computer Science",
        classes:[1,2,3,4,5,6,7,8,9,10]
    }),


    /* =====================================================
       GENERAL KNOWLEDGE
    ===================================================== */

    ...makeNumberedSeries({
        idPrefix:"exploring-facts",
        titlePrefix:"Little Master's Exploring Facts - ",
        series:"Little Master's Exploring Facts",
        subject:"General Knowledge",
        classes:[1,2,3,4,5,6,7,8]
    }),


    /* =====================================================
       MORAL SCIENCE
    ===================================================== */

    ...makeNumberedSeries({
        idPrefix:"moral-values",
        titlePrefix:"Little Master's Moral Values - ",
        series:"Little Master's Moral Values",
        subject:"Moral Science",
        classes:[1,2,3,4,5,6,7,8]
    }),


    /* =====================================================
       DRAW & COLOUR
    ===================================================== */

    ...makeNumberedSeries({
        idPrefix:"draw-colour",
        titlePrefix:"My Book of Draw & Colour - ",
        series:"Little Master's Draw & Colour",
        subject:"Drawing",
        classes:[1,2,3,4,5,6,7]
    }),


    /* =====================================================
       ART & CRAFT
    ===================================================== */

    ...makeNumberedSeries({
        idPrefix:"art-craft",
        titlePrefix:"Art and Craft - ",
        series:"Little Master's Art and Craft",
        subject:"Art & Craft",
        classes:[1,2,3,4,5]
    }),


    /* =====================================================
       EXAM PREPARATION
       CLASS 8
    ===================================================== */

    {
        id:"hs-8-combined-e1",
        sku:"",
        isbn:"",
        title:"Honest Success Series Combined E-1",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:8,
        subject:"Combined",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-8-combined-k1",
        sku:"",
        isbn:"",
        title:"Honest Success Series Combined K-1",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:8,
        subject:"Combined",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-8-combined-km",
        sku:"",
        isbn:"",
        title:"Honest Success Series Combined KM",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:8,
        subject:"Combined",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },


    /* =====================================================
       CLASS 9 — HONEST SUCCESS SERIES
    ===================================================== */

    {
        id:"hs-9-english-1",
        sku:"",
        isbn:"",
        title:"Honest Success Series English I Language",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:9,
        subject:"English I Language",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-9-english-2",
        sku:"",
        isbn:"",
        title:"Honest Success Series English II Language",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:9,
        subject:"English II Language",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-9-kannada-1",
        sku:"",
        isbn:"",
        title:"Honest Success Series Kannada I Language",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:9,
        subject:"Kannada I Language",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-9-kannada-2",
        sku:"",
        isbn:"",
        title:"Honest Success Series Kannada II Language",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:9,
        subject:"Kannada II Language",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-9-hindi-3",
        sku:"",
        isbn:"",
        title:"Honest Success Series Hindi III Language",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:9,
        subject:"Hindi III Language",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-9-mathematics",
        sku:"",
        isbn:"",
        title:"Honest Success Series Mathematics",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:9,
        subject:"Mathematics",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-9-science",
        sku:"",
        isbn:"",
        title:"Honest Success Series Science",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:9,
        subject:"Science",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-9-social-science",
        sku:"",
        isbn:"",
        title:"Honest Success Series Social Science",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:9,
        subject:"Social Science",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-9-vignana",
        sku:"",
        isbn:"",
        title:"Honest Success Series Vignana",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:9,
        subject:"Science",
        displaySubject:"Vignana",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-9-samaja-vignana",
        sku:"",
        isbn:"",
        title:"Honest Success Series Samaja Vignana",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:9,
        subject:"Social Science",
        displaySubject:"Samaja Vignana",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-9-ganitha",
        sku:"",
        isbn:"",
        title:"Honest Success Series Ganitha",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:9,
        subject:"Mathematics",
        displaySubject:"Ganitha",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-9-combined-ki",
        sku:"",
        isbn:"",
        title:"Honest Success Series Combined K-I (EM)",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:9,
        subject:"Combined",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-9-combined-ei",
        sku:"",
        isbn:"",
        title:"Honest Success Series Combined E-I (EM)",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:9,
        subject:"Combined",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-9-combined-km",
        sku:"",
        isbn:"",
        title:"Honest Success Series Combined (KM)",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:9,
        subject:"Combined",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },


    /* =====================================================
       CLASS 9 — LBA
    ===================================================== */

    {
        id:"lba-9-english-1",
        sku:"",
        isbn:"",
        title:"LBA English I Language",
        series:"LBA",
        family:"LBA",
        class:9,
        subject:"English I Language",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"lba-9-english-2",
        sku:"",
        isbn:"",
        title:"LBA English II Language",
        series:"LBA",
        family:"LBA",
        class:9,
        subject:"English II Language",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"lba-9-kannada-1",
        sku:"",
        isbn:"",
        title:"LBA Kannada I Language",
        series:"LBA",
        family:"LBA",
        class:9,
        subject:"Kannada I Language",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"lba-9-kannada-2",
        sku:"",
        isbn:"",
        title:"LBA Kannada II Language",
        series:"LBA",
        family:"LBA",
        class:9,
        subject:"Kannada II Language",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"lba-9-hindi",
        sku:"",
        isbn:"",
        title:"LBA Hindi III Language",
        series:"LBA",
        family:"LBA",
        class:9,
        subject:"Hindi III Language",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"lba-9-mathematics",
        sku:"",
        isbn:"",
        title:"LBA Mathematics",
        series:"LBA",
        family:"LBA",
        class:9,
        subject:"Mathematics",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"lba-9-science",
        sku:"",
        isbn:"",
        title:"LBA Science",
        series:"LBA",
        family:"LBA",
        class:9,
        subject:"Science",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"lba-9-social-science",
        sku:"",
        isbn:"",
        title:"LBA Social Science",
        series:"LBA",
        family:"LBA",
        class:9,
        subject:"Social Science",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"lba-9-ganitha",
        sku:"",
        isbn:"",
        title:"LBA Ganitha",
        series:"LBA",
        family:"LBA",
        class:9,
        subject:"Mathematics",
        displaySubject:"Ganitha",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"lba-9-vignana",
        sku:"",
        isbn:"",
        title:"LBA Vignana",
        series:"LBA",
        family:"LBA",
        class:9,
        subject:"Science",
        displaySubject:"Vignana",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"lba-9-samaja-vignana",
        sku:"",
        isbn:"",
        title:"LBA Samaja Vignana",
        series:"LBA",
        family:"LBA",
        class:9,
        subject:"Social Science",
        displaySubject:"Samaja Vignana",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },


    /* =====================================================
       CLASS 10 — HONEST SUCCESS SERIES
    ===================================================== */

    {
        id:"hs-10-english-1",
        sku:"",
        isbn:"",
        title:"Honest Success Series English I Language",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:10,
        subject:"English I Language",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-10-english-2",
        sku:"",
        isbn:"",
        title:"Honest Success Series English II Language",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:10,
        subject:"English II Language",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-10-english-3",
        sku:"",
        isbn:"",
        title:"Honest Success Series English III Language",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:10,
        subject:"English III Language",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-10-kannada-1",
        sku:"",
        isbn:"",
        title:"Honest Success Series Kannada I Language",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:10,
        subject:"Kannada I Language",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-10-kannada-2",
        sku:"",
        isbn:"",
        title:"Honest Success Series Kannada II Language",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:10,
        subject:"Kannada II Language",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-10-hindi",
        sku:"",
        isbn:"",
        title:"Honest Success Series Hindi III Language",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:10,
        subject:"Hindi III Language",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-10-mathematics",
        sku:"",
        isbn:"",
        title:"Honest Success Series Mathematics",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:10,
        subject:"Mathematics",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-10-science",
        sku:"",
        isbn:"",
        title:"Honest Success Series Science",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:10,
        subject:"Science",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-10-social-science",
        sku:"",
        isbn:"",
        title:"Honest Success Series Social Science",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:10,
        subject:"Social Science",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-10-ganitha",
        sku:"",
        isbn:"",
        title:"Honest Success Series Ganitha",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:10,
        subject:"Mathematics",
        displaySubject:"Ganitha",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-10-vignana",
        sku:"",
        isbn:"",
        title:"Honest Success Series Vignana",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:10,
        subject:"Science",
        displaySubject:"Vignana",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-10-samaja-vignana",
        sku:"",
        isbn:"",
        title:"Honest Success Series Samaja Vignana",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:10,
        subject:"Social Science",
        displaySubject:"Samaja Vignana",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-10-combined-ki",
        sku:"",
        isbn:"",
        title:"Honest Success Series Combined K-I (EM)",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:10,
        subject:"Combined",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-10-combined-ei",
        sku:"",
        isbn:"",
        title:"Honest Success Series Combined E-I (EM)",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:10,
        subject:"Combined",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-10-combined-km",
        sku:"",
        isbn:"",
        title:"Honest Success Series Combined (KM)",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:10,
        subject:"Combined",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },


    /* =====================================================
       CLASS 10 — LBA
    ===================================================== */

    ...[
        ["english-1","LBA English I Language","English I Language","English"],
        ["english-2","LBA English II Language","English II Language","English"],
        ["kannada-1","LBA Kannada I Language","Kannada I Language","Kannada"],
        ["kannada-2","LBA Kannada II Language","Kannada II Language","Kannada"],
        ["hindi","LBA Hindi III Language","Hindi III Language","English"],
        ["mathematics","LBA Mathematics","Mathematics","English"],
        ["science","LBA Science","Science","English"],
        ["social-science","LBA Social Science","Social Science","English"],
        ["ganitha","LBA Ganitha","Ganitha","Kannada"],
        ["vignana","LBA Vignana","Vignana","Kannada"],
        ["samaja-vignana","LBA Samaja Vignana","Samaja Vignana","Kannada"]
    ].map(function(item){

        return {
            id:"lba-10-" + item[0],
            sku:"",
            isbn:"",
            title:item[1],
            series:"LBA",
            family:"LBA",
            class:10,

            subject:
                item[2] === "Ganitha"
                    ? "Mathematics"
                    : item[2] === "Vignana"
                        ? "Science"
                        : item[2] === "Samaja Vignana"
                            ? "Social Science"
                            : item[2],

            displaySubject:
                item[2] === "Ganitha" ||
                item[2] === "Vignana" ||
                item[2] === "Samaja Vignana"
                    ? item[2]
                    : "",

            category:"exam",
            medium:item[3],
            mrp:null,
            cover:"",
            active:true
        };

    }),


    /* =====================================================
       CLASS 10 — INTERNAL ASSESSMENT
    ===================================================== */

    ...[
        ["english-1","Internal Assessment English I Language","English I Language","English"],
        ["english-2","Internal Assessment English II Language","English II Language","English"],
        ["kannada-1","Internal Assessment Kannada I Language","Kannada I Language","Kannada"],
        ["kannada-2","Internal Assessment Kannada II Language","Kannada II Language","Kannada"],
        ["hindi","Internal Assessment Hindi III Language","Hindi III Language","English"],
        ["mathematics","Internal Assessment Mathematics","Mathematics","English"],
        ["science","Internal Assessment Science","Science","English"],
        ["social-science","Internal Assessment Social Science","Social Science","English"],
        ["ganitha","Internal Assessment Ganitha","Ganitha","Kannada"],
        ["vignana","Internal Assessment Vignana","Vignana","Kannada"],
        ["samaja-vignana","Internal Assessment Samaja Vignana","Samaja Vignana","Kannada"]
    ].map(function(item){

        return {
            id:"ia-10-" + item[0],
            sku:"",
            isbn:"",
            title:item[1],
            series:"Internal Assessment",
            family:"Internal Assessment",
            class:10,

            subject:
                item[2] === "Ganitha"
                    ? "Mathematics"
                    : item[2] === "Vignana"
                        ? "Science"
                        : item[2] === "Samaja Vignana"
                            ? "Social Science"
                            : item[2],

            displaySubject:
                item[2] === "Ganitha" ||
                item[2] === "Vignana" ||
                item[2] === "Samaja Vignana"
                    ? item[2]
                    : "",

            category:"exam",
            medium:item[3],
            mrp:null,
            cover:"",
            active:true
        };

    }),


    /* =====================================================
       CLASS 10 — WORKBOOKS
    ===================================================== */

    ...[
        ["english-1-p1","Workbook English I Language (Part-1)","English I Language","English"],
        ["english-1-p2","Workbook English I Language (Part-2)","English I Language","English"],
        ["english-2","Workbook English II Language","English II Language","English"],
        ["kannada-1","Workbook Kannada I Language","Kannada I Language","Kannada"],
        ["kannada-2","Workbook Kannada II Language","Kannada II Language","Kannada"],
        ["hindi","Workbook Hindi III Language","Hindi III Language","English"],
        ["mathematics","Workbook Mathematics","Mathematics","English"],
        ["science","Workbook Science","Science","English"],
        ["social-science","Workbook Social Science","Social Science","English"],
        ["ganitha","Workbook Ganitha","Ganitha","Kannada"],
        ["vignana","Workbook Vignana","Vignana","Kannada"],
        ["samaja-vignana","Workbook Samaja Vignana","Samaja Vignana","Kannada"]
    ].map(function(item){

        return {
            id:"workbook-10-" + item[0],
            sku:"",
            isbn:"",
            title:item[1],
            series:"Workbooks",
            family:"Workbooks",
            class:10,

            subject:
                item[2] === "Ganitha"
                    ? "Mathematics"
                    : item[2] === "Vignana"
                        ? "Science"
                        : item[2] === "Samaja Vignana"
                            ? "Social Science"
                            : item[2],

            displaySubject:
                item[2] === "Ganitha" ||
                item[2] === "Vignana" ||
                item[2] === "Samaja Vignana"
                    ? item[2]
                    : "",

            category:"exam",
            medium:item[3],
            mrp:null,
            cover:"",
            active:true
        };

    })

];
