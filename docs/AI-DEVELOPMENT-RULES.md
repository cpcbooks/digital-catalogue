# CPC Digital Catalogue — AI / Developer Working Rules

Last updated: 2026-08-16 17:52 IST (UTC+05:30)

These rules exist to prevent regressions, duplicate implementations and loss of project context.

## Before changing code

1. Read `docs/PROJECT-STATE.md`.
2. Read the relevant architecture/data/decision document.
3. Inspect the current Git implementation of the affected feature.
4. Search for existing shared modules before creating a new one.
5. Preserve working behaviour unless the task explicitly changes it.

## Implementation rules

- Prefer shared modules/contracts over page-specific duplicate logic.
- Make the smallest coherent change that solves the problem.
- Do not redesign a working page merely to integrate backend behaviour.
- Do not introduce a schema field without checking `DATA-MODEL.md` and actual CPC data.
- Do not infer publication medium from subject.
- Do not reintroduce `level` for Nursery–Class 10; use `class`.
- Do not expose Supabase service-role/secret credentials in browser code.
- Do not trust browser-provided SKU/Tally/internal identifiers as authoritative.
- Prefer browser-native navigation behaviour where it produces the correct UX.
- Do not create persistent scroll restoration that replays stale positions.

## Testing rules

Do not report completion merely because a file was updated.

For each meaningful change:

1. verify syntax/structure
2. test the primary flow
3. test adjacent flows likely to regress
4. test relevant mobile behaviour when UI is affected
5. preserve customer data/selection on recoverable errors
6. verify backend writes when backend behaviour changes

If full browser testing is not available, state exactly what was and was not verified.

## Documentation checkpoint rules

Documentation is part of Done.

Update docs:

- whenever an architectural/data decision is made
- whenever a milestone is completed
- whenever the next priority changes
- after a substantial active-development block (roughly 30–45 minutes) if several changes have accumulated
- before ending a long development session

Do not paste chat transcripts. Summarize durable state and decisions.

### Timestamp standard

Every documentation checkpoint must include both date and time using CPC's working timezone:

`YYYY-MM-DD HH:MM IST (UTC+05:30)`

For chronological logs such as `DECISIONS.md` and `CHANGELOG.md`, meaningful entries should carry their own timestamp when known. For state/reference documents, maintain a `Last updated:` timestamp near the top. Git commit history remains the authoritative machine-level audit trail; documentation timestamps are for fast human recovery and sequencing.

## Required documentation updates

- `PROJECT-STATE.md`: current truth, completed/working state, current priority, next steps
- `ARCHITECTURE.md`: stable system architecture
- `DATA-MODEL.md`: catalogue schema/taxonomy
- `DECISIONS.md`: chronological durable decisions and rationale
- `ROADMAP.md`: completed/current/next/later
- `CHANGELOG.md`: meaningful shipped changes

## Recovery procedure after lost/partial chat context

Do not guess.

1. inspect Git
2. read `PROJECT-STATE.md`
3. read `DECISIONS.md` and relevant architecture docs
4. inspect Supabase when backend state matters
5. reconcile docs with implementation
6. ask the user only about decisions that cannot be recovered from persistent project state

## Definition of Done

**Inspect → Implement → Test → Verify → Document → Commit.**
