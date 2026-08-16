# CPC Digital Catalogue — Project State

Last updated: 2026-08-16

This is the primary recovery document for the project. Read this file before substantial development work, then inspect the current Git implementation before making changes.

## Product goal

Build a premium, easy-to-use Cambridge Publishing Company digital catalogue that lets customers discover publications, select books/custom kits, set quantities, submit an order request, and gives CPC a reliable operational request record.

This is a catalogue/request system, not an e-commerce checkout in V1.

## Current customer journey

Implemented and working:

1. Homepage / catalogue entry
2. Early Learning browsing
3. School Education browsing
4. School book lists
5. Book Details
6. Build Your Own Kit
7. Shared My Selection
8. Quantity editing and validation
9. Request Details form
10. Review Request
11. Send Request through Supabase Edge Function
12. Success state with CPC request reference

Verified real end-to-end submission:

- `CPC-20260816-5645CC`
- 8 top-level selections
- total quantity 18
- included a custom LKG kit
- Supabase correctly stored request, request items and kit components

## Backend state

Supabase project: **CPC Digital Catalogue**.

Implemented:

- `requests`
- `request_items`
- `request_kit_components`
- `product_mappings`
- atomic `submit_catalogue_request(jsonb)` database function
- `submit-catalogue-request` Edge Function
- RLS enabled on business tables
- browser roles cannot directly read/write request tables
- internal SKU/Tally mappings are resolved server-side rather than trusted from browser input

Product mapping data itself is intentionally not populated yet.

## Current priority

Do **not** continue product mapping/staff workflow yet.

Finish the customer-facing catalogue discovery surface first.

Current roadmap:

1. Normalize/lock shared catalogue data model
2. Higher Education
3. Competitive Exams
4. Universal Browse + Global Search engine
5. Wire homepage Browse All Series / Subjects & Book Types / top search into the universal discovery engine
6. Full regression testing
7. Populate product mappings (SKU / ISBN / Tally Item Name / internal identifiers)
8. Staff request dashboard + notifications

## Important recovered decisions

- Do not maintain both `level` and `class` for Nursery–Class 10.
- Use **`class` only**.
- `class` should support multiple applicable classes via an array.
- Early Learning school-stage values are Nursery, LKG and UKG. (Playgroup must be verified against actual catalogue data before treating it as a supported product class.)
- School values are 1–10.
- Subject and medium are separate concepts.
- A Kannada subject book is **not** automatically Kannada medium.
- Regular textbooks are English medium.
- Kannada-medium editions are used only where an actual Kannada-medium publication exists; guides in higher school classes are the main known case and must be confirmed from real data.
- Do not infer medium from subject.

## Navigation/UX rules already learned

- Preserve browser-native Back/scroll restoration for ordinary View Book navigation.
- Do not persist stale scroll positions and replay them on refresh/revisit.
- My Selection is shared across catalogue sections.
- Quantity limits currently allow 1–10,000 for selected request lines; invalid input should be explained rather than silently producing confusing values.
- `0` must support clearing/removing a selection through the intended selection UX rather than requiring minus-button gymnastics.
- Preserve working Review Request UI; backend integration is already complete.

## Homepage gaps

The homepage already visually contains:

- Higher Education
- Competitive Exams
- top catalogue search
- Browse All Series
- Subjects & Book Types

These are not all functionally wired yet. Do not redesign them unnecessarily; implement the missing journeys using shared architecture.

## Development definition of done

For meaningful changes:

**Inspect current Git → read relevant docs → implement smallest coherent change → test affected flows → verify → update docs → commit.**

Do not claim a feature is complete solely because code was written.
