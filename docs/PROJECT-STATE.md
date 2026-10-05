# CPC Digital Catalogue — Current Project State

## Read this first

- Branch: `codex/refactor-foundation`
- Latest relevant checkpoint: `0f5bc96 Harden requirement submission boundary`
- Automated baseline: **68 passing Node tests**.
- This is a public Digital Catalogue; My Selection and Send Requirement are not cart, checkout, payment, or order flows.

## Environment and data

The existing Supabase project is the **DEVELOPMENT/PILOT** backend, not production. It has 33 active development publications. A separate staging project is not required now; every remote mutation, migration, import, deployment, or integration test still needs explicit approval.

Pilot data is sufficient for continued development. Incomplete Early Learning, SKU, asset, College, and Competitive coverage is a data-coverage limitation, not a reason to stop. The final CPC item master will later replace/refine it before launch.

## Implemented application state

Publication-driven routes share one normalized catalogue-source boundary. Supabase is intended to become authoritative; static data remains development/reference/fallback until final cutover. Source context persists through listing/detail, Early Learning, and Kit journeys.

School Learning is implemented on that boundary; remaining work is data coverage, verification, and polish. Browse includes keyword/SKU/ISBN search, category/class/series/subject/type/medium filters, valid MRP, reset/chips/no-results recovery, responsive controls, and natural image proportions. Book Details has one gallery: front cover, back cover, then ordered sample pages—no separate sample viewer/action.

Custom Kit supports Playgroup, Nursery, LKG, and UKG. Nursery/LKG/UKG currently require 8 distinct eligible titles; Playgroup completion is unconfigured. Builder → Review → Edit, optional names, removal, source context, and My Selection compatibility are implemented. `customKitEligible: false` excludes a title; absent remains compatible/eligible where stage membership allows.

Cambridge Standard Kit has an implemented CPC-controlled foundation and Selection/Requirement compatibility. Real compositions are intentionally unconfigured until approved canonical publication UUIDs are available; the current customer state is truthfully unavailable.

## Requirement status

The working architecture is Browser → Edge Function → transactional RPC → request tables → CPC Requirement reference.

Commit `0f5bc96` prepares hardening locally: strict DTO, canonical snapshots, Custom Kit validation, Standard Kit type compatibility, and idempotency. The prepared migration explicitly secures internal Kit configuration tables and the submission RPC; it and the matching Edge Function are **not deployed/applied remotely**. For a controlled pilot rollout, temporarily hold Requirement submissions, apply the migration, deploy the matching Edge Function immediately, run one synthetic submission, then reopen the flow. Requirement submission accepts canonical Supabase publication UUIDs only; static data remains browse-only development/reference/fallback data. Standard Kit submission requires an enabled CPC server definition. Rate limiting is not activated because the private attempts-store schema, trusted IP source, and concurrency behavior remain unverified.

## Immediate next steps

1. Review and, with explicit approval, integrate prepared Requirement hardening against the pilot backend.
2. Verify/implement the private rate-limit design.
3. Expand development catalogue records only where needed for missing test cases.
4. Run the complete pilot end-to-end and manual mobile/accessibility/error regression.
5. Later clean/import final data/assets, configure final Kit rules/compositions, finalize production, and perform release/security/data verification.

Deferred/post-launch: publication sharing, Custom Kit PDF/sharing, related titles, analytics, full Admin UI, sophisticated browser E2E, and ERP integration.

`data/development-publications/development-early-learning-001.json` and `scripts/import-publications.mjs` prepare ten approved Early Learning records for a future explicit pilot import. The importer is dry-run by default; no publication row has been imported by this local preparation.

## Protected local artifacts

`asset-import/`, `supabase/recovery/`, and `supabase/schema/` are protected/untracked local material. Do not stage or treat recovery JSON as migrations.
