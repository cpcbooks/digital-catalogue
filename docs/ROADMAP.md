# CPC Digital Catalogue — Roadmap

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

## Current milestone — Complete catalogue discovery

### 1. Normalize catalogue schema

- audit current `catalogue-data.js`
- migrate legacy `levels` to `class`
- make `class` array-based
- verify Nursery/LKG/UKG and Classes 1–10
- audit medium values independently of subject
- remove legacy compatibility only after verification

### 2. Higher Education

- inspect actual CPC PUC/Degree data
- define minimum taxonomy
- implement 1st PUC / 2nd PUC / Degree journeys
- reuse shared selection/details architecture

### 3. Competitive Exams

- inspect actual CPC competitive-exam titles
- define exam/category taxonomy
- implement browsing/results using shared architecture

### 4. Universal Browse + Search

One shared discovery engine for:

- top homepage search
- Browse All
- Browse All Series
- Subjects & Book Types
- filters based on complete catalogue taxonomy

### 5. Regression pass

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
