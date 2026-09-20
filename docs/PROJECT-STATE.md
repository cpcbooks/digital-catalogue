# CPC Digital Catalogue — Project State

Last updated: 2026-09-20 IST (UTC+05:30)

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

The Supabase pilot Browse → Book Details → Selection flow has been live-verified by the user. Catalogue data is cached in-session to reduce repeated page-load latency. UI refinements are intentionally deprioritized except for blocking usability issues.

## Existing Supabase state

Supabase project: **CPC Digital Catalogue** (`ysaxagxortpxyifyaydx`).

Request add-on tables:

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

Migration `20260920103408_create_catalogue_publication_master_v1` created `public.publications` and `public.publication_assets`, constraints/indexes, automatic `updated_at`, RLS and read-only public catalogue policies.

Approved pilot data:

- 33 Active publications total
- 9 Early Learning
- 22 School Learning
- 2 College and University
- 0 Competitive Exams in this pilot batch
- 6 deliberately class-unrestricted records represented by an empty `class_stage` array

Hidden Excel Category was not imported. Blank Status defaulted to Active. No full catalogue migration has occurred.

## Canonical publication identity / operational mapping bridge — IMPLEMENTED

Migration `link_product_mappings_to_publications_v1` adds nullable `product_mappings.publication_id uuid` with a foreign key to `publications.id`.

Rules:

- `publications.id` is the permanent canonical publication identity.
- New operational mappings should reference `product_mappings.publication_id`.
- One active mapping row per canonical publication is the V1 assumption; a unique partial index prevents duplicate non-null publication mappings.
- Existing legacy `product_mappings.product_id text` remains temporarily as the table primary key because the current request workflow expects text product IDs.
- The bridge is additive and does not rewrite historical request snapshots.
- `product_mappings` currently contains zero rows, so no legacy mapping data required backfill at migration time.
- Do not expose `product_mappings`, Tally item names, Tally stock IDs or ERP IDs to public catalogue clients.

Target direction:

`publications.id (UUID) → product_mappings.publication_id → SKU / Tally / ERP identifiers`

When request submission is migrated, resolve new UUID-based catalogue selections through `publication_id`; retain legacy `product_id` compatibility only as long as needed for old/static catalogue requests.

## Supabase frontend pilot adapter — WORKING

`js/catalogue-supabase-adapter.js` reads Active publications/assets and converts them into the existing frontend contract. `catalogue-bootstrap.js` supports opt-in Supabase loading and session caching. Browse and Book Details preserve the Supabase source and originating browse context.

The public publishable Supabase key is used in browser configuration; service-role/secret credentials must never be committed.

## Current static catalogue state

`js/catalogue-data.js` remains the normal/default catalogue source. It still contains legacy placeholder/static records and some obsolete assumptions. Supabase Publication Master V1 is the intended future source of truth.

## Asset direction

Actual publication images should ultimately live in **Supabase Storage**. `publication_assets` stores the publication relationship and public asset metadata/path; the Publication Master Excel should not grow cover-image columns merely for website rendering.

Asset migration remains a separate phase. Start with a small representative set of real covers before bulk migration.

## Immediate next step

**Build the asset/storage pilot next:** create the publication asset bucket/policy architecture, connect a few representative real cover images to canonical publication UUIDs, and verify Browse + Book Details rendering. Do not bulk-migrate all covers yet.

After the asset pilot, continue with universal Search/Browse architecture and full Publication Master migration planning.

## Migration rules

- Keep `catalogue-data.js` available during the pilot.
- Do not migrate all covers at once.
- Do not redesign the working request workflow during catalogue migration.
- Do not expose `product_mappings` or Tally/ERP fields to the browser.
- Do not invent missing publication values.
- Do not add lookup tables/fields merely because they might be useful someday.
- Do not commit Supabase service-role credentials.
- Preserve publication UUIDs when correcting publication metadata.

## Development definition of done

For meaningful changes:

**Inspect current Git → read relevant docs → implement smallest coherent change → test affected flows → verify → update docs → commit.**

Do not claim a feature is complete solely because code was written.
