# Cambridge Digital Catalogue — Product Data Model (V1)

This document records the current architecture decisions for catalogue product data. It is intentionally flexible because the complete product master, SKU convention and verified commercial data are not yet available.

## Core principle

The catalogue must never invent product data. Unknown or unverified values stay empty/null until confirmed.

The model must also remain extensible: new optional fields may be added later without changing the permanent identity of an existing product.

## Product identity

- `id` — permanent software identity. Required and unique. Once assigned to a real product, do not change it.
- `sku` — business/operational stock code. Optional until the SKU convention is finalised. Must be unique when populated.
- `isbn` — publishing identifier. Optional where not applicable or not yet verified. Separate from SKU.

`id`, `sku` and `isbn` are different concepts and must not be used interchangeably.

## Classification

### Class

Use one class dimension across Early Learning and School Education.

Canonical class codes:

- `NUR` — Nursery
- `LKG` — LKG
- `UKG` — UKG
- `1` to `10` — school classes

Example:

```js
class: "LKG"
```

```js
class: "8"
```

The current legacy Early Learning `levels` field remains temporarily supported only for backward compatibility while actual Nursery/LKG/UKG mappings are still being confirmed. Do not guess mappings.

If a future real product is confirmed to apply to multiple classes, add an explicit multi-class field then rather than forcing every product to use arrays now.

### Category

`category` describes the catalogue route/product context, not the class itself. Current categories include:

- `early-learning`
- `school`
- `exam`

Future categories can be added when Higher Education, Competitive Exams or other ranges are implemented.

### Subject

- `subject` — normalized value used for filtering/grouping.
- `displaySubject` — optional customer-facing wording when the printed/display name differs from the normalized subject.

### Series and family

`series` is the preferred product-series field.

`family` currently exists for Exam Preparation compatibility. Where it merely duplicates `series`, it should eventually be retired after the UI grouping logic is migrated.

## Language vs medium

Language/subject and medium of instruction are different concepts.

A Kannada subject book is not automatically a Kannada-medium book.

`medium` should therefore be optional and used only where the product genuinely has a medium-specific edition (currently relevant to guide products where English-medium and Kannada-medium versions exist).

Do not populate `medium` merely because a title/subject is English, Kannada or Hindi.

## Commercial fields

- `mrp` — numeric MRP when verified; otherwise `null`/empty.
- Future commercial fields can be added later if required by ERP/import workflows.

Do not encode MRP or other frequently changing commercial values into permanent product IDs.

## Catalogue content

Optional fields include:

- `title`
- `series`
- `description`
- `features`
- `cover`
- `images.front`
- `images.back`
- `images.samples`

Missing content is allowed while catalogue enrichment is in progress.

## Lifecycle

- `active: true` — available to catalogue queries.
- `active: false` — hidden/discontinued without deleting historical product identity.

## Migration policy

1. Keep the current working catalogue backward-compatible while data is incomplete.
2. New confirmed Early Learning mappings should use canonical `class` codes.
3. Legacy `levels` mappings should be removed only after all affected records are verified and the validator/UI are fully migrated.
4. SKU naming rules and CSV/database import columns are intentionally not finalised yet.
5. A future CSV/database schema may add columns/fields without breaking existing products as long as permanent `id` values remain stable.
6. Legacy Tally names should eventually be mapped to canonical products rather than becoming product identities themselves.

## Current architecture priority

Architecture first; do not block progress waiting for the complete product master. Build shared catalogue behaviour around stable identity and optional attributes, then import verified master data when it becomes available.
