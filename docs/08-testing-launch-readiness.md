# CPC Digital Catalogue — Testing & Launch Readiness

> Current-state update: the repository has a Node test runner with 56 passing tests. A separate staging project is not required during current development; approved pilot integration testing may use CPC's development/pilot Supabase project.

## Purpose and scope

This document defines the practical verification strategy for deciding whether the existing CPC Digital Catalogue is ready for public launch. It covers the current static HTML/CSS/JavaScript application, its transitional Supabase catalogue path, local Selection/Custom Kit state, Edge Function/RPC requirement path, Storage assets, and GitHub Pages deployment.

It does not implement tests, change infrastructure, query production customer data, or treat the current application as a greenfield rewrite. Tests must be risk-based, reproducible, and proportionate to a public educational catalogue.

## 1. Testing principles

- Test current behaviour before changing it; each implementation phase receives regression verification.
- Automate stable, repeated, high-risk logic and access checks; manually verify visual, usability, accessibility, device, and publishing-quality outcomes.
- Security boundaries require direct verification, not only UI checks.
- Use synthetic publications, assets, contacts, and requirements. Never use production customer PII as test fixtures.
- Keep browsing independently testable from requirement submission.
- Do not run destructive, load/stress, migration, or active security testing against production.
- Define measurable pass/fail conditions and retain lightweight evidence.
- A test plan is not a pass result. No future release gate is marked passed by this document.

## 2. Environments and test data

| Environment | Safe activity | Not appropriate |
| --- | --- | --- |
| Local/developer | Pure logic, static UI, browser state, synthetic catalogue fixtures, syntax/static checks | Live secrets, customer data, production writes. |
| Test/staging (not currently verified) | Supabase schema/RLS/Storage/Edge Function integration, synthetic requirement submissions, rate-limit/idempotency/security testing, migration rehearsal | Real customer data or uncontrolled load. |
| Production | Small non-destructive smoke checks after approved deployment | Schema testing, RLS bypass attempts, rate-limit stress, active penetration testing, destructive cleanup. |

Use the existing development/pilot Supabase project for approved integration testing. A separate staging project is not required at this stage; every remote mutation remains explicitly approved.

Use synthetic publication IDs, synthetic contact data, test-only assets, and known stage-specific Kit fixtures. Non-production test requirements must carry a clear test source/marker and be removed only through approved non-production cleanup procedures. Production records are never used as disposable fixtures or deleted by tests.

## 3. Practical test layers

| Layer | Scope | Automation suitability |
| --- | --- | --- |
| Pure logic/unit | Normalisation, search/filter predicates, Selection quantities, Kit completion, payload/configuration helpers | Automate early. |
| Module/integration | Data adapter, asset resolution, local state migration, page/module interactions | Automate early where stable. |
| Database/security | RLS, grants, RPC validation, canonical lookup, Storage access | Automate early in test/staging. |
| Browser/end-to-end | Core journeys across static routes, request flow, deep links | Automate later after stable seams exist. |
| Manual UX/visual | Responsive layouts, unified gallery, keyboard/screen-reader basics | Manual, with selected assisted checks. |
| Production smoke | Small public availability check after deployment | Manual/controlled, non-destructive. |

No unit, browser, integration, security, or CI testing framework is currently present in the repository. There is no package manifest/build tooling and no verified GitHub Actions workflow. The minimum foundation is pure module seams plus a small automated logic/security suite and documented manual smoke checklist; tool selection is deferred.

## 4. Functional test scope

### Homepage and discovery

Verify load, header/brand fallback, prominent search, Browse by Level, Playgroup/Nursery/LKG/UKG, school classes, series, subjects/book types, retained featured content, footer, internal links, keyboard navigation, mobile layout, and honest empty/error states. Featured content must be real/data-driven if retained.

### Browse, search, and filters

Test static source while retained and Supabase source during transition: initial load, loading/failure states, category/class/series/subject/type filters individually and combined, clearing/reset, zero results, cards, direct URLs, URL/query state, browser back/forward, invalid data, and mobile filter presentation. Test sorting only if it is implemented.

Search cases must use representative data rather than hard-coded production titles: exact/partial title, series, stage/class, subject, medium, ISBN, SKU where intended, mixed case, whitespace, punctuation, special/unexpected input, and no result. Expected behaviour is case/whitespace-tolerant discovery where supported, safe text handling, and useful no-result recovery.

### Publication detail and samples

Test valid and invalid publication UUID/direct links; active/inactive publication behaviour; cover and missing-cover fallback; classification/description/MRP and missing optional values; assets; Add to Selection; eligible/ineligible Kit action; mobile and keyboard use. Publication sharing and related navigation are deferred.

The unified Book Details gallery is the launch capability. Test front cover, back cover, ordered sample pages, no sample, broken/missing asset, loading, mobile, keyboard/focus, large asset, and network interruption. Viewing an available sample must require neither login nor contact data; a separate viewer or PDF is not required.

### My Selection

Test add one/many, duplicate add, quantity boundaries/change, removal/clear, cross-page persistence, refresh, localStorage corruption, stale/inactive publication, changed metadata, legacy-state migration if introduced, mobile, and transition to Send Requirement. Verify terminology and experience remain Selection—not Cart, checkout, or ordering.

### Early Learning Custom Kit

Use data-configured fixtures for Playgroup, Nursery, LKG, and UKG. Test eligible/ineligible title, stage mismatch, add/remove, count/progress, review below minimum, exactly/below/above configured minimum, changed minimum, null/no-minimum configuration, local persistence, stale/inactive titles, quantities where supported, mobile, Kit name, edit/return-to-builder, and Send Requirement transition.

Review must remain possible below minimum. Completed actions must respect the configured rule in both browser guidance and trusted server validation; tests must not assume eight permanently.

### Deferred PDF and sharing

Custom Kit PDF, Kit sharing, and publication sharing are post-launch work. They need no launch test coverage beyond ensuring their absence does not block catalogue, Selection, Kit, or Requirement flows.

### Requirement form and backend

Test required/optional customer fields, name/phone/email/institution validation, whitespace/unusual characters/length limits, selection review, quantities, pending state, success/reference, failure/retry/double-click/timeout/refresh, mobile, and keyboard use. Verify the user-facing flow remains **Send Requirement**, not checkout, payment, or order placement.

In test/staging, verify the full Browser → Edge Function → RPC → database boundary with valid payload, malformed JSON, content type/method errors, missing customer, empty/excessive items, invalid quantities/total, invalid item type/IDs, inactive publication, canonical publication facts, Kit eligibility/minimum, transaction rollback, and generalised client error. Do not send these malformed/security tests to production.

## 5. Security, privacy, data, and migration tests

### Idempotency, abuse, and bot controls

Once implemented, repeat a submission using the same idempotency token and verify exactly one requirement plus the same safe success/reference; separately verify a legitimate new submission is possible and expiry/reuse is defined. This is a pre-launch reliability/security test.

Test rate limiting only in non-production/controlled environments: legitimate requests succeed, threshold and recovery-window behaviour work, excess attempts are limited without internals leaking, the mechanism minimises data, and catalogue browsing stays unaffected. If bot protection is implemented, test success/failure/provider outage/server verification/accessibility/mobile/privacy and bypass handling. It must never gate ordinary browsing/sample viewing.

### RLS and grants matrix

This is a mandatory security gate, exercised through direct API/database-role checks in test/staging rather than UI alone.

| Role | `publications` / `publication_assets` | `product_mappings` | `requests` / items / Kit components |
| --- | --- | --- | --- |
| `anon` | SELECT only intended active/catalogue-visible records/assets; no writes | No access | No read/write |
| `authenticated` (if used) | Same intentionally public read model unless later approved | No access | No read/write |
| Trusted service | Only narrowly required server operations | Required controlled lookup | Transactional validated submission only |
| Future Admin | Explicit authorised management only | Explicit need-to-know | Explicit authorised review only |

Verify SELECT/INSERT/UPDATE/DELETE for every table, RLS behaviour, effective grants/default ACLs, public catalogue regression, denied protected-table access, trusted submission continuity, and that future objects do not inherit unsafe privileges.

### Storage, server authority, XSS, URLs, and privacy

Test intended public cover/sample direct URLs, missing assets, inactive metadata, unsupported file handling, and no internal/private asset exposure. Future Admin upload tests cover MIME, size, extension, path, overwrite, association, and malicious-content handling.

Tamper with browser-supplied title, MRP, SKU, ISBN, stage, classification, publication UUID, and Kit eligibility in test/staging. The server must ignore/replace/reject manipulated facts according to canonical data. This is a P0 gate.

Use safe controlled XSS-like strings for catalogue text, search, requirement input, Kit name, malformed URLs, markup/event-handler-like values; verify text is rendered as text unless HTML is explicitly supported. Test direct links, malformed query parameters, encoded characters, `catalogueSource`, legacy URLs, browser history, QR-style entry, and absence of open redirects.

Privacy verification covers anonymous browsing/samples/Selection/temporary Kit; only necessary requirement data; no PII in analytics; no full payload in logs; no unexpected trackers/cookies; browser persistence minimisation; and final privacy notice where required.

### Catalogue quality, parity, and migrations

Before Supabase becomes authoritative, validate unique UUIDs; SKU/ISBN rules where applicable; title/classification/stage/series/medium/subject/MRP consistency; assets and primary cover/sample ordering; inactive records; Kit eligibility; orphan assets and mappings.

Static-to-Supabase parity must compare publication coverage, metadata, covers, MRP, search, filters, details, samples, Selection, Kit eligibility, and direct links. Do not retire static master data until approved parity passes.

Before future production migration/security work, rehearse in non-production: schema before/after, counts where appropriate, constraints/relationships/RLS/grants/functions, rollback, backups, and recovery. Production is never the first migration test.

## 6. Accessibility, responsive, browser, and performance tests

Automated and manual accessibility checks cover headings/landmarks, labels/alt text, keyboard-only navigation, visible focus, filter controls, unified gallery, Selection, Kit, forms/errors/status messages, contrast, zoom, and basic screen-reader behaviour. Automation does not establish certification.

Test every core flow at small/typical/large mobile, tablet, laptop/desktop, and large desktop. Practical launch coverage includes current Chrome, Edge, Firefox, Safari, Chrome Android, and Safari iOS; do not create an unsupported legacy-browser burden without a CPC requirement.

Measure rather than guess: homepage/Browse/detail load; image-heavy results; samples; large Kits; slow network; cold/warm cache; and Supabase latency. Establish practical targets after baseline measurement, not arbitrary enterprise SLAs.

## 7. Regression, deployment, production smoke, and recovery

Every phase's minimum regression includes homepage, Browse, publication detail, sample, Selection, Early Learning Kit, requirement flow, direct links, mobile, RLS/security boundary, and secret exposure review.

The current host is GitHub Pages and no workflow is verified. Future deployment checks should include static/link/JavaScript validation, configuration review, secret scan, relevant automated suite, controlled deployment, and smoke result. They do not assume a build system.

Production smoke is deliberately small and non-destructive: homepage/Browse load; known public publication/cover/sample; search; local Selection; Kit opening; and, only with explicit approval and a controlled synthetic marker, requirement health/submission. Never perform destructive security, rate-limit, migration, or bulk request tests in production.

Before schema/security changes, verify—not merely assume—database backup/recovery capability, migration rollback plan, recoverable previous Git revision/deployment, recoverable prior Edge Function, and catalogue-data recovery procedure.

## 8. Severity and release gates

| Severity | Meaning | Examples |
| --- | --- | --- |
| Blocker | Launch must not proceed | Customer exposure, service-role exposure, anonymous protected-table write, P0 gate failure, material anonymous abuse, canonical/Kit bypass, core catalogue outage, unrecoverable migration/data corruption. |
| Major | Fix or explicitly defer with accountable approval before launch | Core-flow failure on key browser/device, material public asset/data defect, repeated requirement reliability issue. |
| Minor | Does not prevent launch if documented | Isolated non-core behaviour with workaround. |
| Cosmetic | Visual polish without functional/accessibility impact | Small spacing/appearance difference. |

| Gate | Required checks / pass criteria | Blocking condition | Evidence / verifier |
| --- | --- | --- | --- |
| A — Product/functional | Core discovery, details, Selection, requirement flows pass | Core route/flow failure | Automated result + manual reviewer |
| B — Catalogue data | Data quality and static/Supabase parity pass where applicable | Missing/wrong public data or broken key assets | Comparison/report + CPC catalogue reviewer |
| C — Responsive/mobile | Core flows pass representative devices/viewports | Usability break on primary mobile path | Device/browser record + UX reviewer |
| D — Accessibility | Keyboard, labels, focus, errors, basic screen-reader checks pass | Core task inaccessible without workaround | Automated/manual checklist |
| E — Security | Docs 07 P0 controls/RLS/grants/secret scan pass | Any P0 failure or customer access exposure | Test/staging security evidence + reviewer |
| F — Privacy | Minimum data/notice/storage/log/analytics checks pass | Unapproved PII collection/exposure | Privacy/operations review |
| G — Requirement submission | Valid/invalid/retry/transaction tests pass | Lost/duplicate/unreliable requirement flow | Integration test + controlled test submission |
| H — Custom Kit | Configurable stage/eligibility/minimum/review tests pass | Client-only bypass or approved stages unavailable | Unit/integration/manual evidence |
| I — Sample gallery | Front/back/ordered sample-page/fallback/mobile tests pass | Available sample unusable or identity gate imposed | Browser/device evidence |
| J — Performance | Baseline measured and core flows remain responsive | Measured unacceptable core degradation | Measurement record |
| K — Deployment/recovery | Version, smoke, rollback/backup preparation verified | Cannot identify/recover previous version | Release record + operations reviewer |

### Security launch gate

Launch does not proceed until docs/07 P0 conditions are demonstrated: effective anonymous submission abuse controls, canonical server-side publication validation, lifecycle validation, and configurable Custom Kit eligibility/minimum validation. Each P1 must be fixed or have a documented risk owner, rationale, compensating control, and approved deferral; no P1 is silently ignored.

## 9. Go / no-go checklist and evidence

Use only these statuses in a release record: **PASS**, **FAIL**, **NOT TESTED**, **NOT APPLICABLE**, **DEFERRED WITH APPROVAL**. Do not mark a gate PASS because this plan exists.

| Check | Status | Evidence required |
| --- | --- | --- |
| Gates A–K | NOT TESTED until executed | Test output/checklist, date, tester/reviewer |
| P0 security conditions | BLOCKED BY MISSING IMPLEMENTATION until implemented/tested | Test/staging results and security sign-off |
| Data parity before source cutover | NOT TESTED | Comparison report and catalogue approval |
| Production smoke | NOT TESTED until deployment | URL/version/browser/time/result |
| Backup/recovery readiness | NOT TESTED | Verified procedure/owner/version |

Evidence stays lightweight: automated output, screenshot where useful, URL/browser/device, SQL/security test result, migration verification, secret-scan result, issue reference, date, tester, and reviewer. Issue handling is simply finding → classify → fix → retest → regression → close; no particular issue-management platform is required.

## 10. Launch sequence and post-launch checks

Conceptual sequence: implementation complete → automated tests → non-production verification → security verification → catalogue/data parity → manual UX/mobile/accessibility → backup/recovery confirmation → deployment → non-destructive smoke → monitor.

Initial post-launch checks are catalogue availability, errors, controlled requirement-submission health, abuse indicators, broken assets, unexpected access errors, performance, and user-reported problems. Monitoring must not become visitor surveillance.

Future Admin testing is separate: authentication, authorization/role boundaries, CRUD, uploads, validation, auditability, session handling, and direct API bypass tests before it is exposed.

## 11. Automation candidates and current gaps

| Classification | Candidates |
| --- | --- |
| Automate early | Publication normalisation/data quality; search/filter logic; Selection quantity/state; Kit minimum/configuration; payload construction; request validation; RLS/grants; server authority; requirement transaction/idempotency. |
| Automate later | Browser journeys, visual regression where useful, cross-browser runs, deployment smoke. |
| Manual | Publishing/brand quality, responsive/device feel, screen-reader review, controlled production smoke. |

The repository has 56 passing Node tests. Remaining verification is approved pilot integration testing for the prepared Requirement boundary, plus a small repeatable browser/manual regression suite. Sophisticated browser automation, a committed CI workflow, and a separate staging project are not initial-launch prerequisites.

## 12. Open testing questions

- Which unit and browser automation tools fit the static repository after a small prototype?
- Is visual regression automation valuable after the design stabilises?
- What measured performance thresholds are acceptable for CPC's target devices/networks?
- Is a controlled synthetic production requirement smoke submission approved, and how will it be identified/handled?

## 13. Document status

Status: Initial Testing & Launch Readiness baseline

Date: 2026-09-29

Authorities:

Product: [docs/01-product-requirements.md](01-product-requirements.md)

Architecture: [docs/02-system-architecture.md](02-system-architecture.md)

Flows: [docs/03-user-flows.md](03-user-flows.md)

UI/UX: [docs/04-ui-ux-specification.md](04-ui-ux-specification.md)

Database: [docs/05-database-schema.md](05-database-schema.md)

Technical: [docs/06-technical-design.md](06-technical-design.md)

Security: [docs/07-security-privacy.md](07-security-privacy.md)

Implementation evidence: actual repository, `supabase/recovery/`, and `supabase/functions/`
