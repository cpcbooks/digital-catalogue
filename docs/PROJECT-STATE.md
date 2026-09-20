# CPC Digital Catalogue — Project State

Last updated: 2026-09-20 19:10 IST (UTC+05:30)

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

Request add-on tables: `requests`, `request_items`, `request_kit_components`, `product_mappings`. RLS is enabled. The request system remains secondary and should stay stable during catalogue migration.

## Publication Master V1 — FROZEN FOR PILOT

Canonical fields: Catalogue Section, Series, Book Title, Class/Stage, Subject, Medium, Language Position, Book Type, SKU ID, MRP, ISBN, Author, Co Author, Pages, Length (cm), Breadth (cm), Thickness (cm), Weight (kg), Status.

Key rules: Category excluded; Book Type controlled; Medium optional and never inferred from subject; Class/Stage array-based; empty class array means intentionally unrestricted; UUID is publication identity; SKU optional; Tally/ERP mapping remains private; no catalogue-wide Language field or edition hierarchy in V1.

## Supabase catalogue pilot — DATABASE + PILOT DATA READY

Migration `20260920103408_create_catalogue_publication_master_v1` created `public.publications` and `public.publication_assets`, constraints/indexes, automatic `updated_at`, RLS and read-only public catalogue policies.

Approved pilot data: 33 Active publications total; 9 Early Learning; 22 School Learning; 2 College and University; 0 Competitive Exams; 6 deliberately class-unrestricted records represented by an empty `class_stage` array. Hidden Excel Category was not imported. Blank Status defaulted to Active. No full catalogue migration has occurred.

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

Target direction: `publications.id (UUID) → product_mappings.publication_id → SKU / Tally / ERP identifiers`.

## Supabase frontend pilot adapter — WORKING

`js/catalogue-supabase-adapter.js` reads Active publications/assets and converts them into the existing frontend contract. `catalogue-bootstrap.js` supports opt-in Supabase loading and session caching. Browse and Book Details preserve the Supabase source and originating browse context.

The public publishable Supabase key is used in browser configuration; service-role/secret credentials must never be committed.

## Current static catalogue state

`js/catalogue-data.js` remains the normal/default catalogue source. It still contains legacy placeholder/static records and some obsolete assumptions. Supabase Publication Master V1 is the intended future source of truth.

## Publication asset/storage pilot — COMPLETE

Actual publication images live in the public **`publication-assets` Supabase Storage** bucket. `publication_assets` stores the canonical publication relationship, asset type, storage path, public URL, ordering and active/primary state; the Publication Master Excel must not grow cover-image columns merely for website rendering.

The first deliberately small pilot imported and verified exactly four PNG assets:

- `10th LBA Science` (`22a9f39f-fd15-43dd-af31-caf2190ae48f`): primary `cover` and `back_cover`
- `My Book of Draw & Colour - 3` (`0a334b1e-3eb6-49eb-8a7a-747794df871b`): primary `cover` and `back_cover`

Each Storage object and public URL was verified; all four corresponding active `publication_assets` records exist. The Supabase Browse pilot renders both front covers, and each Book Details gallery renders front and back covers in order.

The supplied LBA English images were intentionally not imported because they are English Second Language assets and do not match the current pilot publication. No publication metadata was changed and no bulk image migration has occurred.

`scripts/upload-publication-assets.mjs` is the admin-only importer. It accepts UTF-8 JSON manifests with or without a BOM, requires `SUPABASE_SERVICE_ROLE_KEY` from the local environment, and must never receive a service-role key through a repository file.

## Immediate next step

Continue universal Search/Browse architecture and full Publication Master migration planning. Keep the asset pilot constrained while gathering confirmed asset-to-publication mappings; do not bulk-migrate covers or import the unconfirmed LBA English assets.

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

For meaningful changes: **Inspect current Git → read relevant docs → implement smallest coherent change → test affected flows → verify → update docs → commit.**

Do not claim a feature is complete solely because code was written.
