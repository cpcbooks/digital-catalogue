# CPC Digital Catalogue — User Flows

> Current-state update: Custom Kit Builder → Review → Edit is implemented for Playgroup/Nursery/LKG/UKG. Cambridge Standard Kit is implemented; DEVELOPMENT/PILOT Supabase currently has an enabled temporary LKG composition with eight configured titles. Final CPC-approved compositions remain pending final Item Master reconciliation. Sharing and PDF outputs are deferred.

## Purpose and flow principles

This document defines behavioural journeys, not final screens or technical implementation. [01-product-requirements.md](01-product-requirements.md) is the product authority and [02-system-architecture.md](02-system-architecture.md) is the architecture authority.

The broad journey is:

```text
Discovery → Exploration → Optional Engagement → Optional Intent
```

- Digital Catalogue first; browsing alone is a successful session.
- There is no mandatory purchase or conversion funnel, login, or forced contact collection for browsing or public samples.
- My Selection is not a cart. Send Requirement is not Place Order.
- Custom Kit is Early Learning-specific, not catalogue-wide.
- Direct links and QR codes are first-class entry paths.
- Visitors can leave or continue browsing at natural points.
- Privacy and data minimisation apply throughout; wording must not imply e-commerce.

## 1. Entry flows — CORE / LAUNCH

Visitors may arrive through the catalogue homepage/direct visit, a search engine, WhatsApp or another shared link, a QR code, a direct publication link, or a direct series/category link where supported.

```mermaid
flowchart LR
  E[Homepage / search / shared link / QR] --> T{Target available?}
  T -->|Catalogue or series/category| D[Relevant discovery context]
  T -->|Publication| P[Publication details]
  T -->|Custom Kit link| K[Inspectable Custom Kit]
  T -->|Invalid or unavailable| F[Graceful recovery / relevant catalogue path]
  D --> P
  P --> D
```

A direct publication, series/category, or kit visitor must not be forced through the homepage or category hierarchy. Direct links should retain useful context and permit normal catalogue exploration.

## 2. Browse and discovery — CORE / LAUNCH

Visitors may browse relevant classifications, search, apply one or more appropriate filters, change or clear filters, use pagination/load-more behaviour where needed, recover from no results, open details, and continue exploration. Discovery dimensions may include series, class/stage, subject, medium/language, book type, board/curriculum, title, ISBN, and justified catalogue classifications. Exact controls are a UI decision.

```mermaid
flowchart LR
  B[Catalogue / category / series] --> S[Browse, search, or filter]
  S --> R{Relevant results?}
  R -->|Yes| L[Publication listing] --> P[Publication details]
  R -->|No| N[Explain no result and offer clear/change filters or browse alternatives]
  P --> S
  L --> C[Continue exploration]
```

No-result recovery should retain the visitor's agency and avoid forced contact collection.

## 3. Publication exploration — CORE / LAUNCH

Publication details support inspecting catalogue information and available assets, viewing ordered sample pages in the unified gallery where available, adding to My Selection, and continuing browsing. Publication sharing and related/same-series recommendations are deferred.

```mermaid
flowchart TD
  P[Publication details] --> I[Inspect information and assets]
  I --> SA{Public sample available?}
  SA -->|Yes| V[Browse sample pages in Book Details gallery] --> P
  SA -->|No| P
  P --> SH[Continue catalogue exploration]
  P --> MS[Add to My Selection]
  P --> EL{Eligible Early Learning publication?}
  EL -->|Yes| CK[Use in Custom Kit]
  EL -->|No| P
```

No broken sample action is shown when no public sample exists. Samples return visitors to the relevant publication/catalogue context. Public sample viewing requires no login or contact information; permitted downloading is a separate CPC decision.

## 4. My Selection and Send Requirement — CORE / LAUNCH

```mermaid
flowchart TD
  A[Add publication] --> B[Continue browsing or open My Selection]
  B --> R[Review Selection]
  R --> Q[Change quantity]
  R --> X[Remove publication]
  R --> C[Continue browsing]
  R --> SR[Choose Send Requirement]
  SR --> D[Provide only necessary contact/institution information]
  D --> V[Review requirement]
  V --> S[Submit]
  S --> OK[Success and unique CPC reference]
```

Adding a title does not collect contact details. Selection may initially persist locally on the visitor's device, subject to later privacy/technical design. Send Requirement is optional and never changes Selection into checkout.

Requirement behaviour:

- necessary contact/institution information only;
- review before submission;
- unique CPC reference after success, usable when contacting CPC;
- no payment, checkout, discounts, stock reservation, or commercial/order processing;
- on failure, preserve or recover work where reasonably possible;
- server-side validation is required conceptually, with details deferred to security/technical design.

## 5. Early Learning Custom Kit — CORE / LAUNCH

Custom Kit is a first-class Early Learning USP. It applies only to CPC-eligible Playgroup, Nursery, LKG, and UKG publications/configurations. Eligibility is conceptually data-driven/configurable; it must not be permanently hard-coded merely from a displayed stage name. Other classes and catalogue sections do not automatically receive Custom Kit functionality.

```mermaid
flowchart TD
  EL[Enter Early Learning] --> ST[Choose Playgroup / Nursery / LKG / UKG]
  ST --> CK[Create Custom Kit]
  CK --> SE[Select eligible titles]
  SE --> RK[Review Kit]
  RK --> AD[Add eligible title]
  RK --> RM[Remove title]
  RK --> N[Optional Kit Name]
  AD --> RK
  RM --> RK
  N --> READY[Complete / Ready Kit]
  READY --> EDIT[Edit Kit]
  READY --> SR[Send Requirement]
```

A normal temporary Kit requires no account. Durable cross-browser-session Kit persistence, Kit sharing, and Kit downloads/PDF are deferred/post-launch.

Cambridge Standard Kit is a separate CPC-controlled, fixed-composition flow. DEVELOPMENT/PILOT Supabase currently provides an enabled temporary LKG Kit with eight configured titles; it is not a final CPC-approved composition or a production-readiness claim. Final Standard Kit compositions remain pending final Item Master reconciliation.

## 6. Requirement tracking — PLANNED

Lightweight tracking may allow a visitor to use a reference to see limited, safe status information such as **Received**, **Under Review**, **Contacted**, or **Closed**. It must not expose another customer's requirement and must not use order-language such as Processing Order, Packed, Dispatched, or Delivered. Verification and access controls belong in Security Design.

## 7. Deferred sharing and summaries

Publication Share/Copy Link, Custom Kit sharing, and Kit summary/PDF output are deferred/post-launch. Direct URLs continue to support normal catalogue entry and navigation without creating a Requirement. Series/category sharing and general My Selection sharing are also **FUTURE / OPTIONAL**.

## 8. Returning visitor — CORE local continuity / FUTURE optional enhancements

Without an account, a returning visitor may retain an existing local My Selection and in-progress Early Learning Custom Kit where privacy/technical design permits. This is continuity, not behavioural profiling. Recently Viewed is **FUTURE / OPTIONAL** unless separately retained and approved.

## 9. Admin flows — PLANNED

```mermaid
flowchart TD
  S[CPC staff] --> A[Secure authentication]
  A --> C[Admin Console]
  C --> P[Publications]
  C --> T[Taxonomy]
  C --> AS[Assets / Samples]
  C --> R[Requirements]
  C --> AN[Aggregate analytics]
  P --> E[Create / edit catalogue information]
  E --> M[Manage assets and Early Learning Kit eligibility]
  M --> PRE[Preview]
  PRE --> PUB[Publish]
```

The planned Admin Console supports creation/editing, preview-before-publish, inactivation/archival, adding/replacing samples, managing Early Learning Custom Kit eligibility, reviewing requirements, and aggregate privacy-conscious analytics. Detailed roles and permissions are deferred to Security/Admin design.

## 10. Analytics touchpoints — PLANNED

Analytics is deferred/post-launch. Any later aggregate measurement must avoid contact data and must not block catalogue use.

## 11. Error and recovery flows — CORE / LAUNCH

| Situation | Behavioural expectation |
| --- | --- |
| No search results | Explain the result and let the visitor change/clear filters or continue browsing. |
| Missing cover or optional asset | Preserve publication access with a truthful fallback. |
| Unavailable sample | Do not offer a broken action; keep publication browsing available. |
| Inactive publication or invalid direct link | Explain gracefully and offer a relevant catalogue route. |
| Network or requirement-submission failure | Catalogue remains usable; preserve/recover work where reasonably possible. |
| Analytics failure | Never block the visitor. |
| Stale local Selection/Kit with inactive publication | Surface the change, preserve unaffected work where appropriate, and allow review/edit. |

## 12. Flow priority matrix

| Flow | Priority |
| --- | --- |
| Catalogue entry, browse, search/filter, publication details, direct/QR entry, responsive/mobile flow, and graceful empty/error states | **CORE / LAUNCH** |
| Public sample viewing in the unified gallery; My Selection; Early Learning Custom Kit; Cambridge Standard Kit foundation; Send Requirement | **CORE / LAUNCH** |
| Publication sharing; Custom Kit sharing and kit-summary download | **DEFERRED / POST-LAUNCH** |
| Admin Console; aggregate analytics dashboard; lightweight requirement tracking; richer related-publication behaviour | **PLANNED** |
| Favourites; shareable general My Selection; privacy-conscious richer personalisation; ERP/order-portal handoff; customer accounts | **FUTURE / OPTIONAL** |

## 13. User-flow non-goals

These flows explicitly exclude checkout, payment, online ordering, shipping, inventory reservation, invoicing, dealer pricing, school discount calculation, forced registration, forced lead forms before catalogue/sample viewing, and behavioural surveillance.

## 14. Open UX questions

- What is the clearest builder presentation for an Early Learning Custom Kit on mobile and desktop?
- Where should My Selection and gallery actions appear in publication details?
- How should combined filters behave on mobile?
- What visual treatment best communicates unavailable optional assets without suggesting an error in the publication itself?

## Document status

Status: Initial approved user-flow baseline
Date: 2026-09-29

Product authority: [docs/01-product-requirements.md](01-product-requirements.md)

Architecture authority: [docs/02-system-architecture.md](02-system-architecture.md)

This document defines behavioural journeys and does not define final UI appearance or technical implementation.
