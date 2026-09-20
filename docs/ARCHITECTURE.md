# CPC Digital Catalogue — Architecture

## Architectural principle

Prefer one shared catalogue architecture over page-specific implementations. Pages may present different journeys, but publication identity, discovery, book details, selection and request submission should reuse shared contracts.

**The Digital Catalogue is the primary product.** Selection/Submit Request is a secondary convenience feature and must not drive catalogue architecture.

## Catalogue data ownership direction

Current production source:

`js/catalogue-data.js → catalogue UI`

Target direction:

`Supabase Publication Master → shared catalogue query/adapter → catalogue UI`

The static source remains production truth until the Supabase pilot is verified. Do not perform a big-bang replacement.

See `DATA-MODEL.md` and `SUPABASE-CATALOGUE-ARCHITECTURE.md`.

## Catalogue publication identity

Every publication receives an immutable database UUID. This is the stable bridge between:

- catalogue data
- selections
- book details
- assets
- submitted request snapshots
- SKU/ISBN/Tally/ERP mapping

Customer-visible labels, ISBN, SKU and internal operational names must not be treated as database identity.

## Publication classification

V1 uses a lean set of independent dimensions validated against real CPC data:

- Catalogue Section
- Series
- Class/Stage
- Subject
- Medium
- Language Position
- Book Type

`Category` is intentionally excluded from canonical V1 because the sample master showed it overlapping inconsistently with Subject and Book Type. Add it later only if a real catalogue-discovery requirement cannot be represented by the existing dimensions.

## Class / stage

Use one array field for applicable class/stage values in the canonical publication record.

Examples:

```text
["LKG"]
["8"]
["2nd PUC"]
["5", "6", "7"]
[]
```

An empty array means intentionally not class/stage restricted within its catalogue section. Do not introduce a parallel `level` field or an artificial `All` value.

The existing frontend `class` contract can be preserved through the data adapter while the backend uses the clearer `class_stage` name.

## Subject vs medium

These fields answer different questions:

- `subject`: normalized academic subject, e.g. `Science`
- `medium`: actual medium-specific edition where CPC distinguishes one, e.g. `English` or `Kannada`

Never infer one from the other.

Important verified CPC rule: ordinary textbooks/readers/workbooks are not automatically assigned English medium. Medium is primarily relevant to guides/question banks and other products that genuinely have medium-specific editions.

## Book type

Book Type is a controlled generic format such as Textbook, Reader, Workbook, Guide, Combined Guide or Question Bank. Do not encode language into Book Type; use Subject for English/Kannada/Hindi distinctions.

## Catalogue content and assets

Publication metadata and publication assets are separate concerns.

`publications` owns canonical product/catalogue data.

`publication_assets` owns covers, back covers, sample PDFs and digital-resource references.

Existing GitHub cover paths may remain during the pilot. Full Supabase Storage migration is intentionally deferred.

## Internal product mapping

Internal operational identifiers remain private and separate from public catalogue data.

Target mapping:

`publication id → SKU → ISBN/reference → Tally Item Name → optional Tally/ERP identifiers`

The existing `product_mappings` table remains the operational bridge during migration. The browser must not receive Tally/ERP fields.

## Universal discovery

Global search and Browse All should share one engine/page rather than duplicate filtering logic.

The Supabase-backed discovery layer should query the same canonical publication dimensions used by section/class browsers:

- section
- class/stage
- series
- subject
- medium
- language position
- book type
- title/search text

Do not build separate product taxonomies for different pages.

## Selection architecture

Selections remain shared across catalogue sections through the existing `cambridgeOrder` contract.

Both normal books and custom kits are valid top-level selections. Custom kits contain component book snapshots.

During backend migration, adapt canonical Supabase publication records into the existing frontend contract rather than rewriting selection UI at the same time.

## Request architecture

A customer submission is a request, not a confirmed sales order.

Supabase stores immutable request snapshots. Internal fulfilment mapping is separate from customer-facing catalogue terminology.

The existing request system is working and should remain largely frozen during the catalogue pilot.

## Security boundary

Public browser:

- can read approved Active catalogue data
- can maintain local selection/request draft
- can call controlled submission endpoint
- cannot write catalogue master data
- cannot directly read/write private request or mapping tables
- never receives service-role credentials

Future staff catalogue management requires authenticated roles/RLS; do not weaken catalogue-table write security for convenience.

## Migration principle

Use a strangler/pilot migration rather than a big-bang rewrite:

1. create canonical Supabase catalogue tables
2. import curated pilot rows
3. keep `catalogue-data.js` live
4. build a shared Supabase-to-current-contract adapter
5. test representative catalogue journeys and search/filtering
6. compare against static behaviour
7. migrate verified master data in batches
8. retire static source only after regression verification

## Navigation principle

Use browser-native history/scroll restoration for ordinary catalogue → Book Details → Back navigation where possible.

Do not create permanent session scroll-memory that causes old positions to replay on refresh or later visits.
