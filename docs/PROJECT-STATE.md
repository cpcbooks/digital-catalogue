# CPC Digital Catalogue — Project State

Last updated: 2026-09-20 15:53 IST (UTC+05:30)

This is the primary recovery document for the project. Read this file before substantial development work, then inspect the current Git implementation before making changes.

## Product goal

Build a premium, accurate, easy-to-use **CPC Digital Catalogue** that helps customers discover, browse, search and understand Cambridge Publishing Company publications.

**The catalogue is the primary product.** Selection, custom kits and Submit Request are secondary convenience features. This is not an e-commerce/order-management system, and request workflow must not drive the catalogue architecture.

Primary journey:

`Discover/Browse/Search → Category/Section → Class/Stage → Publications → Book Details`

Optional continuation:

`Select publications → Review Selection → Submit Request`

## Current customer journey

Implemented and working:

1. Homepage / catalogue entry
2. Early Learning browsing
3. School Learning browsing
4. School book lists
5. College and University navigation/browser shell
6. Competitive Exams navigation/browser shell
7. Shared Browse/Search discovery page
8. Book Details
9. Build Your Own Kit
10. Shared My Selection
11. Quantity editing and validation
12. Request Details form
13. Review Request
14. Send Request through Supabase Edge Function
15. Success state with CPC request reference

The recent UI consistency pass has been live-verified by the user. UI is intentionally deprioritized now except for blocking bugs.

## Existing Supabase state

Supabase project: **CPC Digital Catalogue** (`ysaxagxortpxyifyaydx`).

Verified existing public tables on 2026-09-20:

- `requests`
- `request_items`
- `request_kit_components`
- `product_mappings`

RLS is enabled on all four existing business tables.

Existing request add-on infrastructure:

- atomic `submit_catalogue_request(jsonb)` database function
- `submit-catalogue-request` Edge Function
- browser roles cannot directly read/write request tables
- internal SKU/Tally mappings are resolved server-side rather than trusted from browser input

The request system is secondary and should remain stable while catalogue architecture is migrated.

## Publication Master V1 — FROZEN FOR PILOT

The lean schema has been validated against a curated CPC sample dataset covering Early Learning, class-independent titles, school textbooks/readers/workbooks, individual and combined guides, LBA English/Kannada medium, Internal Assessment, Marks Scorer and PUC titles.

Canonical fields:

- Catalogue Section
- Series
- Book Title
- Class/Stage
- Subject
- Medium
- Language Position
- Book Type
- SKU ID (optional internal/business identifier)
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

Important decisions:

- hidden/legacy `Category` is excluded from Supabase V1
- Book Type remains a controlled generic publication-format field
- Medium is optional and used only where CPC genuinely distinguishes medium-specific publications; ordinary textbooks are not automatically English medium
- Class/Stage is array-based in the database; empty array means intentionally not stage-restricted within the section
- publication identity is a database-generated immutable UUID
- SKU is optional and is not publication identity
- Tally/ERP mapping remains private and separate
- no catalogue-wide `language` field in V1
- no edition/publication-family hierarchy in V1

Authoritative details: `docs/DATA-MODEL.md` and `docs/SUPABASE-CATALOGUE-ARCHITECTURE.md`.

## Current static catalogue state

`js/catalogue-data.js` remains the live catalogue source during the pilot.

Existing frontend contracts such as array-based `class`, shared query logic, Kit Builder, Book Details, publication browsers and selection must continue working while the backend source is introduced.

Do not perform a big-bang replacement.

## Current publication-browser UX

- `css/publication-browser.css` is the shared presentation contract for publication cards.
- publication browsers use cover-led multi-column cards on desktop and compact horizontal cards on mobile.
- internal catalogue pages expose direct Home plus contextual parent/back navigation where appropriate.
- Early Learning, School Learning, College and University, Competitive Exams, Kit Builder and Book Details follow the shared navigation approach.
- the previous one-book-per-full-width-row pattern should not be reintroduced without a specific UX reason.

## Immediate architecture priority

**NEXT: implement the Supabase catalogue pilot architecture from `docs/SUPABASE-CATALOGUE-ARCHITECTURE.md`, without switching the live catalogue source yet.**

Sequence:

1. create versioned catalogue migration for `publications` and `publication_assets`
2. add constraints/indexes/RLS/public read surface
3. import the curated ~30-row Publication Master pilot
4. validate data semantics and security
5. build a Supabase data adapter that maps canonical records into the current frontend catalogue contract
6. test representative catalogue journeys and universal discovery against the pilot
7. compare with current static behaviour
8. only then plan bulk master-data migration and eventual retirement of `catalogue-data.js` as authoritative source

## Migration rules

- Keep `catalogue-data.js` live during the pilot.
- Do not migrate all covers to Supabase Storage at the same time.
- Do not redesign the working request workflow during the catalogue pilot.
- Do not expose `product_mappings` or Tally/ERP fields to the browser.
- Do not invent missing publication values.
- Do not add lookup tables/fields merely because they might be useful someday.

## Navigation/UX rules already learned

- Internal catalogue pages should expose a compact direct Home route plus the contextual parent/back route where practical.
- Back navigation on internal/section pages should be consistently placed at the top-left of the content area; do not center the Back control just because the hero content is centered.
- Preserve browser-native Back/scroll restoration for ordinary View Book navigation.
- Do not persist stale scroll positions and replay them on refresh/revisit.
- My Selection is shared across catalogue sections.
- Preserve working Review Request UI/backend while catalogue architecture is developed.

## Development definition of done

For meaningful changes:

**Inspect current Git → read relevant docs → implement smallest coherent change → test affected flows → verify → update docs → commit.**

Do not claim a feature is complete solely because code was written.
