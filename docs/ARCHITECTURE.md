# CPC Digital Catalogue — Architecture

## Architectural principle

Prefer one shared catalogue architecture over page-specific implementations. Pages may present different journeys, but publication identity, discovery, book details, selection and request submission should reuse shared contracts.

**The Digital Catalogue is the primary product.** Selection/Submit Request is a secondary convenience feature and must not drive catalogue architecture.

## Catalogue data ownership direction

Current verified production catalogue has **427 Supabase publication records**. The Supabase catalogue adapter is in use for verified live catalogue browsing; `js/catalogue-data.js` remains a legacy/static compatibility path, not the approved business master. Inspect the actual deployed source selector before changing routing or retiring compatibility code.

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

- Approved **Catalogue Category** (Publication Master V1.1)
- Series
- Class/Stage
- Subject
- Medium
- Book Type

The approved 427-publication V1.1 master includes Catalogue Category and permanent CPC SKUs. Historical Catalogue Section/navigation labels and database fields may differ from business master labels. `Language Position` is not an approved standalone V1.1 master field; preserve language detail in official titles where applicable.

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

Supabase Storage bucket `publication-assets` and the `publication_assets` relation are the supported asset path. Actual covers and sample assets are still being prepared for launch. Preserve exact original cover art and aspect ratio.

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
- approved catalogue category (through existing adapter/mapping)
- book type
- title/search text

Do not build separate product taxonomies for different pages.

## Curated discovery modes

New Arrivals is a route mode of the shared Browse page: `browse.html?view=new-arrivals`. `js/catalogue-new-arrivals.js` contains an ordered allow-list of verified permanent CPC SKUs, and `js/catalogue-browse.js` resolves that list against the active catalogue source before passing the resulting records to the existing card renderer and selection actions.

The initial list is Wondera Computational Thinking & AI Classes 1–8 (`CPC00252`–`CPC00259`). It creates no publication records, tables, schema fields or independent page layout. Browse discovery controls are suppressed only in this route mode; normal Browse remains the shared search/filter experience. Curated mode is catalogue browsing, not ordering or checkout.

## Selection architecture

Selections remain shared across catalogue sections through the existing `cambridgeOrder` contract.

Individual books, Standard Kits and Custom Kits are valid top-level selections. Kits contain component snapshots, including normalized `request_kit_components` in submitted requests.

During backend migration, adapt canonical Supabase publication records into the existing frontend contract rather than rewriting selection UI at the same time.

## Request architecture

A customer submission is a request, not a confirmed sales order.

Supabase stores immutable request snapshots. Internal fulfilment mapping is separate from customer-facing catalogue terminology.

The production request system is accepted and should remain stable during launch-content work. PR #34 added network recovery and `Retry-After` UX. Actual production HTTP 429 was deliberately not exercised.

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

**Historical migration complete for current public scope.** Do not re-run pilot replacement or recreate publication UUIDs. Future data updates must preserve permanent CPC SKUs and UUIDs, validate against approved V1.1, check kit/asset dependencies and receive CPC approval. Admin Portal V1 remains a separate future implementation.

## Navigation principle

Use browser-native history/scroll restoration for ordinary catalogue → Book Details → Back navigation where possible.

Do not create permanent session scroll-memory that causes old positions to replay on refresh or later visits.
