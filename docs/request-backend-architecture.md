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

Supabase/Postgres will store submitted requests. The current production catalogue has 427 Supabase publications. The request backend is already deployed and must remain independent of any legacy/static catalogue compatibility path.

## Core principles

### 1. Submitted requests are immutable business snapshots

A historical request must continue to show what the customer actually submitted even if a title, SKU, MRP, class mapping, or kit definition changes later.

Therefore request items store snapshot fields from the submitted selection. They may also store the permanent catalogue `id` where available, but historical display must not rely solely on a live catalogue join.

### 2. Individual books and custom kits are both first-class request items

A request can contain:

- individual catalogue titles
- Standard Early Learning kits
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

## Current database model (implemented; field names below are authoritative at high level)

### `requests`

One row per submitted customer request. Implemented columns include:

- `id uuid primary key`
- `reference text` (customer-facing CPC reference)
- `status text not null default 'new'`
- `customer_type text not null`
- `customer_name text`
- `customer_organisation text`
- `customer_phone text`
- `whatsapp_phone text`
- `customer_place text`
- `district text null`
- `state text null`
- `pincode text null`
- `email text null`
- `existing_customer text null`
- `preferred_contact text not null`
- `notes text null`
- `item_count integer`
- `total_quantity integer not null`
- `idempotency_key uuid` (replay protection)
- `created_at timestamptz not null default now()`

V1 status values should remain simple, for example:

- `new`
- `reviewing`
- `contacted`
- `closed`
- `cancelled`

Do not build a full ERP/order-status workflow into this catalogue table yet.

### `request_items`

One row for every top-level selection in a request. Implemented columns include:

- `id uuid primary key`
- `request_id uuid not null references requests(id) on delete cascade`
- `position integer`
- `item_type text` — book, Standard Kit or Custom Kit
- `product_id text` — catalogue reference where applicable
- `title text` and `snapshot jsonb`
- `sku text`
- `isbn text`
- `series text`
- `class_code text`
- `subject text`
- `medium text`
- `quantity integer not null`
- `kit_books jsonb` (compatibility snapshot)
- `created_at timestamptz not null default now()`

Constraints should enforce quantity `1..10000`, valid item type, unique `(request_id, line_no)`, and sensible kit/non-kit combinations.

### Kit component storage

Current custom-kit selections already store the selected catalogue books as an array inside the kit object. For request history, those component titles are a snapshot of one top-level requested kit rather than independently priced/requested lines.

The production schema **already includes normalized `request_kit_components`** linked to `request_items` with `ON DELETE CASCADE`, alongside JSON snapshots for compatibility/history. Do not revert to a JSON-only model. Preserve original submitted kit compositions and quantities.

## Reference numbers

Customers should receive a short human-readable request reference after successful submission.

Recommended format:

`CPC-YYYYMMDD-XXXXXX`

The database UUID remains the true technical identity. `requests.reference` is the customer/business reference and must be unique.

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

The deployed endpoint performs server-side validation and rate limiting; frontend `Retry-After` messaging is implemented. Do not reintroduce CAPTCHA or other dependencies without an approved security change.

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

Those can be designed later around actual operational requirements.

## Current maintenance direction

Submission implementation and functional testing are complete. Preserve existing validation, idempotency, atomic writes, rate-limit protections, privacy boundaries and retry-safe local state. Do not reimplement the backend as a launch task. Any future security or schema changes require separate impact review and testing.

## 2026-11-02 — Production acceptance addendum

The anonymous request workflow is deployed and functionally accepted. PR #34's friendly network error and `Retry-After` frontend handling are live. Production integration verified a successful submission, same-key replay returning the same reference without another row, and invalid payload rejection without a write. Mocked production-page checks verified 429 messaging, network recovery, duplicate-click protection and preservation of Standard/Custom Kits. **An actual production HTTP 429 was not triggered.** Production Edge Function `submit-catalogue-request` v10 was active at last verification.

A focused permission check found `private.catalogue_request_attempts` has RLS disabled but neither `anon` nor `authenticated` has schema/table access; both submission RPCs deny those roles EXECUTE. This is not a blanket security certification. Following explicit confirmation that all requests were test data, seven requests, 22 items, 29 kit components and three rate-limit attempts were cleared; all four tables were verified empty, while 427 publications remained.
