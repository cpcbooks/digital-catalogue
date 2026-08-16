# CPC Digital Catalogue — Architecture

## Architectural principle

Prefer one shared catalogue architecture over page-specific implementations. Pages may present different journeys, but product identity, selection, book details, request submission and discovery should reuse shared contracts.

## Catalogue product identity

Every publication should have a permanent catalogue `id`. This ID is the stable bridge between:

- catalogue data
- selections
- book details
- submitted request snapshots
- future SKU/ISBN/Tally mapping

Customer-visible labels and internal operational names must not be treated as identity.

## School-stage classification

For Nursery through Class 10, use **`class` only**. Do not model the same concept using both `level` and `class`.

`class` is an array so a publication can apply to more than one class without duplicating the product record.

Examples:

```js
class: ["Nursery"]
class: ["LKG"]
class: ["8"]
class: ["6", "7", "8"]
```

Legacy `levels` compatibility is temporary technical debt and should be removed after the catalogue data is migrated and verified.

## Subject vs medium

These fields answer different questions:

- `subject`: what is being studied (e.g. Mathematics, Science, Kannada, English)
- `medium`: language medium/edition of the publication (e.g. English, Kannada)

Never infer one from the other.

Example: a Class 4 Kannada textbook can have:

```js
subject: "Kannada"
medium: "English"
```

if it belongs to the English-medium school publication set.

Regular textbooks are treated as English medium unless the actual publication master establishes a separate medium edition. Kannada-medium guides/editions must be explicitly represented from verified data.

## Higher Education and Competitive Exams

Do not force these domains into school-only fields merely for convenience.

Before implementation, inspect real CPC titles and introduce only the minimum additional taxonomy needed (for example PUC year/course/degree/exam). Avoid speculative fields.

The universal Browse/Search engine must be designed after these taxonomies are known so it does not have to be rewritten around school-only assumptions.

## Universal discovery

Global search and Browse All should share one engine/page rather than duplicate filtering logic.

Intended concept:

- homepage search → universal browse/search results with query
- Browse All → same engine without query
- Browse All Series → same engine with series-oriented entry/filter
- Subjects & Book Types → same engine with subject/type-oriented entry/filter

## Selection architecture

Selections are shared across catalogue sections through the existing `cambridgeOrder` contract.

Both normal books and custom kits are valid top-level selections. Custom kits contain component book snapshots.

## Request architecture

A customer submission is an **order request**, not a confirmed sales order.

Supabase stores immutable request snapshots. Internal fulfilment mapping is separate from customer-facing catalogue terminology.

Authoritative internal mapping is:

`catalogue product id → SKU → ISBN → Tally Item Name → optional Tally/ERP identifiers`

The backend must never trust customer/browser-supplied internal identifiers as authoritative.

## Security boundary

Public browser:

- can browse static catalogue
- can maintain local selection/request draft
- can call controlled submission endpoint
- cannot directly read/write private request tables
- never receives service-role credentials

Supabase Edge Function + database function form the trusted submission boundary.

## Navigation principle

Use browser-native history/scroll restoration for ordinary catalogue → Book Details → Back navigation where possible.

Do not create permanent session scroll-memory that causes old positions to replay on refresh or later visits.
