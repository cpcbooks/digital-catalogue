# CPC Digital Catalogue — Project State

Last updated: 2026-11-02 IST (UTC+05:30)

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

The 33-publication/9-Early-Learning pilot count is historical and must not be used as the current catalogue count. The verified current Supabase catalogue contains 86 active Early Learning publications that are Custom Kit eligible. Other historical pilot totals remain reference data only; no full catalogue migration is implied by this record.

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

## Standard Kit V1 — merged, configured and accepted

Standard Kit V1 is configured in the approved Supabase catalogue project for four enabled Early Learning stages: Playgroup (11 publications), Nursery (8), LKG (12), and UKG (13), for 44 configured publications in total. The fixed CPC composition is ordered and has one copy of each included publication per kit set. The two Flash Card entries without valid SKU mappings remain deliberately deferred.

Customers may add multiple complete kit sets through the existing My Selection quantity controls; Standard Kits remain distinct from individual publication selections and Custom Kits. Current Standard Kit desktop and mobile UI has been accepted by CPC. The reusable catalogue UI guidance is documented in `docs/06-catalogue-design-system.md` and `docs/07-ui-page-patterns.md`.

Standard Kit V1 is merged into `main`; no production deployment is implied by this project-state record.

## Custom Kit cross-stage V1 — configured, accepted, pending merge/deployment

Custom Kit V1 has been configured in Supabase project `ysaxagxortpxyifyaydx`. Playgroup, Nursery, LKG and UKG are enabled for Custom Kit completion with a minimum of 8 distinct eligible titles. The 86 active Early Learning publications marked Custom Kit eligible are available across all four selected kit stages; the selected stage remains part of each kit's identity.

Anonymous users have read-only access to enabled Early Learning kit rules through the dedicated SELECT policy; no anonymous write permission has been granted. The request RPC no longer requires a Custom Kit publication to match the selected kit stage, while active-publication, eligibility, duplicate, minimum-title, quantity, idempotency and Standard Kit composition validation remain in place. The four Standard Kits and their 44 configured components are preserved. The two historic Flash Card mapping deferrals apply only to Standard Kit composition.

The Custom Kit frontend functionality, approved UI, and immediate stage rendering with asynchronous availability checks have been manually accepted on localhost. The implementation remains uncommitted and unmerged; no production website deployment is implied by this project-state record.

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

## 2026-10-23 13:14 IST (UTC+05:30) — IM-14A/A.1 deployed

IM-14A/A.1 deployed to `main` in `1857057`: shared vertical cards, preserved cover proportions, compact media areas, and a blank portrait fallback for missing or failed covers. Production smoke testing passed. No Supabase update or homepage redesign occurred.

## Publication-card alignment fix

The shared vertical card action area reserves matching heights for the Add and selected quantity controls. Empty quantity-validation text does not consume layout space, and the mobile quantity grid remains the approved three-control layout: `− 1 +`. This is presentation-only; selection quantities, catalogue data, Supabase and navigation are unchanged.

## IM-15 deployed — `108c205421ffd0bd49a48cd60a2829755fb45505`

IM-15 homepage refinement is deployed in production at `108c205421ffd0bd49a48cd60a2829755fb45505`. Existing source-aware navigation and direct shortcuts remain intact. New Arrivals opens the shared Browse page in curated mode at `browse.html?view=new-arrivals`, currently displaying the approved Wondera Computational Thinking & AI Classes 1–8 SKUs `CPC00252`–`CPC00259`; tabs, search, filters and sorting are hidden only in that mode. No data or schema change was made.

The approved homepage presentation assets are deployed from `assets/homepage/{desktop,mobile}/`; source masters are retained in `catalogue-image-assets/`. Hero, category and New Arrivals imagery are presentation-only and must remain separate from Supabase-backed publication covers, back covers, samples and PDFs. Wondera front covers remain deferred and use the established blank portrait fallback. No publication data, Supabase configuration or catalogue runtime was changed.

## 2026-11-02 — Production launch-readiness reconciliation (supersedes stale pilot statements above)

This dated reconciliation records verified later state; historical pilot descriptions above are retained for traceability but are **not** current instructions.

- **Public functional testing: CLOSED / PASS.** Mobile acceptance: 37/37; final desktop/mobile production smoke: 5/5. Production integration: eight scenarios passed (some with mocked production-page responses); an actual production HTTP 429 was deliberately not triggered. Do not represent that case as end-to-end tested.
- **Production release:** PR #33 resolved mobile Build Your Own Kit navigation; PR #34 improved network failure and `Retry-After` messaging, confirmed deployed on GitHub Pages at `227eab4`. The live submission Edge Function `submit-catalogue-request` v10 was active at final verification.
- **Approved publication master:** V1.1, **427 publications**, permanent SKUs **CPC00001–CPC00427**, **20 columns including Catalogue Category**. Approved category totals: Early Learning 86; School Books 180; Exam Preparation 116; College & University 45; Competitive Exams 0. Class 10 Internal Assessment and five Class 10 workbooks belong in Exam Preparation. PUC and Degree do not require a classification. Earlier assertions that SKU allocation is unresolved or that the complete master is pending are superseded.
- **Production data:** Supabase `public.publications` contained 427 records at the final verification. This does not independently certify every metadata value; CPC must still approve the catalogue content.
- **Kits:** Standard Kits and Custom Kits are live and have passed desktop/mobile testing, including mixed selections and persistence. Earlier notes saying Custom Kit is uncommitted or pending deployment are obsolete.
- **Submission:** Successful live frontend submission, identical-key replay without duplicate, invalid payload rejection, and confirmation were verified. Mocked production-page checks covered network recovery, 429 frontend messaging, double clicks and kit preservation. The live HTTP 429 branch itself remains untested to avoid exhausting the production quota.
- **Security:** The private rate-limit table has RLS disabled, but direct schema/table privileges for `anon` and `authenticated` are denied; both request RPCs are also non-executable by those roles. This is a focused access-control finding, not a comprehensive security certification.
- **Test-data cleanup:** Seven test requests, 22 request items, 29 kit components and three rate-limit attempts were cleared. Subsequent verification: zero rows in each of those four tables; 427 publications retained.
- **Launch readiness:** Public catalogue functionality is accepted. Remaining pre-announcement work is publication front/back covers, intended sample pages/PDFs, homepage visual review and final business verification of titles, classes, categories, MRPs and kit compositions. No further feature development or Admin Portal V1 implementation is required for this public catalogue launch.
- **Source of truth:** Live production behavior, approved Publication Master V1.1 and this dated reconciliation supersede conflicting pilot-era prose. Do not reset/recreate publication UUIDs or rerun pilot-to-full-master migration based on obsolete sections.
- **Scope separation:** CPC Admin Portal V1 is a separately planned workstream, not a public-catalogue launch blocker.
