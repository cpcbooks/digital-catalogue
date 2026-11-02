# CPC Digital Catalogue — Current Project State

Last reconciled: 2026-11-02 IST (UTC+05:30)

This is the **current-state recovery document** for Codex and CPC. Historical pilot decisions remain in `docs/DECISIONS.md` and Git history; do not treat pilot-era plans as active work.

## Product and scope

Cambridge Publishing Company Pvt. Ltd. (CPC), Bengaluru, publishes a **catalogue-first** public website. Primary journey: Home → category / Browse / Search → class or stage → publications → Book Details. Optional secondary journey: Add to Selection → My Selection → Requirement Details → Review Requirement → Send Requirement. This is **not** a payment, checkout or order-management portal. Anonymous browsing and request submission are supported.

Production website: https://cpcbooks.github.io/digital-catalogue/index.html
GitHub repository: `cpcbooks/digital-catalogue`, production branch `main`.
Supabase project: `ysaxagxortpxyifyaydx` (CPC Digital Catalogue).

## Approved publication master and production data

**Publication Master V1.1 is approved**, with 427 publications, 20 columns **including Catalogue Category**, and permanent SKU identifiers **CPC00001–CPC00427**. Approved category allocation:

| Catalogue Category | Publications |
| --- | ---: |
| Early Learning | 86 |
| School Books | 180 |
| Exam Preparation | 116 |
| College & University | 45 |
| Competitive Exams | 0 |
| **Total** | **427** |

Class 10 Internal Assessment and five Class 10 workbooks belong to Exam Preparation. PUC and Degree do not require a classification. Distinguish the **approved master business category labels** from any older frontend `Catalogue Section`/navigation labels or existing database column names; do not silently rename schema fields. Verify exact field mapping against the approved V1.1 workbook before modifying imports.

The production `public.publications` table was independently verified at **427 rows** after test-data cleanup. Preserve database UUIDs and permanent SKUs. Do **not** rerun pilot-reset or full-master import steps. Catalogue records must not be invented or silently overwritten.

## Architecture and navigation

Supabase `publications` and `publication_assets` support the live catalogue through the existing Supabase adapter and source-aware browsing; `js/catalogue-data.js` remains a legacy/static compatibility path, **not** the canonical approved 427-publication master. Inspect deployed routing/source selection before altering either path. The shared Browse/Search, Book Details, selection persistence and contextual Back/Home navigation are accepted; do not rebuild.

Publication media is stored separately from the master in Supabase Storage bucket `publication-assets` and referenced by `publication_assets`. Supported sequence: front cover → back cover → sample pages/PDFs. Preserve original cover artwork and orientation/aspect ratio. Missing media placeholders are intentional until actual assets are uploaded.

## Kits and selection

Early Learning supports Playgroup, Nursery, LKG and UKG. Standard Kit V1 has four approved fixed stage kits; recorded compositions: Playgroup 11, Nursery 8, LKG 12, UKG 13 (44 configured entries), with two historical Flash Card mapping deferrals. Custom Kit is enabled for these stages with a minimum of **8 distinct eligible titles**. The 86 active Early Learning publications were configured as Custom Kit eligible in the verified implementation. The selected stage remains part of kit identity. Verify current database rules before changing compositions.

Individual publications, Standard Kits and Custom Kits can coexist in My Selection. Quantity changes, review details, persistence and mobile behavior passed acceptance testing. PR #33 resolved the mobile Build Your Own Kit navigation defect.

## Submission and backend

Public requests are anonymous, validated server-side and submitted through `submit-catalogue-request` (Edge Function version 10 active at final verification). The request is a business enquiry, **not** a confirmed order. The backend persists request snapshots with normalized kit components; a matching idempotency key prevents duplicate submissions. PR #34 deployed friendly network-failure and `Retry-After` handling; production `main` was `227eab4` at integration verification.

The private rate-limit table has RLS disabled but direct schema/table access by `anon` and `authenticated` was denied; both request RPCs denied these roles EXECUTE. This is a **focused permission check**, not a complete security certification. Avoid changing permissions or RLS without impact review.

## Final functional acceptance (2026-11-02)

- Mobile functional tests: **37/37 passed**.
- Final production smoke: **5/5 passed** (homepage, categories, book details/media fallbacks, mobile kit links, selection-to-review).
- Production integration: **8 scenarios passed**, including some **mocked production-page frontend** scenarios. Actual production HTTP **429 was not triggered** to preserve shared quota.
- Verified real production submission, idempotent replay returning the same reference without another row, and invalid payload rejection.
- Following CPC's confirmation that all requests were tests, cleanup deleted **7 requests, 22 request items, 29 kit components and 3 rate-limit attempts**. Subsequent counts: **0** in those four tables, **427** publications retained.
- **Public functional testing workstream is CLOSED / PASS.** Do not restart the whole suite for content-only work.

## Launch preparation — remaining

1. Prepare and upload **actual book covers** (front, and back where available); verify correct SKU/title association, aspect ratio and mobile presentation.
2. Upload and verify **sample pages/PDFs** intended for day-one school/dealer previews.
3. Review final homepage/banner visuals and category presentation.
4. Obtain CPC business approval for publication titles, classes, category allocation, MRP, kit composition and other customer-visible metadata.

The website is functionally launch-ready; **final content/presentation readiness is still pending**. Do not describe all covers or samples as complete. Do not create another test submission unless explicitly needed.

## Separate future work

**CPC Admin Portal V1** is planned separately (secure staff login, publications/media management, requests, kits, New Arrivals, settings/security). It is **not** a public catalogue launch prerequisite. Its implementation requires its own approved scope, branch/worktree and testing; do not combine it with content launch work.

## Codex working rules

Read `AGENTS.md`, this document and only the relevant design/data/backend reference docs. Inspect actual implementation before proposing changes. Preserve accepted UI and selection behavior, permanent SKUs, UUIDs, RLS/security boundaries and production data. Make small changes on a dedicated branch, test affected paths, update docs and request CPC approval before merge/deploy.
