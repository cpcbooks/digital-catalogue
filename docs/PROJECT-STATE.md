# CPC Digital Catalogue — Current Project State

## Read this first

- Branch: `codex/refactor-foundation`
- Latest relevant checkpoint: `83a7f75 Add source-aware Standard Kit loader`
- Automated baseline: **75 passing Node tests**.
- This is a public Digital Catalogue; My Selection and Send Requirement are not cart, checkout, payment, or order flows.

## Environment and data

The existing Supabase project is the **DEVELOPMENT/PILOT** backend, not production. It has 43 active development publications. A separate staging project is not required now; every remote mutation, migration, import, deployment, or integration test still needs explicit approval.

Pilot data is sufficient for continued development. Incomplete Early Learning, SKU, asset, College, and Competitive coverage is a data-coverage limitation, not a reason to stop. The final CPC item master will later replace/refine it before launch.

## Implemented application state

Publication-driven routes share one normalized catalogue-source boundary. Supabase is intended to become authoritative; static data remains development/reference/fallback until final cutover. Source context persists through listing/detail, Early Learning, and Kit journeys.

School Learning is implemented on that boundary; remaining work is data coverage, verification, and polish. Browse includes keyword/SKU/ISBN search, category/class/series/subject/type/medium filters, valid MRP, reset/chips/no-results recovery, responsive controls, and natural image proportions. Book Details has one gallery: front cover, back cover, then ordered sample pages—no separate sample viewer/action.

Custom Kit supports Playgroup, Nursery, LKG, and UKG. Nursery/LKG/UKG currently require 8 distinct eligible titles; Playgroup completion is unconfigured. Builder → Review → Edit, optional names, removal, source context, and My Selection compatibility are implemented. `customKitEligible: false` excludes a title; absent remains compatible/eligible where stage membership allows.

Cambridge Standard Kit has an implemented CPC-controlled foundation, Selection/Requirement compatibility, and source-aware loader (`83a7f75`). `20261005230000_prepare_development_standard_kit.sql` is deployed and verified on the DEVELOPMENT/PILOT backend: anon can read the enabled Development LKG Standard Kit and its eight ordered mappings, while configuration writes remain denied. Replace this temporary development composition with CPC-approved canonical IDs during final item-master cutover.

## Requirement status

The working architecture is Browser → Edge Function → transactional RPC → request tables → CPC Requirement reference.

Requirement hardening is deployed and verified on the DEVELOPMENT/PILOT backend, including the subsequent JSON/location and variable-shadowing RPC fixes. A synthetic normal-book Requirement and idempotency replay succeeded without duplicate insertion; unknown UUID and malformed payloads were safely rejected, direct anon RPC execution was denied, and negative checks created no partial writes. The verified baseline is 4 requests / 21 items / 35 components. Requirement submission accepts canonical Supabase publication UUIDs only; static data remains browse-only development/reference/fallback data. Standard Kit submission requires an enabled CPC server definition. Rate limiting remains inactive because the private attempts-store schema, trusted IP source, and concurrency behavior remain unverified.

## Immediate next steps

1. Browser verification using the already-configured Chrome DevTools MCP for Standard Kit and pending Custom Kit flows.
2. Verify/implement the private rate-limit design.
3. Run the remaining pilot manual mobile/accessibility/error regression.
4. Later clean/import final data/assets, configure final Kit rules/compositions, finalize production, and perform release/security/data verification.

Deferred/post-launch: publication sharing, Custom Kit PDF/sharing, related titles, analytics, full Admin UI, sophisticated browser E2E, and ERP integration.

`data/development-publications/development-early-learning-001.json` and `scripts/import-publications.mjs` provide the reviewed development-data mapping; its ten approved Early Learning records are now in the pilot. The importer remains dry-run by default for future reviewed imports.

## Protected local artifacts

`asset-import/`, `supabase/recovery/`, and `supabase/schema/` are protected/untracked local material. Do not stage or treat recovery JSON as migrations.
