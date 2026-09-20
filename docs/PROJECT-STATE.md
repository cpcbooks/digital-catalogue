# CPC Digital Catalogue — Project State

Last updated: 2026-09-20 16:07 IST (UTC+05:30)

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

## Supabase catalogue pilot — DATABASE FOUNDATION CREATED

Migration `20260920103408_create_catalogue_publication_master_v1` was applied successfully on 2026-09-20.

Created:

- `public.publications`
- `public.publication_assets`
- catalogue constraints and indexes
- automatic `updated_at` trigger
- RLS on both tables
- public SELECT policies restricted to Active publications / active assets belonging to Active publications
- browser INSERT/UPDATE/DELETE privileges revoked

Verification after migration:

- both catalogue tables have RLS enabled
- `anon` has SELECT but not INSERT on both tables
- catalogue tables currently contain zero pilot publications; no production/static catalogue data was replaced
- Supabase security advisor reported no new catalogue-table security warning. Its four `RLS enabled, no policy` informational findings are the pre-existing private request/product-mapping tables, intentionally inaccessible directly to browser roles.
- performance advisor reports new indexes as unused, expected while the catalogue tables contain no pilot data and have not served queries yet; do not remove them based on pre-pilot usage statistics.

Authoritative architecture: `docs/SUPABASE-CATALOGUE-ARCHITECTURE.md`.

## Current static catalogue state

`js/catalogue-data.js` remains the live catalogue source during the pilot. Existing frontend contracts and working catalogue/request journeys must remain functional. Do not perform a big-bang replacement.

## Immediate next step

**Import the curated Publication Master pilot dataset into `public.publications`, then validate records before building the frontend Supabase adapter.**

Sequence:

1. prepare deterministic import mapping from the approved Excel columns to `public.publications`
2. import the curated ~30-row pilot only
3. validate counts, null semantics, controlled values, class arrays, medium rules and duplicate risks
4. attach/reuse existing cover URLs only where confidently mapped; do not bulk-migrate assets yet
5. build Supabase data adapter mapping canonical records into the existing frontend contract
6. test representative Early Learning / School / PUC / search journeys against pilot data
7. compare with static behaviour
8. only then plan bulk migration and eventual retirement of `catalogue-data.js` as authoritative source

## Migration rules

- Keep `catalogue-data.js` live during the pilot.
- Do not migrate all covers to Supabase Storage at the same time.
- Do not redesign the working request workflow during the catalogue pilot.
- Do not expose `product_mappings` or Tally/ERP fields to the browser.
- Do not invent missing publication values.
- Do not add lookup tables/fields merely because they might be useful someday.

## Development definition of done

For meaningful changes:

**Inspect current Git → read relevant docs → implement smallest coherent change → test affected flows → verify → update docs → commit.**

Do not claim a feature is complete solely because code was written.
