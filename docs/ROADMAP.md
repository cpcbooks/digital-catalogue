# CPC Digital Catalogue — Roadmap

Last updated: 2026-09-20 22:40 IST (UTC+05:30)

## Completed / verified

- Early Learning browsing
- School Education browsing
- School book lists
- Book Details
- Build Your Own Kit
- shared selection/cart-like request selection
- quantity UX/validation fixes
- Request Details
- Review Request
- Supabase request database
- internal fulfilment mapping structure
- custom-kit component snapshot/mapping structure
- secure Edge Function submission
- successful real end-to-end request (`CPC-20260816-5645CC`)
- canonical array-based Class/Stage model
- corrected subject/medium semantics
- shared universal Browse/Search structure
- Supabase Publication Master pilot with 33 records
- Supabase Storage publication-asset pilot
- front/back cover gallery verified for two pilot publications
- portrait and landscape Browse/Book Details image rendering without cropping
- optional publication Description field and Book Details `About this book` support
- future sample-page asset sequence supported
- Publication Master V1 data-entry rules refined and documented for CPC team
- image preparation/naming rules prepared for CPC team

## Current milestone — Prepare and prove the full catalogue dataset

The customer request journey is already implemented. Do not rebuild it. The current priority is completing the catalogue using verified CPC publication data while keeping the working request system stable.

### 1. Complete Publication Master — team/data task in progress

CPC team prepares the full master using the current V1 rules.

Current master fields:

`Catalogue Section, Series, Book Title, Class/Stage, Subject, Medium, Book Type, Description, SKU ID, MRP, ISBN, Author, Co Author, Pages, Length, Breadth, Thickness, Weight, Status`

Category and Language Position are excluded. SKU convention is parked.

Controlled lists are V1 approved values, not permanent closed taxonomies. Review legitimate additions when the complete data reveals them.

### 2. Prepare publication assets — team/data task in progress

For each publication, prepare a folder matching the Book Title with:

- `front` — intended required live cover
- `back` — recommended
- `sample-01`, `sample-02`, ... — optional useful inside pages

Preserve original aspect ratio; do not crop/stretch to a fixed portrait shape.

### 3. Publication Master validator — planned

Build a configuration-driven validator when useful against the incoming full dataset.

It should check required fields, controlled values, class-stage formatting, ISBN-13/check digit, numeric fields and duplicates, and distinguish errors from review warnings. It must not modify Supabase during validation.

The validator should make approved additions to Subject/Series/Book Type/etc. easy without rewriting the validation engine.

### 4. Review full-data taxonomy

Use the complete real dataset to confirm whether any V1 additions are needed, especially:

- new Book Types
- new Subjects
- genuine Series
- Degree/college stages
- Competitive Exam taxonomy

Do not invent speculative fields before the real data demonstrates the need.

### 5. Controlled pilot-to-production publication migration

Once the complete master passes review:

1. export/back up the 33-record pilot dataset and current pilot asset mappings;
2. intentionally clear/replace the pilot publication dataset;
3. align Supabase schema/constraints with the final approved V1 rules;
4. import the clean full Publication Master;
5. remap/import publication assets to the new publication UUIDs;
6. verify record counts and representative publications before switching catalogue reliance fully to the production dataset.

Because SKU is parked, this reset is preferred over building complex update matching around disposable pilot records. A permanent business identifier/matching strategy must be resolved before repeated production update cycles.

### 6. Complete College and University

Structure already exists. Use the full verified data to populate/test 1st PUC, 2nd PUC, Degree and other college/university publications. Keep them under the combined `College and University` top-level section for V1 unless full catalogue volume proves a split is necessary.

### 7. Complete Competitive Exams

Structure already exists. Use verified real titles to establish the actual exam taxonomy and populate/test the section. Avoid taxonomy based only on assumptions or placeholders.

### 8. Universal Browse/Search verification

The shared discovery page already serves homepage search/Browse All and related filtering. Verify it against the full production dataset and extend filters only where the real data establishes a need.

### 9. Full regression pass

Verify desktop/mobile and cross-module behaviour after the production dataset is loaded:

- navigation/back
- Browse/Search/filtering
- Book Details and image galleries
- portrait/landscape/sample pages
- selection persistence
- add/remove and quantities
- custom kits
- floating My Selection entry
- request details/review
- Supabase submission

## After full catalogue migration

### Permanent publication/SKU update strategy

Decide CPC's SKU convention and production master update/matching workflow. Do not rely on title matching for long-term repeated imports.

### Product master mapping

Populate verified operational mappings as required:

- SKU
- ISBN/reference
- Tally Item Name
- optional Tally stock item identifier
- future ERP identifier

### Staff operations

- staff request dashboard
- new-request notifications
- request statuses/workflow
- later ERP/Zoho integration as operational requirements are finalized

## Explicitly deferred

Do not introduce without a concrete requirement:

- customer login
- payment checkout
- live stock deduction
- complex CRM inside the catalogue
- duplicated search systems
- speculative Higher Education/competitive-exam fields
- arbitrary SKU generation merely to unblock catalogue migration
