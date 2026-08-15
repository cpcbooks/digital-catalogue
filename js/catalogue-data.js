/* =========================================================
   CAMBRIDGE DIGITAL CATALOGUE
   CENTRAL PRODUCT DATA

   IMPORTANT:
   - Keep catalogue data here.
   - Do not duplicate book records across HTML pages.
   - Empty SKU / ISBN / MRP / cover values can be populated later.
   - active:false can be used later to hide discontinued editions.
========================================================= */

window.CAMBRIDGE_CATALOGUE = [

    /* =====================================================
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
       ENGLISH READER
    ===================================================== */

    ...makeNumberedSeries({
        idPrefix:"english-reader",
        titlePrefix:"Inspiring English Reader ",
        series:"Inspiring English Reader",
        subject:"English",
        classes:[1,2,3,4,5,6,7]
    }),


    /* =====================================================
       ENGLISH WRITING
    ===================================================== */

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
       ENGLISH GRAMMAR
    ===================================================== */

    ...makeNumberedSeries({
        idPrefix:"grammar-today",
        titlePrefix:"The Grammar Today ",
        series:"The Grammar Today",
        subject:"English Grammar",
        classes:[1,2,3,4,5,6,7,8]
    }),


    /* =====================================================
       KANNADA READER
    ===================================================== */

    ...makeNumberedSeries({
        idPrefix:"kannada-bhasharathna",
        titlePrefix:"Kannada Bhasharathna - ",
        series:"Kannada Bhasharathna",
        subject:"Kannada",
        classes:[1,2,3,4,5,6,7]
    }),


    /* =====================================================
       KANNADA WRITING
    ===================================================== */

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
       HINDI READER
    ===================================================== */

    ...makeNumberedSeries({
        idPrefix:"hindi-bhasharathna",
        titlePrefix:"Little Master's Hindi Bhasharathna - ",
        series:"Little Master's Hindi Bhasharathna",
        subject:"Hindi",
        classes:[1,2,3,4,5,6,7]
    }),


    /* =====================================================
       HINDI WRITING
    ===================================================== */

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
       ENVIRONMENTAL STUDIES
    ===================================================== */

    ...makeNumberedSeries({
        idPrefix:"environmental-studies",
        titlePrefix:"Inspiring Environmental Studies - ",
        series:"Inspiring Environmental Studies",
        subject:"Environmental Studies",
        classes:[1,2,3,4,5]
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
    })

];


/* =========================================================
   DATA HELPER

   This generates repetitive numbered series records while
   still leaving every final catalogue item as an independent
   object in CAMBRIDGE_CATALOGUE.
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
