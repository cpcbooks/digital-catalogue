# CPC Digital Catalogue — Data Model

This document is the authoritative catalogue-field guide. Update it before/with schema-level changes.

Detailed Supabase implementation direction lives in `SUPABASE-CATALOGUE-ARCHITECTURE.md`.

## Publication Master V1

Validated against the curated CPC sample Publication Master on 2026-09-20.

Canonical catalogue fields:

- Catalogue Section
- Series
- Book Title
- Class/Stage
- Subject
- Medium
- Language Position
- Book Type
- SKU ID (optional business identifier; internal mapping, not identity)
- MRP
- ISBN
- Author
- Co Author
- Pages
- Length (cm)
- Breadth (cm)
- Thickness (cm)
- Weight (kg)
- Status

The hidden/legacy `Category` column in the working Excel is intentionally excluded from V1. Do not add it to the canonical database unless a later real discovery requirement cannot be represented by section + series + class/stage + subject + book type.

## Identity

Every publication gets a database-generated immutable UUID. Do not derive identity from title, ISBN or SKU.

SKU is optional and should not be invented merely to satisfy the catalogue database.

## Catalogue Section

Controlled values:

- `Early Learning`
- `School Learning`
- `College and University`
- `Competitive Exams`

## Book Title

Store CPC's official/customer-facing publication title. Do not reconstruct the title from Series + Subject + Class, and do not automatically prepend a series name when it is not part of the official title.

## Series

Nullable. Use only for a genuine publication family/series such as Little Master's, Inspiring, Honest Success Series, LBA, Marks Scorer or Key To Success.

Do not use a generic book format such as `Workbook` as Series unless CPC genuinely markets it as a named series.

## Class / Stage

Database type: array of strings.

Examples:

```text
["LKG"]
["8"]
["2nd PUC"]
["5", "6", "7"]
[]
```

An empty array means intentionally not class/stage restricted within its catalogue section. This supports Early Learning titles that can be used across stages without inventing an `All` class.

Do not introduce a parallel `level` field.

## Subject

Nullable normalized academic subject.

Examples:

- Mathematics
- Science
- English
- Kannada
- Hindi
- Social Science
- Environmental Studies
- Economics

Customer-facing Kannada titles can map to normalized subjects, e.g. `Vignana` → `Science`, `Samaja Vignana` → `Social Science`.

Subject may be blank for multi-subject or non-subject-specific publications such as combined guides, art/activity titles or semester books.

## Medium

Nullable and independent of Subject.

Current controlled values:

- `English`
- `Kannada`

Important CPC rule: Medium is used where CPC genuinely distinguishes medium-specific publications, principally guides/question banks and similar exam-preparation products. Ordinary textbooks/readers/workbooks should not automatically receive `English` medium merely because their content is English.

Do not infer medium from subject.

## Language Position

Nullable controlled values:

- `First Language`
- `Second Language`
- `Third Language`

Use only where the publication is actually classified that way. Do not infer school language-position rules for PUC/other segments.

Combined-guide shorthand such as `Combined K-I (EM)` remains in the official title in V1; do not add a catalogue-wide `language` field until a real filtering requirement justifies it.

## Book Type

Required generic publication format. Initial controlled values:

- Textbook
- Reader
- Semester Book
- Workbook
- Writing Book
- Activity Book
- Drawing Book
- Rhymes Book
- Guide
- Combined Guide
- Question Bank
- Assessment Book

Do not encode language into Book Type. Example: use `Subject = Kannada` + `Book Type = Reader`, not `Kannada Reader`.

## Commercial and physical fields

- MRP: nullable non-negative decimal
- ISBN: nullable text, preserving the customer-facing/hyphenated form
- Author / Co Author: nullable V1 text fields
- Pages: nullable positive integer
- Length/Breadth/Thickness: nullable centimetre values
- Weight: nullable kilograms

Do not over-normalize contributors in V1; contributor relationship tables can be introduced later if real catalogue requirements justify them.

## Status

Required; default `Active` for verified current catalogue records.

Initial values:

- Active
- Discontinued
- Out of Print
- Archived

## Internal product mapping

Internal operational identifiers remain separate from public catalogue presentation in Supabase `product_mappings`.

Target mapping:

`publication id → SKU → ISBN/reference → Tally Item Name → optional Tally/ERP identifiers`

Tally Item Name is not the catalogue title and must never become publication identity.

## Assets and catalogue content

Covers, back covers, sample PDFs and digital resources belong to a publication asset layer rather than being encoded into product identity. Existing GitHub assets may remain during the pilot; full Supabase Storage migration is deferred until the database-backed catalogue is verified.

## Submitted request snapshots

Selection/Submit Request is an add-on to the catalogue. Submitted requests preserve customer-visible product data as immutable snapshots. Internal fulfilment mappings are resolved separately server-side and also snapshotted when available.
