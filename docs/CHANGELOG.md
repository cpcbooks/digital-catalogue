# CPC Digital Catalogue — Changelog

This is a concise functional changelog, not a commit-by-commit transcript.

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
