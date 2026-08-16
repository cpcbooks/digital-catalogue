# CPC Digital Catalogue — Changelog

This is a concise functional changelog, not a commit-by-commit transcript.

## 2026-08-16

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
- Removed problematic custom persistent scroll restoration from ordinary View Book navigation in favour of native browser history behaviour.

### Architecture / project continuity

- Established Git `/docs` as persistent project memory.
- Recorded decision to use `class` rather than parallel `level` + `class` for Nursery–10.
- Recorded that subject and medium are independent.
- Prioritized Higher Education + Competitive Exams before universal Browse/Search, then product mapping/staff workflow.
