# Cambridge Digital Catalogue — Request Backend Architecture (V1)

This document records the backend decisions for the catalogue request flow so they remain recoverable independently of chat history.

## Current frontend flow

The implemented customer journey is:

1. Browse catalogue
2. Add individual books and/or custom kits to `cambridgeOrder`
3. Review quantities in `order.html`
4. Enter customer/contact details in `request.html`
5. Review the complete request in `review-request.html`
6. Submit the request to the backend

The final submission step is the backend boundary. The frontend must continue to describe this as an **order request**, not a confirmed order.

## Backend platform

Supabase project: **CPC Digital Catalogue**.

Supabase/Postgres will store submitted requests. The catalogue may continue using its current static product source while verified master data is incomplete; backend request storage must not depend on moving the full catalogue master to Supabase immediately.

## Core principles

### 1. Submitted requests are immutable business snapshots

A historical request must continue to show what the customer actually submitted even if a title, SKU, MRP, class mapping, or kit definition changes later.

Therefore request items store snapshot fields from the submitted selection. They may also store the permanent catalogue `id` where available, but historical display must not rely solely on a live catalogue join.

### 2. Individual books and custom kits are both first-class request items

A request can contain:

- individual catalogue titles
- custom Early Learning kits

A custom kit has its own requested quantity and a snapshot of the books contained in that kit.

### 3. No customer login is required for V1

The catalogue request form is intentionally public. Customer identity is supplied through the request form rather than Supabase Auth.

### 4. Submitted customer/request data must not be publicly readable

The browser must never receive a secret/service-role key.

Public users must not have SELECT, UPDATE, or DELETE access to submitted requests through the Data API.

### 5. Server-side submission is preferred over direct anonymous table inserts

The final `Send Request` action should call one controlled submission endpoint (Supabase Edge Function or equivalent server-side function) that:

- validates customer details again server-side
- validates every selected item and quantity
- limits payload sizes
- generates the request reference
- writes the request and all request items in one transaction/atomic operation
- returns only the safe success response/reference to the browser

This avoids exposing writable request tables directly to arbitrary browser operations and leaves a clean place for future anti-spam/rate-limit/CAPTCHA controls.

## Proposed database model

### `requests`

One row per submitted customer request.

Recommended fields:

- `id uuid primary key`
- `reference_no text unique not null`
- `status text not null default 'new'`
- `customer_type text not null`
- `contact_name text not null`
- `organisation_name text null`
- `mobile text not null`
- `whatsapp text null`
- `city text not null`
- `district text null`
- `state text null`
- `pincode text null`
- `email text null`
- `existing_customer text null`
- `preferred_contact text not null`
- `notes text null`
- `selection_count integer not null`
- `total_quantity integer not null`
- `source text not null default 'digital-catalogue'`
- `created_at timestamptz not null default now()`

V1 status values should remain simple, for example:

- `new`
- `reviewing`
- `contacted`
- `closed`
- `cancelled`

Do not build a full ERP/order-status workflow into this catalogue table yet.

### `request_items`

One row for every top-level selection in a request.

Recommended fields:

- `id uuid primary key`
- `request_id uuid not null references requests(id) on delete cascade`
- `line_no integer not null`
- `item_type text not null` — `book` or `custom-kit`
- `catalogue_id text null` — permanent catalogue ID where applicable
- `title_snapshot text not null`
- `sku_snapshot text null`
- `isbn_snapshot text null`
- `series_snapshot text null`
- `class_snapshot text null`
- `level_snapshot text null`
- `subject_snapshot text null`
- `medium_snapshot text null`
- `quantity integer not null`
- `kit_book_count integer null`
- `kit_books_snapshot jsonb null`
- `created_at timestamptz not null default now()`

Constraints should enforce quantity `1..10000`, valid item type, unique `(request_id, line_no)`, and sensible kit/non-kit combinations.

### Why kit contents are JSON in V1

Current custom-kit selections already store the selected catalogue books as an array inside the kit object. For request history, those component titles are a snapshot of one top-level requested kit rather than independently priced/requested lines.

Keeping the kit component snapshot as `jsonb` in V1:

- preserves the exact submitted kit
- avoids unnecessary third-table complexity before operational requirements demand component-level reporting
- can later be migrated to a normalized `request_kit_items` table if stock/ERP workflows need component-level querying

## Reference numbers

Customers should receive a short human-readable request reference after successful submission.

Recommended format:

`CPC-YYYYMMDD-XXXXXX`

The database UUID remains the true technical identity. `reference_no` is the customer/business reference and must be unique.

Reference generation must happen server-side/database-side, never be trusted from the browser.

## Validation rules

Server-side validation must repeat the important browser rules. Browser validation is UX only and is not a security boundary.

At minimum:

- request must contain at least one selection
- quantity must be an integer from 1 to 10,000
- customer type must be from the supported set
- contact name and city/place required
- Indian mobile number must match current frontend rule
- organisation name required for school/dealer/other
- alternate WhatsApp validated if supplied
- email validated when supplied/required by preferred contact
- notes and text fields must have maximum lengths
- cap the number of top-level selections
- cap custom-kit component count and total request payload size

The backend should reject malformed/oversized requests instead of silently correcting them.

## Security model

### Database

- Enable RLS on request tables in the exposed `public` schema.
- Revoke direct `anon` and `authenticated` table privileges unless a specific future use requires them.
- No public SELECT policy for customer/request data.
- No browser secret/service-role key.

### Submission endpoint

The public website calls only the controlled submission endpoint.

For V1 the endpoint must perform its own validation and should be designed so rate limiting / CAPTCHA / abuse prevention can be added without redesigning the database.

Any elevated database credential used by the endpoint stays server-side only.

## Atomic submission

A request header without its lines, or lines without their request header, must never be stored.

Implementation should therefore use a single database function/transaction to:

1. validate/generate the reference
2. insert `requests`
3. insert all `request_items`
4. commit together

If any step fails, nothing is committed.

## Frontend success behaviour

After successful submission:

1. show a dedicated success state/page
2. display the request reference prominently
3. explain that Cambridge will review and confirm pricing, availability and next steps
4. only after confirmed backend success, clear the submitted local request draft/selection
5. do **not** clear local data before the backend confirms success

On network/backend error, keep all customer details and selections so the user can retry safely.

## What is intentionally deferred

Do not add these merely because Supabase is now available:

- customer accounts/login
- payment/checkout
- confirmed sales orders
- live stock deduction
- ERP/Tally synchronization
- staff CRM workflow
- complex request status history
- complete catalogue master migration

Those can be designed later around actual operational requirements.

## Next implementation sequence

1. Create `requests` and `request_items` schema with constraints, grants and RLS.
2. Create the atomic database submission function.
3. Create the public submission Edge Function with server-side validation.
4. Connect `review-request.html` `Send Request` to that endpoint.
5. Add a submission success page/state with reference number.
6. Test normal books, custom kits, mixed selections, validation failures, duplicate/retry behaviour and network failure.
7. Run Supabase Security Advisor and Performance Advisor after the schema/function changes.
