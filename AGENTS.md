# CPC Digital Catalogue — Agent Instructions

Use this file as the **first-read context for Codex/AI coding sessions**. Keep it concise: detailed project knowledge lives in `/docs`.

## Token-efficient startup

Do **not** scan the whole repository by default.

1. Read this file.
2. Read `docs/PROJECT-STATE.md` for current truth and next priority.
3. Read `docs/AI-DEVELOPMENT-RULES.md` for working rules.
4. Read only the relevant reference doc for the task:
   - architecture → `docs/ARCHITECTURE.md`
   - catalogue schema/taxonomy → `docs/DATA-MODEL.md` and, only when needed, `docs/catalogue-data-model.md`
   - prior decisions → `docs/DECISIONS.md`
   - backend/request flow → `docs/request-backend-architecture.md`
   - roadmap → `docs/ROADMAP.md`
5. Inspect/search only the files involved in the requested feature before editing.
6. Search for an existing shared implementation before creating new logic.

Avoid repeatedly reading every documentation file or dumping large files when a targeted search/range is enough.

## Project

Static customer-facing digital catalogue for **Cambridge Publishing Company Pvt. Ltd. (CPC), Bengaluru**.

Primary flow:

`Home → Category → Class/Stage → Publications/Options → Book → Selection → Review/Request`

Top-level catalogue taxonomy:

- **Early Learning** — Playgroup, Nursery, LKG, UKG
- **School Learning** — Classes 1–10
- **College and University** — 1st PUC, 2nd PUC, Degree
- **Competitive Exams** — exam-specific categories

School Exam Preparation (Honest Success, LBA, etc.) is part of School Learning and is distinct from Competitive Exams.

## Critical data rules

- `js/catalogue-data.js` is the current central catalogue dataset.
- For Nursery–Class 10, use **`class`**, not a separate `level` data field. `class` is array-based in catalogue records.
- Subject and medium are separate concepts. A Kannada subject does not imply Kannada medium.
- Do not invent CPC titles, SKU, ISBN, MRP, Tally item names, covers or other product data.
- Preserve internal operational identifiers for backend/team use, but do not trust browser-submitted internal identifiers as authoritative.

## UX / navigation contract

Preserve user context.

- Internal catalogue pages should offer a compact direct **Home** route as well as the contextual parent/back route; users must not need to backtrack page-by-page to reach Home.
- Category card background on Home opens the category landing page.
- Nested shortcuts (e.g. LKG, Class 9, 2nd PUC) open that exact stage and must not trigger the parent-card navigation.
- From a publication browser, book details Back returns to the originating browser/context.
- School Books / Exam Preparation Back returns to the selected class page, not generic School Learning.
- Early Learning kit flows Back returns to the selected Early Learning stage (e.g. UKG), not generic Early Learning.
- Selection/Review `Continue Browsing` should return to the context from which Selection was opened whenever that context is available.
- Prefer native browser history for immediate detail-page returns and scroll restoration. Never replay stale saved scroll positions after refresh or unrelated navigation.
- Publication listings use the shared responsive card system in `css/publication-browser.css`: cover-led multi-column cards on desktop and compact horizontal cards on mobile. Do not reintroduce one-book-per-full-width-row layouts without a specific reason.
- Desktop may use richer discovery cards; mobile should prioritize compact, fast navigation.

## Selection behaviour

- Shared selection logic lives in `js/catalogue-selection.js`.
- Selection persists while users browse.
- A compact floating selection pane is expected across catalogue pages when items are selected.
- Avoid creating a second competing cart/selection implementation.

## Backend

Supabase is used for submitted request persistence/integration. Follow the existing backend architecture and inspect current implementation before changing it.

Never expose service-role or secret credentials in client-side code.

## Editing rules

- Inspect current code first; a requested feature may already exist.
- Make the smallest coherent change.
- Reuse shared modules/contracts rather than duplicating page-specific logic.
- Preserve working behaviour unless the task explicitly changes it.
- Do not redesign unrelated UI while fixing a bug.
- Do not add placeholder/fake product data merely to make a page look populated.

## Verification

For meaningful changes, verify:

1. syntax/structure
2. requested flow
3. adjacent navigation likely to regress
4. mobile behaviour for UI changes
5. selection persistence where relevant
6. backend writes where relevant

Do not claim browser/device testing that was not actually performed.

## Documentation

Durable project context belongs in `/docs`, not in long prompts.

After a substantial development block or durable decision, update the relevant docs. Use timestamps in:

`YYYY-MM-DD HH:MM IST (UTC+05:30)`

Do not paste chat transcripts into docs. Record only durable state, decisions, rationale and next steps.

## Definition of Done

**Inspect → Implement → Test/Verify → Document when durable → Commit.**

When uncertain, recover state from Git + docs instead of asking the user to repeat established project decisions.