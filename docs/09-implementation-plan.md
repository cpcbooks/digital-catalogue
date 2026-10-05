# CPC Digital Catalogue — Implementation Plan

## Purpose

This is the current path from the implemented development baseline to launch. For the current branch, environment, test count, and protected artifacts, read [PROJECT-STATE.md](PROJECT-STATE.md) first. The product remains a Digital Catalogue: My Selection and Send Requirement are catalogue follow-through, not cart, checkout, payment, or order flows.

## Implemented baseline

- Publication-driven public routes use the shared normalized static/Supabase catalogue-source boundary.
- Browse, Book Details unified gallery, School Learning navigation, My Selection, Custom Kit, and Cambridge Standard Kit foundation are implemented.
- The existing Supabase project contains 33 active development/pilot publications and is sufficient for continued development.
- Commit `0f5bc96` prepares Requirement hardening locally; it has not been applied to the remote development/pilot project.
- The repository has 56 passing Node tests.

## Remaining path

1. Review and integrate the prepared Requirement hardening against the development/pilot Supabase environment after explicit approval.
2. Verify the recovered private attempts-store design and implement appropriate server-side rate limiting.
3. Expand development catalogue data only where a material test case is absent, using selected static titles as explicitly marked development/test records after approval.
4. Exercise the complete application against the pilot catalogue: Home/navigation, Browse, School Learning, Exam Preparation, Book Details, My Selection, Early Learning, Custom Kit, Cambridge Standard Kit, and Send Requirement.
5. Complete accessibility, mobile, cross-browser, error/recovery, and manual regression polish.
6. When available, clean, map, and import the final CPC item master and real publication assets.
7. Configure final Custom Kit eligibility/rules and CPC-approved Cambridge Standard Kit compositions using canonical publication UUIDs.
8. Establish/finalize the production environment and perform migration, RLS/grant, function, Storage/secrets, backup/recovery, Requirement, and final-data verification.
9. Launch after the release checks pass.
10. Implement deferred enhancements post-launch only when needed.

## Approval and safety boundaries

The development/pilot project may be used for approved migrations, Edge Function deployments, controlled test-data imports, and integration testing. Each remote action still requires explicit approval. Do not use production customer/request data for tests, modify production without explicit authorization, or silently treat pilot data/configuration as production.

## Deferred/post-launch

Publication sharing, Custom Kit PDF/sharing, related-title recommendations, analytics, a full Admin UI, sophisticated browser E2E automation, and ERP integration are not initial-launch blockers. Do not add checkout, payments, inventory, invoices, customer accounts, or a framework migration without a separately approved need.

## Launch definition

Launch requires approved production readiness, final catalogue data/assets and Kit configuration, a working validated Requirement path, accessible responsive core flows, and evidence from the manual/integration regression checklist in [08-testing-launch-readiness.md](08-testing-launch-readiness.md). It does not require a separate staging project, final item-master availability to continue development, or deferred features above.

## Document status

Status: Current implementation path

Updated: 2026-10-05
