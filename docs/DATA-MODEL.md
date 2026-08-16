# CPC Digital Catalogue — Data Model

This document is the authoritative catalogue-field guide. Update it before/with schema-level changes.

## Core publication record

Target shape (fields are added only when supported by real CPC data):

```js
{
  id: "permanent-catalogue-id",
  title: "Customer-facing publication title",
  series: "Series name",
  category: "early-learning | school | higher-education | competitive-exams",
  class: ["LKG"],
  subject: "Mathematics",
  medium: "English",
  bookType: "Textbook",
  isbn: null,
  mrp: null,
  cover: null,
  active: true
}
```

## `id`

Required permanent catalogue identity. Do not derive business identity from title text.

## `class`

For Nursery through Class 10, this is the only school-stage field.

Type: array of strings.

Known school-stage vocabulary:

- `Nursery`
- `LKG`
- `UKG`
- `1` through `10`

A title spanning classes uses multiple values, e.g.:

```js
class: ["5", "6", "7"]
```

Do not introduce a parallel `level` field.

Playgroup appears in the current homepage UI but must be verified against actual product data before it is locked into the canonical class vocabulary.

## `subject`

The academic/language subject of the book.

Examples:

- Mathematics
- Science
- English
- Kannada
- Hindi
- Social Science

Subject does not determine medium.

## `medium`

The edition/instruction medium.

Known values currently needed:

- English
- Kannada

Rules:

- regular textbooks are English medium unless verified otherwise
- a Kannada subject textbook may still have `medium: "English"`
- Kannada medium is used only for an actual Kannada-medium edition
- guides for higher school classes are a known area where English/Kannada medium variants may exist; verify against real master data before bulk assignment

## Higher Education

Do not invent the final field set until CPC's actual PUC/Degree titles are inspected.

Expected need may include distinctions such as 1st PUC, 2nd PUC, degree/course/semester, but these must be based on actual catalogue structure.

## Competitive Exams

Do not reuse `class` for exam names. A dedicated exam/category taxonomy should be introduced after inspecting actual CPC competitive-exam titles.

## Internal product mapping

Internal operational identifiers live in Supabase `product_mappings`, keyed by permanent catalogue `product_id`.

Fields include:

- SKU
- ISBN
- Tally Item Name
- Tally Stock Item ID (optional/future)
- ERP Item ID (optional/future)

Customer-facing catalogue records and internal Tally terminology remain separate.

## Submitted request snapshots

Submitted requests preserve customer-visible product data as immutable snapshots. Internal fulfilment mappings are resolved separately server-side and also snapshotted on request lines/components when available.
