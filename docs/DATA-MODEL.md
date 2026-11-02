# CPC Digital Catalogue — Data Model

Last reconciled: 2026-11-02 IST (UTC+05:30)

This document describes **approved business data rules** and their relationship to the current catalogue implementation. The approved Publication Master V1.1 workbook remains the authoritative source for its exact 20 column names, values and publication rows. Do not assume that historical field names in code, Supabase and the workbook are identical.

## Publication Master V1.1 — approved

- **427 publications** and **20 columns**, including **Catalogue Category**.
- Permanent SKU IDs **CPC00001–CPC00427**, reserved for CPC-published titles in this approved master. Do not regenerate, recycle or derive identity from title.
- Approved category totals: Early Learning 86; School Books 180; Exam Preparation 116; College & University 45; Competitive Exams 0.
- Class 10 Internal Assessment and five Class 10 workbooks are Exam Preparation.
- PUC and Degree do not require classification.

The older V1 draft excluded Category and parked SKU allocation. Those statements are **obsolete**. Do not reintroduce them in importers, validators or future instructions.

## Identity and updates

`publications.id` (UUID) is the existing internal database identity. `SKU ID` is the approved permanent business identifier. Both must be preserved during ordinary edits. The database was verified to contain **427 publications** after test-data cleanup. Do **not** reset pilot rows or rebuild UUIDs as a routine import/update strategy.

Keep internal product/Tally/ERP mappings private and separate from customer-facing catalogue fields. Do not expose service-role credentials or operational mapping data in the browser.

## Classification and discovery

The approved business **Catalogue Category** is distinct from historical frontend **Catalogue Section** navigation terminology. The public catalogue has Early Learning, School Learning, Exam Preparation, College & University and Competitive Exams presentation/navigation concepts. Before changing schema, filters or adapters, inspect the actual approved master and live mapping rather than assuming a one-to-one text label match.

Preserve distinctions between:
- **Book Title**: complete customer-facing title, not a generated concatenation.
- **Series**: genuine named publication family, not generic Workbook/Question Bank format.
- **Class/Stage**: stage/class applicability; do not invent an `All` class.
- **Subject** and **Medium**: independent; Kannada subject does not imply Kannada medium.
- **Book Type**: publication format, not series or subject.
- **Status**: publication availability, not a proxy for missing images or incomplete metadata.

Legacy frontend `class` and backend class/stage representations may differ. Use the existing adapter/contract rather than adding parallel fields without review. Controlled values must be validated against the approved master; do not silently infer missing ISBN, class, price or medium.

## Commercial and bibliographic metadata

MRP is customer-visible without discounts. Preserve approved values; use numeric amounts rather than currency strings in storage. ISBN, contributors, physical dimensions, descriptions and other fields should follow the approved V1.1 workbook and current database mapping. ISBN-13 is textual and should be validated when supplied. Do not invent missing data.

## Assets

Publication media is separate from the master, stored in Supabase Storage `publication-assets` and linked through `publication_assets`. Intended display order:

`Front Cover → Back Cover → Sample Page 1 → Sample Page 2 → ...`

Keep provided cover artwork, typography, logo, original orientation and aspect ratio unchanged. Images may be missing while launch content is prepared; the public UI uses fallbacks. SKU-based folder naming is **`SKU Title`** under the approved image preparation workflow. Confirm actual uploader paths/manifest format before batch upload; folder names alone do not define storage URLs.

## Early Learning kits and requests

Four Standard Kits: Playgroup (11 configured publications), Nursery (8), LKG (12), UKG (13). Custom Kit is enabled for Playgroup/Nursery/LKG/UKG with a minimum of **8 distinct eligible titles**; the accepted configuration recorded **86 eligible Early Learning publications**. Keep Standard and Custom Kits separate selection types and preserve kit component snapshots.

Customer requests are immutable submission snapshots, not sales orders. `requests`, `request_items` and normalized `request_kit_components` hold request/kit history; an idempotency key prevents duplicate submissions. The frontend never receives private fulfilment mappings.

## Change control

Approved V1.1 business master → validate intended changes → preserve SKU and UUID identity → inspect impact on kits/assets/selection → stage and review → deploy only with CPC approval. The Admin Portal V1 is a separate planned workflow and must not be assumed already implemented.
