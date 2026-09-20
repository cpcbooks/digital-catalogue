# CPC Digital Catalogue — Data Model

This document is the authoritative catalogue-field guide. Update it before/with schema-level changes.

Detailed Supabase implementation direction lives in `SUPABASE-CATALOGUE-ARCHITECTURE.md`.

## Publication Master V1 — current working specification

Current canonical master columns:

- Catalogue Section
- Series
- Book Title
- Class/Stage
- Subject
- Medium
- Book Type
- Description
- SKU ID
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

`Category` and `Language Position` are excluded from V1 and have been removed from the working master.

SKU ID is intentionally unresolved/parked. Do not invent a SKU convention merely to proceed with catalogue work.

## Identity

The current database uses a generated UUID for each publication. Do not derive database identity from title or ISBN.

The 33 current Supabase publications are pilot data. When the complete Publication Master is ready, the pilot dataset may be backed up and replaced with a clean production import. Recreated publications receive new UUIDs, so associated asset mappings must be recreated/remapped as part of that controlled migration.

A permanent business SKU/matching strategy must be decided before repeated production master updates become routine.

## Catalogue Section

Required. Current controlled values:

- `Early Learning`
- `School Learning`
- `College and University`
- `Competitive Exams`

`College and University` intentionally combines the currently small PUC, Degree and college/university catalogue. It can be split later if the catalogue volume justifies it.

## Book Title

Required. Store CPC's complete official/customer-facing publication title exactly as it should appear to customers.

Do not reconstruct the title from Series + Subject + Class and do not shorten the title merely because Series is stored separately.

## Series

Optional. Use only for a genuine named CPC publication family/series.

Current genuine examples include:

- Little Master's
- Inspiring
- Honest Success Series
- LBA
- Marks Scorer
- Key To Success

Generic book names/formats such as `Workbook`, `Q-Bank` and `Internal Assessment` are not Series unless CPC later explicitly establishes them as branded product families.

Series is controlled-but-extensible: unknown values should be flagged for review, not silently added or permanently rejected.

## Class / Stage

Optional. Database representation is an array of strings.

Current approved values:

- Nursery
- LKG
- UKG
- 1 through 10
- 1st PUC
- 2nd PUC

Examples:

```text
["LKG"]
["8"]
["2nd PUC"]
["5", "6", "7"]
[]
```

An empty array means intentionally not class/stage-specific within its catalogue section. This is common for Early Learning titles and must not be replaced by invented values such as `All`, `General` or `Any Class`.

In Excel, multiple specific stages use ` | ` as the standard separator, for example `5 | 6 | 7`; import tooling should normalize that to an array.

## Subject

Optional normalized academic subject. Current approved values:

- English
- Kannada
- Hindi
- Mathematics
- Science
- Social Science
- Environmental Studies
- Grammar
- Economics

Subject is controlled-but-extensible. A legitimate new subject should be reviewed and added to the approved configuration; spelling variants should not silently create new subjects.

Subject may be blank for combined/multi-subject publications and for publications where a conventional academic subject is not meaningful. Do not list multiple subjects in one Subject cell for a Combined Guide.

## Medium

Optional and independent of Subject.

Current controlled values:

- `English`
- `Kannada`

Use Medium only where CPC genuinely distinguishes medium-specific editions, principally guides/question banks and similar exam-preparation products. Ordinary textbooks/readers/workbooks should not automatically receive a medium merely because their content is in that language.

Do not infer Medium from Subject.

## Language Position

Removed from Publication Master V1.

First/Second/Third Language information may remain part of the official Book Title where CPC uses it, but it is not maintained as a separate catalogue field because it currently applies only to a subset of publications and is not required for discovery/filtering.

## Book Type

Required generic publication format. Current V1 controlled values:

- Textbook
- Guide
- Combined Guide
- Question Bank
- Workbook
- Activity Book
- Writing Book
- Drawing Book
- Reader
- Semester Book
- Assessment Book
- Rhymes Book
- Map Book

Book Type answers “what kind of publication is this?” and must not encode Series, Subject, language or marketing category.

The list is controlled-but-extensible. When the complete catalogue reveals a genuinely different publication format, review and deliberately add it rather than allowing ad-hoc variants.

## Description

Optional customer-facing text describing the publication and its main benefit/content. Keep it clear and concise; no fixed word count is required.

The Supabase pilot already includes a nullable `description` field and Book Details renders it as `About this book` when present.

## Commercial and physical fields

- MRP: optional non-negative numeric value; store the number only, not `₹`, `Rs.` or `/-`.
- ISBN: optional ISBN-13 identifier stored canonically as 13 digits only, with no spaces or hyphens. Treat as text, not a numeric quantity. Import validation should normalize permitted separators and verify the ISBN-13 check digit. Customer-facing display formatting may add correct ISBN hyphenation separately.
- Author / Co Author: optional text fields.
- Pages: optional positive whole number.
- Length / Breadth / Thickness: optional numeric centimetre values; units are defined by the column, not typed into the cell.
- Weight: optional numeric kilograms value.

Do not over-normalize contributors in V1; contributor relationship tables can be introduced later if real catalogue requirements justify them.

## SKU ID

Parked. The field may remain blank while CPC decides its permanent SKU convention.

Do not generate arbitrary SKUs solely to satisfy the catalogue. SKU becomes important before repeated production Excel → Supabase update cycles, but it is not required to replace the current pilot dataset with one clean approved full-master import.

## Status

Required. Current controlled values:

- `Active` — currently available
- `Upcoming` — confirmed publication not yet available; customer-facing wording may be `Coming Soon`
- `Inactive` — existing publication currently not offered
- `Discontinued` — permanently stopped

Do not use `Upcoming` merely because metadata such as ISBN/MRP/cover is incomplete; it should represent an actual confirmed forthcoming publication.

## Controlled-value policy

The approved lists above are V1 lists derived from the current sample, not permanent closed taxonomies.

Validation/import tooling should be configuration-driven. Definite rule violations are errors; legitimate unknown Series/Subject/new controlled values should be flagged for review. Once CPC approves a new value, update the configuration and rerun validation.

Do not allow staff/importers to create spelling/case variants silently.

## Internal product mapping

Internal operational identifiers remain separate from public catalogue presentation in Supabase `product_mappings`.

Tally Item Name is not the catalogue title and must never become publication identity. Tally/ERP mapping fields must not be exposed to public catalogue clients.

## Assets and catalogue content

Publication images are stored separately from Publication Master metadata in Supabase Storage plus `publication_assets`.

Current supported display order:

`Front Cover → Back Cover → Sample Page 1 → Sample Page 2 → ...`

Front cover is required for the intended live catalogue; back cover is recommended; sample pages are optional. Portrait, landscape and other original aspect ratios are supported and should not be cropped/stretched merely to fit a fixed catalogue shape.

## Submitted request snapshots

Selection/Submit Request is an add-on to the catalogue. Submitted requests preserve customer-visible product data as immutable snapshots. Internal fulfilment mappings are resolved separately server-side and also snapshotted when available.
