# CPC Digital Catalogue — Roadmap

Last updated: 2026-08-16 18:07 IST (UTC+05:30)

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
- canonical Nursery–Class 10 catalogue model: `class` only, array-based
- removed catalogue `levels` field and legacy query compatibility
- corrected school subject/medium semantics so language subject does not imply publication medium
- updated Kit Builder, Book Details and request submission for class arrays

## Current milestone — Complete catalogue discovery

### 1. Higher Education — NEXT

- inspect actual CPC PUC/Degree data
- define minimum taxonomy from real titles only
- implement 1st PUC / 2nd PUC / Degree journeys
- reuse shared selection/details architecture

### 2. Competitive Exams

- inspect actual CPC competitive-exam titles
- define exam/category taxonomy
- implement browsing/results using shared architecture

### 3. Universal Browse + Search

One shared discovery engine for:

- top homepage search
- Browse All
- Browse All Series
- Subjects & Book Types
- filters based on complete catalogue taxonomy

### 4. Regression pass

Verify desktop/mobile and cross-module behaviour:

- navigation/back
- selection persistence
- add/remove
- quantities including max/zero behaviour
- custom kits
- Book Details
- floating My Selection entry
- request details/review
- Supabase submission

## After catalogue discovery

### Product master mapping

Populate verified:

- SKU
- ISBN
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
