# CPC Digital Catalogue — Changelog

This is a concise functional changelog, not a commit-by-commit transcript.

## 2026-09-20

### Navigation + publication-browser consistency audit

- Migrated Early Learning Individual Books from the legacy full-width row layout to the shared responsive publication-card system.
- Standardized Early Learning Individual Books to `Home | contextual level` navigation.
- Simplified School Exam Preparation presentation so product families contain the same shared publication grid used elsewhere; subject remains visible on each card and available as a filter rather than creating a second nested visual hierarchy.
- Added the shared `Home | contextual parent` navigation pattern to School class pages, Early Learning level pages, Kit Builder and Book Details.
- Category landing pages now expose the same compact Home navigation rather than a visually different Back control.
- Book Details keeps its contextual source return while also providing a direct Home route.
- Existing selection, quantity, filtering, kit and request-flow behaviour was preserved.
- Live GitHub Pages visual/device verification remains required after deployment.

### 10:51 IST — Publication browsing UX upgrade

- Added shared `publication-browser.css` for consistent publication-card presentation.
- Replaced dense full-width School Books and School Exam Preparation rows with cover-led desktop grids.
- Added compact horizontal publication cards for mobile instead of shrinking desktop grids into tiny cards.
- Prepared College and University and Competitive Exam browsers to use the same shared card system when verified titles are populated.
- Added compact direct `Home` + contextual parent navigation to these publication browsers.
- Recorded the shared card/navigation contract in `AGENTS.md` and the decision log for future Codex sessions.
- Code was structurally updated in Git; live GitHub Pages visual/device verification is still required after deployment.

### 08:57 IST — Project recovery on new laptop

- Cloned the current `main` branch on the new development laptop.
- Reconciled project state and roadmap with the already implemented College and University and Competitive Exams navigation/browser shells.
- Confirmed that verified titles are still required before those sections can display publications.

### 09:00 IST — Shared catalogue discovery structure

- Added one Browse page with search and filters derived from existing catalogue records.
- Connected homepage search, Browse All Series and Subjects & Book Types to that page.
- Kept College and Competitive Exams product records empty pending verified title lists.
- Refined search to match multiple words across title, class, subject and series after live testing.

## 2026-08-16

### 18:07 IST — Catalogue schema normalization

- Rebuilt `catalogue-data.js` around the canonical `class` array model.
- Removed the catalogue `levels` field from source data.
- Preserved previous Early Learning availability by explicitly mapping common titles to Nursery/LKG/UKG.
- Kept Draw & Colour A/B/C mapped to Nursery/LKG/UKG respectively.
- Corrected school textbook medium semantics: Kannada/Hindi subjects remain English-medium textbook records.
- Removed legacy Hindi-medium values from the current guide/exam dataset; current guide media are English/Kannada.
- Reworked shared catalogue queries and validator for class arrays only.
- Updated Kit Builder and Book Details for the canonical class model.
- Updated request submission so class arrays are converted safely into current backend snapshot fields.

### Request flow / backend

- Completed customer Request Details and Review Request journey.
- Added secure Supabase backend for catalogue order requests.
- Added atomic request + request-item persistence.
- Added custom-kit component persistence.
- Added internal product mapping structure for SKU, ISBN, Tally Item Name and future ERP identifiers.
- Added server-side mapping so browser-supplied internal identifiers are not authoritative.
- Added Supabase Edge Function submission endpoint.
- Connected Review Request `Send Request` to backend with success/error behaviour.
- Verified real end-to-end submission: `CPC-20260816-5645CC`.

### Catalogue UX

- Consolidated shared selection behaviour across catalogue sections.
- Fixed quantity edge cases including max quantity and typed-value/plus-minus inconsistencies.
- Improved zero/removal selection behaviour.
- Added/iterated compact My Selection access.
- Removed problematic stale scroll restoration behaviour from ordinary book browsing flows.

### Architecture / project continuity

- Established Git `/docs` as persistent project memory.
- Recorded decision to use `class` rather than parallel `level` + `class` for Nursery–10.
- Recorded that subject and medium are independent.
- Prioritized Higher Education + Competitive Exams before universal Browse/Search, then product mapping/staff workflow.
