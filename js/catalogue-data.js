/*
=========================================================
CAMBRIDGE DIGITAL CATALOGUE
CENTRAL PRODUCT DATA
=========================================================

This file is the current single source of truth for
catalogue product records.

Important:
- Do not place page layout or UI logic in this file.
- Empty SKU / ISBN / MRP / cover fields are intentional
  until verified master data is available.
- active:false can later be used to hide discontinued books.
- Early Learning level mappings must only be added when
  confirmed.
=========================================================
*/

window.CAMBRIDGE_CATALOGUE = [

    /* =====================================================
       SCHOOL BOOKS
       CLASS 1
    ===================================================== */

    {
        id:"semester-1-1",
        sku:"",
        isbn:"",
        title:"Semester 1",
        series:"Semester Series",
        class:1,
        subject:"Semester",
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
        title:"Semester 2",
        series:"Semester Series",
        class:1,
        subject:"Semester",
        category:"school",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },


    /* =====================================================
       SCHOOL BOOKS
       CLASS 2
    ===================================================== */

    {
        id:"semester-2-1",
        sku:"",
        isbn:"",
        title:"Semester 1",
        series:"Semester Series",
        class:2,
        subject:"Semester",
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
        title:"Semester 2",
        series:"Semester Series",
        class:2,
        subject:"Semester",
        category:"school",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },


    /* =====================================================
       SCHOOL BOOKS
       CLASS 3
    ===================================================== */

    {
        id:"semester-3-1",
        sku:"",
        isbn:"",
        title:"Semester 1",
        series:"Semester Series",
        class:3,
        subject:"Semester",
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
        title:"Semester 2",
        series:"Semester Series",
        class:3,
        subject:"Semester",
        category:"school",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },


    /* =====================================================
       SCHOOL BOOKS
       CLASS 4
    ===================================================== */

    {
        id:"semester-4-1",
        sku:"",
        isbn:"",
        title:"Semester 1",
        series:"Semester Series",
        class:4,
        subject:"Semester",
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
        title:"Semester 2",
        series:"Semester Series",
        class:4,
        subject:"Semester",
        category:"school",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },


    /* =====================================================
       SCHOOL BOOKS
       CLASSES 5–10
    ===================================================== */

    ...[
        5,
        6,
        7,
        8,
        9,
        10
    ].flatMap(function(classNumber){

        const books = [

            {
                idPrefix:"english-reader",
                title:"English Reader",
                subject:"English",
                medium:"English"
            },

            {
                idPrefix:"english-workbook",
                title:"English Workbook",
                subject:"English",
                medium:"English"
            },

            {
                idPrefix:"kannada-reader",
                title:"Kannada Reader",
                subject:"Kannada",
                medium:"Kannada"
            },

            {
                idPrefix:"kannada-workbook",
                title:"Kannada Workbook",
                subject:"Kannada",
                medium:"Kannada"
            },

            {
                idPrefix:"hindi-reader",
                title:"Hindi Reader",
                subject:"Hindi",
                medium:"Hindi"
            },

            {
                idPrefix:"hindi-workbook",
                title:"Hindi Workbook",
                subject:"Hindi",
                medium:"Hindi"
            },

            {
                idPrefix:"mathematics",
                title:"Mathematics",
                subject:"Mathematics",
                medium:"English"
            },

            {
                idPrefix:"science",
                title:"Science",
                subject:"Science",
                medium:"English"
            },

            {
                idPrefix:"social-science",
                title:"Social Science",
                subject:"Social Science",
                medium:"English"
            }

        ];

        return books.map(function(book){

            return {

                id:
                    book.idPrefix +
                    "-" +
                    classNumber,

                sku:"",

                isbn:"",

                title:
                    book.title,

                series:"",

                class:
                    classNumber,

                subject:
                    book.subject,

                category:
                    "school",

                medium:
                    book.medium,

                mrp:null,

                cover:"",

                active:true

            };

        });

    }),


    /* =====================================================
       HONEST SUCCESS SERIES
       CLASS 8
    ===================================================== */

    {
        id:"hs-8-combined",
        sku:"",
        isbn:"",
        title:"Honest Success Series – Combined",
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
        id:"hs-8-english",
        sku:"",
        isbn:"",
        title:"Honest Success Series – English",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:8,
        subject:"English I Language",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-8-kannada",
        sku:"",
        isbn:"",
        title:"Honest Success Series – Kannada",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:8,
        subject:"Kannada I Language",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-8-hindi",
        sku:"",
        isbn:"",
        title:"Honest Success Series – Hindi",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:8,
        subject:"Hindi III Language",
        category:"exam",
        medium:"Hindi",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-8-mathematics",
        sku:"",
        isbn:"",
        title:"Honest Success Series – Mathematics",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:8,
        subject:"Mathematics",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-8-science",
        sku:"",
        isbn:"",
        title:"Honest Success Series – Science",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:8,
        subject:"Science",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-8-social-science",
        sku:"",
        isbn:"",
        title:"Honest Success Series – Social Science",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:8,
        subject:"Social Science",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },


    /* =====================================================
       HONEST SUCCESS SERIES
       CLASS 9
    ===================================================== */

    {
        id:"hs-9-combined",
        sku:"",
        isbn:"",
        title:"Honest Success Series – Combined",
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
        id:"hs-9-english",
        sku:"",
        isbn:"",
        title:"Honest Success Series – English",
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
        id:"hs-9-kannada",
        sku:"",
        isbn:"",
        title:"Honest Success Series – Kannada",
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
        id:"hs-9-hindi",
        sku:"",
        isbn:"",
        title:"Honest Success Series – Hindi",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:9,
        subject:"Hindi III Language",
        category:"exam",
        medium:"Hindi",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-9-mathematics",
        sku:"",
        isbn:"",
        title:"Honest Success Series – Mathematics",
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
        id:"hs-9-vignana",
        sku:"",
        isbn:"",
        title:"Honest Success Series – Vignana",
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
        id:"hs-9-samaja",
        sku:"",
        isbn:"",
        title:"Honest Success Series – Samaja",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:9,
        subject:"Social Science",
        displaySubject:"Samaja",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },


    /* =====================================================
       HONEST SUCCESS SERIES
       CLASS 10
    ===================================================== */

    {
        id:"hs-10-combined",
        sku:"",
        isbn:"",
        title:"Honest Success Series – Combined",
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
        id:"hs-10-english",
        sku:"",
        isbn:"",
        title:"Honest Success Series – English",
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
        id:"hs-10-kannada",
        sku:"",
        isbn:"",
        title:"Honest Success Series – Kannada",
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
        id:"hs-10-hindi",
        sku:"",
        isbn:"",
        title:"Honest Success Series – Hindi",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:10,
        subject:"Hindi III Language",
        category:"exam",
        medium:"Hindi",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"hs-10-mathematics",
        sku:"",
        isbn:"",
        title:"Honest Success Series – Mathematics",
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
        title:"Honest Success Series – Science",
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
        title:"Honest Success Series – Social Science",
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
        id:"hs-10-vignana",
        sku:"",
        isbn:"",
        title:"Honest Success Series – Vignana",
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
        title:"Honest Success Series – Samaja",
        series:"Honest Success Series",
        family:"Honest Success Series",
        class:10,
        subject:"Social Science",
        displaySubject:"Samaja",
        category:"exam",
        medium:"Kannada",
        mrp:null,
        cover:"",
        active:true
    },


    /* =====================================================
       EARLY LEARNING

       levels:
       - [] means level mapping is still pending.
       - ["nursery"], ["lkg"], ["ukg"] means the mapping
         has been specifically confirmed.
    ===================================================== */

    {
        id:"el-abc-book",
        sku:"",
        isbn:"",
        title:"Little Master's ABC Book",
        series:"",
        class:null,
        levels:[],
        subject:"English",
        type:"Reader",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-my-book-alphabet",
        sku:"",
        isbn:"",
        title:"My Book of Alphabet",
        series:"",
        class:null,
        levels:[],
        subject:"English",
        type:"Reader",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-my-book-words",
        sku:"",
        isbn:"",
        title:"My Book of Words",
        series:"",
        class:null,
        levels:[],
        subject:"English",
        type:"Reader",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-capital-letter-writing",
        sku:"",
        isbn:"",
        title:"Capital Letter Writing",
        series:"",
        class:null,
        levels:[],
        subject:"English",
        type:"Writing",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-small-letter-writing",
        sku:"",
        isbn:"",
        title:"Small Letter Writing",
        series:"",
        class:null,
        levels:[],
        subject:"English",
        type:"Writing",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-english-capital-activity",
        sku:"",
        isbn:"",
        title:"English Capital Activity",
        series:"",
        class:null,
        levels:[],
        subject:"English",
        type:"Activity",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-numbers-0-9",
        sku:"",
        isbn:"",
        title:"Numbers 0–9",
        series:"",
        class:null,
        levels:[],
        subject:"Mathematics",
        type:"Numbers",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-counting-1-20",
        sku:"",
        isbn:"",
        title:"Counting Numbers 1 to 20",
        series:"",
        class:null,
        levels:[],
        subject:"Mathematics",
        type:"Numbers",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-play-learn-1-20",
        sku:"",
        isbn:"",
        title:"Play & Learn Numbers 1 to 20",
        series:"",
        class:null,
        levels:[],
        subject:"Mathematics",
        type:"Writing",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-numbers-activities-0-50",
        sku:"",
        isbn:"",
        title:"Numbers with Activities 0 to 50",
        series:"",
        class:null,
        levels:[],
        subject:"Mathematics",
        type:"Activity",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-akshara-parichaya",
        sku:"",
        isbn:"",
        title:"Akshara Parichaya",
        series:"",
        class:null,
        levels:[],
        subject:"Kannada",
        type:"Reader",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-kannada-varnamale",
        sku:"",
        isbn:"",
        title:"Kannada Varnamale",
        series:"",
        class:null,
        levels:[],
        subject:"Kannada",
        type:"Reader",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-siri-kannada-varnamale",
        sku:"",
        isbn:"",
        title:"Siri Kannada Varnamale",
        series:"",
        class:null,
        levels:[],
        subject:"Kannada",
        type:"Reader",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-kannada-akshara-baravanige",
        sku:"",
        isbn:"",
        title:"Kannada Akshara Baravanige",
        series:"",
        class:null,
        levels:[],
        subject:"Kannada",
        type:"Writing",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-kannada-aksharamale-activity",
        sku:"",
        isbn:"",
        title:"Kannada Aksharamale Activity Book",
        series:"",
        class:null,
        levels:[],
        subject:"Kannada",
        type:"Activity",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-akshar-jyothi",
        sku:"",
        isbn:"",
        title:"Akshar Jyothi",
        series:"",
        class:null,
        levels:[],
        subject:"Hindi",
        type:"Reader",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-shabdh-jyothi",
        sku:"",
        isbn:"",
        title:"Shabdh Jyothi",
        series:"",
        class:null,
        levels:[],
        subject:"Hindi",
        type:"Reader",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-akshar-gnan",
        sku:"",
        isbn:"",
        title:"Akshar Gnan",
        series:"",
        class:null,
        levels:[],
        subject:"Hindi",
        type:"Reader",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-swar-gnan",
        sku:"",
        isbn:"",
        title:"Swar Gnan",
        series:"",
        class:null,
        levels:[],
        subject:"Hindi",
        type:"Reader",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-hindi-bharhakadi",
        sku:"",
        isbn:"",
        title:"Hindi Bharhakadi",
        series:"",
        class:null,
        levels:[],
        subject:"Hindi",
        type:"Activity",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-draw-colour-a",
        sku:"",
        isbn:"",
        title:"My Book of Draw & Colour – A",
        series:"Little Master's",
        class:null,
        levels:["nursery"],
        subject:"Creative Learning",
        type:"Drawing & Colouring",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-draw-colour-b",
        sku:"",
        isbn:"",
        title:"My Book of Draw & Colour – B",
        series:"Little Master's",
        class:null,
        levels:["lkg"],
        subject:"Creative Learning",
        type:"Drawing & Colouring",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-draw-colour-c",
        sku:"",
        isbn:"",
        title:"My Book of Draw & Colour – C",
        series:"Little Master's",
        class:null,
        levels:["ukg"],
        subject:"Creative Learning",
        type:"Drawing & Colouring",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-art-craft-a",
        sku:"",
        isbn:"",
        title:"Art & Craft – A",
        series:"",
        class:null,
        levels:[],
        subject:"Creative Learning",
        type:"Art & Craft",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-rhymes-a",
        sku:"",
        isbn:"",
        title:"My Book of Rhymes – A",
        series:"",
        class:null,
        levels:[],
        subject:"Creative Learning",
        type:"Rhymes",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"el-first-patterns",
        sku:"",
        isbn:"",
        title:"My First Book of Patterns",
        series:"",
        class:null,
        levels:[],
        subject:"Creative Learning",
        type:"Patterns",
        category:"early-learning",
        medium:"",
        mrp:null,
        cover:"",
        active:true
    },

    /* =====================================================
       EXAM PREPARATION
       CLASS 8

       Only verified combined editions are added currently.
    ===================================================== */

    {
        id:"lba-8-combined",
        sku:"",
        isbn:"",
        title:"LBA – Combined",
        series:"LBA",
        family:"LBA",
        class:8,
        subject:"Combined",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"ia-8-combined",
        sku:"",
        isbn:"",
        title:"Internal Assessment – Combined",
        series:"Internal Assessment",
        family:"Internal Assessment",
        class:8,
        subject:"Combined",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },

    {
        id:"workbook-8-combined",
        sku:"",
        isbn:"",
        title:"Workbook – Combined",
        series:"Workbooks",
        family:"Workbooks",
        class:8,
        subject:"Combined",
        category:"exam",
        medium:"English",
        mrp:null,
        cover:"",
        active:true
    },


    /* =====================================================
       EXAM PREPARATION
       CLASS 9
    ===================================================== */

    ...[
        [
            "english",
            "English",
            "English I Language",
            "English"
        ],

        [
            "kannada",
            "Kannada",
            "Kannada I Language",
            "Kannada"
        ],

        [
            "hindi",
            "Hindi",
            "Hindi III Language",
            "Hindi"
        ],

        [
            "mathematics",
            "Mathematics",
            "Mathematics",
            "English"
        ],

        [
            "science",
            "Science",
            "Science",
            "English"
        ],

        [
            "social-science",
            "Social Science",
            "Social Science",
            "English"
        ]

    ].flatMap(function(item){

        return [

            {
                id:
                    "lba-9-" +
                    item[0],

                sku:"",

                isbn:"",

                title:
                    "LBA – " +
                    item[1],

                series:"LBA",

                family:"LBA",

                class:9,

                subject:
                    item[2],

                category:"exam",

                medium:
                    item[3],

                mrp:null,

                cover:"",

                active:true
            },

            {
                id:
                    "ia-9-" +
                    item[0],

                sku:"",

                isbn:"",

                title:
                    "Internal Assessment – " +
                    item[1],

                series:
                    "Internal Assessment",

                family:
                    "Internal Assessment",

                class:9,

                subject:
                    item[2],

                category:"exam",

                medium:
                    item[3],

                mrp:null,

                cover:"",

                active:true
            },

            {
                id:
                    "workbook-9-" +
                    item[0],

                sku:"",

                isbn:"",

                title:
                    "Workbook – " +
                    item[1],

                series:"Workbooks",

                family:"Workbooks",

                class:9,

                subject:
                    item[2],

                category:"exam",

                medium:
                    item[3],

                mrp:null,

                cover:"",

                active:true
            }

        ];

    }),


    /* =====================================================
       EXAM PREPARATION
       CLASS 10
    ===================================================== */

    ...[
        [
            "english",
            "English",
            "English I Language",
            "English"
        ],

        [
            "kannada",
            "Kannada",
            "Kannada I Language",
            "Kannada"
        ],

        [
            "hindi",
            "Hindi",
            "Hindi III Language",
            "Hindi"
        ],

        [
            "mathematics",
            "Mathematics",
            "Mathematics",
            "English"
        ],

        [
            "science",
            "Science",
            "Science",
            "English"
        ],

        [
            "social-science",
            "Social Science",
            "Social Science",
            "English"
        ]

    ].flatMap(function(item){

        return [

            {
                id:
                    "lba-10-" +
                    item[0],

                sku:"",

                isbn:"",

                title:
                    "LBA – " +
                    item[1],

                series:"LBA",

                family:"LBA",

                class:10,

                subject:
                    item[2],

                category:"exam",

                medium:
                    item[3],

                mrp:null,

                cover:"",

                active:true
            },

            {
                id:
                    "ia-10-" +
                    item[0],

                sku:"",

                isbn:"",

                title:
                    "Internal Assessment – " +
                    item[1],

                series:
                    "Internal Assessment",

                family:
                    "Internal Assessment",

                class:10,

                subject:
                    item[2],

                category:"exam",

                medium:
                    item[3],

                mrp:null,

                cover:"",

                active:true
            },

            {
                id:
                    "workbook-10-" +
                    item[0],

                sku:"",

                isbn:"",

                title:
                    "Workbook – " +
                    item[1],

                series:"Workbooks",

                family:"Workbooks",

                class:10,

                subject:
                    item[2],

                category:"exam",

                medium:
                    item[3],

                mrp:null,

                cover:"",

                active:true
            }

        ];

    })

];
