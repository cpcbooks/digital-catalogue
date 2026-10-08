# CPC Digital Catalogue — Current Project State

## Read this first

- Branch: `codex/refactor-foundation`
- Latest owner-accepted application checkpoint: `1a13937 feat: complete accepted catalogue browse discovery UX`.
- Latest branch checkpoint: `3f7f81c docs: enforce UI preservation and regression checks` (documentation-only governance update).
- Checkpoint history: `b49f7ca` Batch 2A catalogue navigation/scroll; `2dcf7dc` Batch 2B Details quantity-edit return; `246753c` Batch 3B Standard Kit initialization concurrency; `1a13937` Batch 5B Browse discovery UX; `3f7f81c` UI preservation governance.
- Latest reported Codex verification: **128/128 passing Node tests** for Batch 5B. Historical evidence at `246753c` remains **116/116 full Node tests** and **23/23 Standard Kit focused tests**.
- This is a public Digital Catalogue; My Selection and Send Requirement are not cart, checkout, payment, or order flows.
- Owner browser acceptance covers the current navigation/Kit behaviours and accepted Batch 5B Browse discovery UX (**11/11 checks passed**). Batch 5B acceptance covered four discovery modes (All Books, By Series, By Subject, By Book Type), mobile two-column-by-two-row Browse tabs, desktop/tablet single-row tabs, tab/filter reset and restoration behaviour, View Book before Add to Selection, immediate quantity updates, and source-aware return context. Owner browser testing is manual acceptance evidence, not automated testing. Owner observed an approximately 2–3 second first Standard Kit load and nearly instant later loads; Custom Kit loading is currently acceptable. These are not formal mobile benchmarks, and network-request concurrency was not independently measured in DevTools.

## Environment and data

The existing Supabase project is the **DEVELOPMENT/PILOT** backend, not production. It has 43 active development publications. A separate staging project is not required now; every remote mutation, migration, import, deployment, or integration test still needs explicit approval.

Pilot data is sufficient for the implemented development/pilot scope. Incomplete Early Learning, SKU, asset, College, and Competitive coverage is a data-coverage limitation, not a reason to stop. The final CPC item master will later replace/refine it before launch.

## Implemented application state

Publication-driven routes share one normalized catalogue-source boundary. Supabase is intended to become authoritative; static data remains development/reference/fallback until final cutover. Source context persists through listing/detail, Early Learning, Kits, Selection, and Requirement journeys.

School Learning is implemented on that boundary; remaining work is data coverage, verification, and polish. Browse includes keyword/SKU/ISBN search, URL-backed All Books/By Series/By Subject/By Book Type discovery, accepted tab-reset and restoration behaviour, class/stage and conditional Medium refinements, valid MRP, reset/chips/no-results recovery, responsive controls, and natural image proportions. Browse uses an equal-width two-column-by-two-row tab layout on compact/mobile screens and a single row on tablet/desktop. Shared Selection actions present View Book before Add to Selection and immediately refresh persisted quantities across Browse, Details, and My Selection. Book Details has one gallery: front cover, back cover, then ordered sample pages—no separate sample viewer/action.

Custom Kit supports Playgroup, Nursery, LKG, and UKG. Nursery/LKG/UKG currently require 8 distinct eligible titles; Playgroup completion is unconfigured. Builder → Review → Edit, optional names, removal, source context, and My Selection compatibility are implemented. `customKitEligible: false` excludes a title; absent remains compatible/eligible where stage membership allows.

Cambridge Standard Kit has an implemented CPC-controlled foundation, Selection/Requirement compatibility, and source-aware loader (`83a7f75`). `20261005230000_prepare_development_standard_kit.sql` is deployed and verified on the DEVELOPMENT/PILOT backend: anon can read the enabled Development LKG Standard Kit and its eight ordered mappings, while configuration writes remain denied. Replace this temporary development composition with CPC-approved canonical IDs during final item-master cutover.

Standard Kit initialization now starts the independent Supabase catalogue and Kit-definition loads together (`246753c`), while retaining current error states and source behaviour. This checkpoint does not add configuration caching or alter Custom Kit.

## Requirement status

The working architecture is Browser → Edge Function → transactional RPC → request tables → CPC Requirement reference.

Requirement hardening is deployed and verified on the DEVELOPMENT/PILOT backend, including the subsequent JSON/location and variable-shadowing RPC fixes. A synthetic normal-book Requirement and idempotency replay succeeded without duplicate insertion; unknown UUID and malformed payloads were safely rejected, direct anon RPC execution was denied, and negative checks created no partial writes. The verified baseline is 4 requests / 21 items / 35 components. Controlled synthetic Development LKG Standard Kit and Nursery Custom Kit submissions were verified end-to-end, with idempotency replays creating no additional rows and an invalid below-minimum Custom Kit creating no partial writes. Requirement submission accepts canonical Supabase publication UUIDs only; static data remains browse-only development/reference/fallback data. Standard Kit submission requires an enabled CPC server definition. Rate limiting is intentionally deferred for DEVELOPMENT/PILOT; trusted client-IP provenance remains a production-release issue.

## Verified gates

### Source continuity

**SOURCE-CONTINUITY GATE: PASSED.** Current user-facing routes, runtime-created navigation, stored navigation, dynamic/post-helper links, and error/recovery paths were audited. Selection saved returns and post-interaction empty-state navigation, Book Details `returnTo`, School dynamic navigation, and Early Learning dynamic navigation are normalized to the current source. No known Supabase → static silent switch or stale static → Supabase switch remains; static/default URLs remain parameter-free. Do not reopen this as a standalone audit unless a new regression provides evidence.

### Final development/pilot regression

**HISTORICAL FINAL DEVELOPMENT/PILOT REGRESSION: PASSED.** Repository/static/automated verification covered Home/navigation, Browse, Book Details, My Selection, Standard Kit, Custom Kit, School Learning, truthful College/Competitive limited states, Requirement UI, static/Supabase behavior, accessibility implementation, error/validation presentation, and security/data boundaries. No BLOCKER or IMPORTANT finding remained; the historical checkpoint recorded 93/93 tests passing.

Browser/mobile E2E verification in that historical final regression was **environment-blocked**: Chrome DevTools localhost access returned `ERR_BLOCKED_BY_CLIENT`. This is not an application defect. Do not describe that final regression as browser-verified; subsequent owner browser acceptance is separately recorded above.

### Current verification evidence

The latest automated evidence is Codex's reported verification at `1a13937`: 128/128 full Node tests. Historical automated evidence at `246753c` remains 116/116 full Node tests and 23/23 Standard Kit focused tests. This is automated repository evidence, not independent browser acceptance. Owner browser acceptance separately confirmed source-aware Kit/navigation journeys, Book Details/listing return behaviour, the Batch 5B Browse discovery behaviour recorded above, and the Standard Kit performance observation.

## Current readiness

**DEVELOPMENT/PILOT READY — EXCLUDING FINAL ITEM MASTER/ASSETS.** The implemented pilot scope has no known accepted BLOCKER or IMPORTANT defect from the recorded regression and owner acceptance checkpoints, and development/pilot testing may proceed. This is **not production ready**. Current catalogue data is development/sample data where applicable. Main and GitHub Pages were not deployed from checkpoints `b49f7ca`, `2dcf7dc`, `246753c`, `1a13937`, or `3f7f81c`.

## Deferred production/final-data gates

- Final Item Master and publication assets.
- Final production Standard Kit compositions.
- Final Custom Kit eligibility/minimum rules where the final Item Master requires changes.
- Production-grade Requirement rate limiting and trusted client-IP provenance, or a suitable production-safe alternative.
- Production cutover, final content cleanup, and data reconciliation.

When the final Item Master arrives: reconcile it against development records; preserve canonical UUIDs for genuine matches where appropriate; update metadata; create UUIDs only for genuinely new publications; explicitly retire development-only records; reconcile assets; and configure final Custom Kit rules and Standard Kit compositions.

Deferred/post-launch: publication sharing, Custom Kit PDF/sharing, related titles, analytics, full Admin UI, sophisticated browser E2E, and ERP integration.

## Operational notes

Graphify integration exists and the commit hook may refresh tracked root outputs. CLI availability has been inconsistent; the known failure is `uv trampoline failed to canonicalize script path`. Do not reinstall or reconfigure it for routine work. Dated Graphify snapshots are non-canonical/untracked unless separately approved.

`data/development-publications/development-early-learning-001.json` and `scripts/import-publications.mjs` provide the reviewed development-data mapping; its ten approved Early Learning records are now in the pilot. The importer remains dry-run by default for future reviewed imports.

## Protected local artifacts

`asset-import/`, `supabase/recovery/`, and `supabase/schema/` are protected/untracked local material. Do not stage or treat recovery JSON as migrations.
