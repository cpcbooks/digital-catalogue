# CPC Digital Catalogue — Current Roadmap

Last reconciled: 2026-11-02 IST (UTC+05:30)

## Completed: public functional implementation and acceptance

- Catalogue browsing, category/class navigation, shared Browse/Search and Book Details.
- Individual book selection, Standard Kits, Custom Kits, mixed selections, quantities and persistence.
- Requirement Details, review, anonymous submission, confirmation, idempotent replay and friendly failure/retry UX.
- Production integration and final acceptance: **37/37 mobile checks**, **5/5 final smoke checks**, **8/9 integration scenarios** (actual live 429 not tested; mocked frontend handling passed).
- PR #33 mobile Custom Kit navigation fix and PR #34 network/retry UX deployed.
- Approved Publication Master V1.1: **427 publications**, **20 columns**, permanent **CPC00001–CPC00427** SKUs; production `publications` count verified at 427.
- Test submissions and related attempts removed: zero requests/items/kit components/rate-limit attempts at verification.

## Current milestone: launch content and presentation

1. Prepare and associate original **front covers** with the correct permanent SKU/publication; add back covers where available.
2. Prepare and upload **sample pages/PDFs** selected for launch; check access, ordering and display.
3. Review homepage/category banners and desktop/mobile appearance; preserve approved design and book cover fidelity.
4. Perform **business data sign-off** for titles, classes, categories, MRPs, descriptions and kit compositions.
5. Conduct a **focused media/content smoke check** after uploads. Do not repeat the entire functional suite unless a regression or implementation change warrants it.

## Current approved business classification

| Category | Count |
| --- | ---: |
| Early Learning | 86 |
| School Books | 180 |
| Exam Preparation | 116 |
| College & University | 45 |
| Competitive Exams | 0 |

The approved master includes **Catalogue Category**. Class 10 Internal Assessment and five Class 10 workbooks belong in Exam Preparation. PUC/Degree classification is optional. Do not confuse the business category names with older navigation labels or database schema fields.

## After public launch (separate decisions)

- CPC Admin Portal V1: planned as an independent implementation, not required for launch.
- Additional digital assets, enhancements and optional catalogue-only mode require separate approval.
- Do not introduce checkout, payments, customer login, speculative ERP features or a second catalogue/search architecture as part of launch preparation.

## Retired milestones (historical only)

The 33-publication pilot, unresolved SKU policy, full-master preparation/import, and pending Custom Kit deployment were **superseded by completed production work**. Do not follow obsolete pilot migration/reset instructions.
