# CPC Digital Catalogue — Project State

Last updated: 2026-09-20 16:20 IST (UTC+05:30)

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

The recent UI consistency pass has been live-verified by the user. UI is intentionally deprioritized now except for blocking bugs.

## Existing Supabase state

Supabase project: **CPC Digital Catalogue** (`ysaxagxortpxyifyaydx`).

Existing request add-on tables remain:

- `requests`
- `request_items`
- `request_kit_components`
- `product_mappings`

RLS is enabled. The request system remains secondary and should stay stable during catalogue migration.

## Publication Master V1 — FROZEN FOR PILOT

Canonical fields:

- Catalogue Section
- Series
- Book Title
- Class/Stage
- Subject
- Medium
- Language Position
- Book Type
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

Key rules: Category excluded; Book Type controlled; Medium optional and never inferred from subject; Class/Stage array-based; empty class array means intentionally unrestricted; UUID is publication identity; SKU optional; Tally/ERP mapping remains private; no catalogue-wide Language field or edition hierarchy in V1.

## Supabase catalogue pilot — DATABASE + PILOT DATA READY

Migration `20260920103408_create_catalogue_publication_master_v1` created:

- `public.publications`
- `public.publication_assets`
- catalogue constraints and indexes
- automatic `updated_at` trigger
- RLS on both tables
- public SELECT policies restricted to Active publications / active assets belonging to Active publications
- browser INSERT/UPDATE/DELETE privileges revoked

The approved Excel pilot was imported after validation.

Current pilot counts:

- 33 Active publications total
- 9 Early Learning
- 22 School Learning
- 2 College and University
- 0 Competitive Exams in this pilot batch
- 6 deliberately class-unrestricted records represented by an empty `class_stage` array

Hidden Excel Category was not imported. Blank Status defaulted to Active. No full catalogue migration has occurred.

## Supabase frontend pilot adapter — CREATED, NOT LIVE

`js/catalogue-supabase-adapter.js` now provides an opt-in adapter that:

- reads Active rows from `publications`
- reads active `publication_assets`
- converts canonical Supabase rows into the existing `CAMBRIDGE_CATALOGUE` frontend shape
- preserves UUID as both `id` and `productId`
- maps `class_stage` to the existing `class` array
- maps canonical Book Type to legacy `type` where required
- derives the legacy category only as a compatibility bridge (`early-learning`, `school`, `exam`, `college-university`, `competitive-exams`)
- maps primary cover assets when available
- exposes `compareWithStatic()` for pilot comparison
- does **not** automatically overwrite `window.CAMBRIDGE_CATALOGUE`

Important: the adapter intentionally requires the public Supabase anon key to be supplied by the caller. No secret/service-role credential is committed. Before browser pilot activation, use the project's public anon/publishable credential only.

## Current static catalogue state

`js/catalogue-data.js` remains the live catalogue source. It still contains legacy placeholder/static records and some now-obsolete assumptions (for example textbook medium defaults). Do not clean those up as part of the pilot unless required for a specific compatibility test; Supabase Publication Master V1 is the intended future source of truth.

## Immediate next step

**Wire a safe, explicit pilot/test page or opt-in mode to `catalogue-supabase-adapter.js`, provide the public anon/publishable key through browser configuration, and compare representative journeys without switching the production catalogue source.**

Test at minimum:

1. Early Learning class-specific publication
2. Early Learning class-unrestricted publication
3. School textbook
4. School guide
5. Combined guide
6. LBA / Question Bank
7. Kannada-medium normalized subject case
8. College / 2nd PUC publication
9. Browse/search result rendering
10. Book details and selection/request identity compatibility

Only after those pass should the live pages be migrated incrementally.

## Migration rules

- Keep `catalogue-data.js` live during the pilot.
- Do not migrate all covers to Supabase Storage at the same time.
- Do not redesign the working request workflow during the catalogue pilot.
- Do not expose `product_mappings` or Tally/ERP fields to the browser.
- Do not invent missing publication values.
- Do not add lookup tables/fields merely because they might be useful someday.
- Do not commit Supabase service-role credentials.

## Development definition of done

For meaningful changes:

**Inspect current Git → read relevant docs → implement smallest coherent change → test affected flows → verify → update docs → commit.**

Do not claim a feature is complete solely because code was written.
