# CPC Digital Catalogue — Project State

Last updated: 2026-09-20 22:40 IST (UTC+05:30)

This is the primary recovery document for the project. Read this file before substantial development work, then inspect the current Git implementation before making changes.

## Product goal

Build a premium, accurate, easy-to-use **CPC Digital Catalogue** that helps customers discover, browse, search and understand Cambridge Publishing Company publications.

**The catalogue is the primary product.** Selection, custom kits and Submit Request are secondary convenience features. This is not an e-commerce/order-management system, and request workflow must not drive the catalogue architecture.

Primary journey:

`Discover/Browse/Search → Section → Class/Stage → Publications → Book Details`

Optional continuation:

`Select publications → Review Selection → Submit Request`

## Current customer journey

Implemented and working: homepage, Early Learning, School Learning, school book lists, College and University shell, Competitive Exams shell, shared Browse/Search, Book Details, Kit Builder, My Selection, request details/review/submission and Supabase-backed request success.

The customer request journey is already implemented; do not rebuild it as the next architecture task. College and University and Competitive Exams currently have navigation/browser shells but still require the full verified publication data before those catalogue sections can be considered complete.

The Supabase pilot Browse → Book Details → Selection flow has been live-verified by the user. Catalogue data is cached in-session to reduce repeated page-load latency. UI refinements are intentionally deprioritized except for blocking usability issues.

## Existing Supabase state

Supabase project: **CPC Digital Catalogue** (`ysaxagxortpxyifyaydx`).

Request add-on tables: `requests`, `request_items`, `request_kit_components`, `product_mappings`. RLS is enabled. The request system remains secondary and should stay stable during catalogue migration.

## Publication Master V1 — CURRENT WORKING SPECIFICATION

Current master columns are:

- Catalogue Section
- Series
- Book Title
- Class/Stage
- Subject
- Medium
- Book Type
- Description
- SKU ID
- MRP
- ISBN
- Author
- Co Author
- Pages
- Length (cm)
- Breadth (cm)
- Thickness (cm)
- Weight (kg)
- Status

`Category` and `Language Position` have been removed from the working Publication Master and are not part of V1. SKU ID is deliberately unresolved/parked until CPC finalizes its identifier convention.

Current rules:

- Catalogue Section is required and controlled: `Early Learning`, `School Learning`, `College and University`, `Competitive Exams`.
- Series is optional and only for genuine CPC product families. Generic names such as Workbook, Q-Bank and Internal Assessment are not Series.
- Book Title is required and stores the complete customer-facing title.
- Class/Stage is optional and array-based. Approved current values are Nursery, LKG, UKG, 1–10, 1st PUC and 2nd PUC. Empty means intentionally not class-specific. Multiple specific stages are represented in Excel using ` | ` and normalized to an array on import.
- Subject is optional, controlled-but-extensible. Current approved values: English, Kannada, Hindi, Mathematics, Science, Social Science, Environmental Studies, Grammar, Economics. Multi-subject/combined publications may leave Subject blank.
- Medium is optional; current values are English and Kannada. Never infer Medium from Subject/content language.
- Book Type is required and controlled-but-extensible. Current V1 values: Textbook, Guide, Combined Guide, Question Bank, Workbook, Activity Book, Writing Book, Drawing Book, Reader, Semester Book, Assessment Book, Rhymes Book, Map Book.
- Description is optional customer-facing text.
- ISBN canonical operational/storage format is ISBN-13 digits only, with no spaces or hyphens. Display formatting may be added separately. Import validation should verify the ISBN-13 check digit.
- MRP and physical fields are numeric; Author/Co Author are optional text; Pages is an optional positive integer.
- Status is required and controlled: Active, Upcoming, Inactive, Discontinued. Customer-facing wording for Upcoming may be `Coming Soon`.
- Category remains excluded. No catalogue-wide Language Position field is used in V1.

The controlled-value lists are V1 approved values based on the current sample, not permanent closed taxonomies. When the complete CPC master reveals a legitimate new Book Type, Subject, Series or other value, review and deliberately extend the approved configuration rather than allowing ad-hoc variants.

## Supabase catalogue pilot — DATABASE + PILOT DATA READY

Migration `20260920103408_create_catalogue_publication_master_v1` created `public.publications` and `public.publication_assets`, constraints/indexes, automatic `updated_at`, RLS and read-only public catalogue policies.

Approved pilot data: 33 Active publications total; 9 Early Learning; 22 School Learning; 2 College and University; 0 Competitive Exams; 6 deliberately class-unrestricted records represented by an empty `class_stage` array. This is pilot data, not the final production master. No full catalogue migration has occurred.

The Supabase schema still contains some pilot-era fields/constraints such as Language Position/status assumptions. Do not treat every existing database constraint as the final master specification; align schema during the production migration phase after the complete master is reviewed.

## Canonical publication identity / operational mapping bridge — PILOT IMPLEMENTATION

Migration `link_product_mappings_to_publications_v1` adds nullable `product_mappings.publication_id uuid` with a foreign key to `publications.id`.

Current direction:

- Database UUID remains the internal publication identity for the current implementation.
- SKU convention is parked and must not be invented merely to proceed.
- Existing legacy `product_mappings.product_id text` remains temporarily because the request workflow expects text product IDs.
- Do not expose product mappings, Tally item names, Tally stock IDs or ERP IDs to public catalogue clients.

The current 33 pilot publications may be backed up and replaced with a clean full-master import once the complete Publication Master is ready. If publications are recreated, asset mappings tied to old UUIDs must also be recreated/remapped.

## Supabase frontend pilot adapter — WORKING

`js/catalogue-supabase-adapter.js` reads Active publications/assets and converts them into the existing frontend contract. `catalogue-bootstrap.js` supports opt-in Supabase loading and session caching. Browse and Book Details preserve the Supabase source and originating browse context.

Publication `description` is now mapped from Supabase and Book Details displays an About this book section when a description exists.

The public publishable Supabase key is used in browser configuration; service-role/secret credentials must never be committed.

## Current static catalogue state

`js/catalogue-data.js` remains available during the pilot and still contains legacy placeholder/static records and some obsolete assumptions. Supabase Publication Master is the intended future source of truth.

## Publication asset/storage pilot — COMPLETE

Actual publication images live in the public **`publication-assets` Supabase Storage** bucket. `publication_assets` stores the canonical publication relationship, asset type, storage path, public URL, ordering and active/primary state; the Publication Master Excel must not grow cover-image columns merely for website rendering.

Supported catalogue asset sequence is:

`Front Cover → Back Cover → Sample Page 1 → Sample Page 2 → ...`

The first deliberately small pilot imported and verified exactly four PNG assets:

- `10th LBA Science` (`22a9f39f-fd15-43dd-af31-caf2190ae48f`): primary `cover` and `back_cover`
- `My Book of Draw & Colour - 3` (`0a334b1e-3eb6-49eb-8a7a-747794df871b`): primary `cover` and `back_cover`

Both portrait and landscape publication assets now render without cropping in Browse and Book Details. Book Details renders the front/back gallery in order. Sample-page architecture is supported for future live data.

`scripts/upload-publication-assets.mjs` is the admin-only importer. It accepts UTF-8 JSON manifests with or without a BOM, requires `SUPABASE_SERVICE_ROLE_KEY` from the local environment, and must never receive a service-role key through a repository file.

## Data preparation / migration direction

CPC team is preparing the complete Publication Master and publication images using the agreed data-entry and image-preparation rules.

Planned production migration flow:

`Complete Excel master → validate/review → approve controlled-value additions → backup pilot → reset/replace pilot publication data → import clean full master → import/remap publication assets → verify catalogue sections/search/details/selection`

A Publication Master validator is planned but intentionally not the immediate blocker while the complete master is being prepared. It should be configuration-driven so approved controlled values can evolve after reviewing the full catalogue.

## Immediate next step

Do not rebuild the already-complete request/customer journey. Continue catalogue completion around real publication data:

1. Keep gathering the complete Publication Master and image set.
2. Review College and University and Competitive Exams against the full real data rather than inventing taxonomy from the pilot.
3. Keep universal Browse/Search architecture stable and verify it against broader data as it becomes available.
4. Build the master validator/import tooling when useful for the incoming full dataset.
5. After the full master is validated, replace the pilot publication dataset in a controlled migration and then bulk-import/remap assets.

## Migration rules

- Keep `catalogue-data.js` available during the pilot.
- Do not bulk-migrate production covers before the full master is approved.
- Do not redesign the working request workflow during catalogue migration.
- Do not expose `product_mappings` or Tally/ERP fields to the browser.
- Do not invent missing publication values.
- Do not add lookup tables/fields merely because they might be useful someday.
- Do not commit Supabase service-role credentials.
- Treat current pilot UUID/asset relationships as disposable pilot data if the approved full-master migration intentionally resets the publication dataset.

## Development definition of done

For meaningful changes: **Inspect current Git → read relevant docs → implement smallest coherent change → test affected flows → verify → update docs → commit.**

Do not claim a feature is complete solely because code was written.
