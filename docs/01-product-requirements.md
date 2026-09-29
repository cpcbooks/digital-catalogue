# CPC Digital Catalogue — Product Requirements

## 1. Product Definition

CPC Digital Catalogue is a digital-first catalogue and publication discovery platform for Cambridge Publishing Company Pvt. Ltd.

Its primary purpose is to present CPC's publications in an attractive, structured, searchable, informative and easily shareable digital format.

It is the digital equivalent and evolution of a traditional publication catalogue.

The catalogue must help visitors:

- discover CPC publications;
- browse the catalogue naturally;
- search and filter publications;
- understand individual publications and series;
- view publication covers and relevant information;
- view sample pages where CPC has made samples available;
- explore publications by relevant classifications;
- share useful catalogue content.

The product must remain useful as a catalogue in its own right.

## 2. Explicit Product Boundary

The CPC Digital Catalogue is NOT an online ordering or e-commerce portal.

The following concepts must not be used to redefine the catalogue:

- shopping cart;
- checkout;
- online payment;
- place order;
- shipping;
- inventory reservation;
- customer-specific pricing;
- dealer pricing;
- school discounts;
- credit terms;
- invoicing;
- order fulfilment;
- sales-agent commission.

MRP is catalogue information and may be displayed publicly.

Commercial pricing, discounts and order processing are outside the current Digital Catalogue product.

## 3. Supplementary / Value-Added Features

The catalogue includes supplementary engagement features.

These features enhance the catalogue but do not define its primary purpose.

### 3.1 My Selection

Visitors may:

- add publications to My Selection;
- remove publications;
- change required quantities;
- continue browsing while retaining the selection;
- review selected publications.

"My Selection" must not be presented as a shopping cart.

### 3.2 Custom Kit

Custom Kit is a first-class feature and one of the Digital Catalogue's USPs, scoped to Early Learning.

It currently applies only to eligible Playgroup, Nursery, LKG and UKG publications/configurations. Eligibility must remain data-driven/configurable rather than being permanently inferred from the displayed class/stage name. Other catalogue sections continue to support normal catalogue features, My Selection and Send Requirement where applicable, but do not automatically receive Custom Kit functionality unless CPC changes this business rule.

Visitors must be able to create a custom set/kit using eligible Early Learning publications.

The product should support a clear and convenient Custom Kit experience.

A completed Custom Kit may be reviewed/edited, optionally named, shared through a kit link, downloaded as a kit summary, or sent as a requirement. Sharing or downloading must not require requirement submission. The exact summary output format belongs in later UI/Technical Design.

### 3.3 Send Requirement

Visitors may submit their selected publications/custom kit and contact information to CPC as a requirement.

This is NOT an order.

A successful submission must generate a unique CPC requirement/reference number.

Customers may quote this reference when contacting CPC.

The product may provide lightweight requirement-status tracking, but this must not turn the Digital Catalogue into an order-management portal.

## 4. Target Users

The public catalogue should serve users including:

- schools;
- teachers;
- educational institutions;
- dealers;
- distributors;
- bookshops;
- students;
- parents;
- prospective customers;
- other visitors interested in CPC publications.

Browsing the public catalogue must not require an account.

## 5. Catalogue Coverage

The catalogue must support educational stages beginning with:

- Playgroup;
- Nursery;
- LKG;
- UKG;
- Class 1 onward.

The data model/product structure must not assume that all publications belong only to school classes.

It must remain capable of representing CPC's broader catalogue, including higher classes, PUC and other publication categories where required.

## 6. Catalogue Discovery

Visitors should be able to discover publications through appropriate attributes, including where applicable:

- series;
- class/stage;
- subject;
- medium/language;
- book type;
- board/curriculum;
- title;
- ISBN;
- other useful catalogue classifications.

The catalogue must provide search and filtering.

Adding a new publication, series, class/stage, subject, medium or similar catalogue content should normally be a catalogue-data operation rather than requiring source-code changes.

## 7. Publication Information

The catalogue should be capable of representing publication information such as:

- cover;
- title;
- series;
- class/stage;
- subject;
- medium/language;
- board/curriculum;
- book type;
- edition/academic year;
- ISBN;
- SKU;
- MRP;
- description;
- key features;
- sample content;
- additional publication assets;
- publication status.

Not every field must necessarily be displayed in every UI context.

Internal identifiers must not be exposed merely because they exist.

## 8. Sample Content

Where CPC has provided sample pages/content for a publication, visitors should be able to view that sample through the catalogue.

Publications without sample content must continue to function normally.

The absence of sample content must not result in broken or misleading actions.

## 9. Publication and Edition Lifecycle

The product must support catalogue lifecycle states so publications can be added, revised, unpublished/inactivated or archived without destroying historical references.

Edition/academic-year changes must be handled deliberately.

A new edition must not require historical requirements to be rewritten as though they referred to the new edition.

Historical integrity must be preserved.

## 10. Catalogue Assets

The product should be capable of associating multiple assets with a publication, including where applicable:

- front cover;
- back cover;
- additional images;
- sample pages;
- sample PDF/document;
- future digital resources.

The product must not assume that every publication has every asset type.

## 11. Sharing and Direct Access

Individual publications should support stable/direct catalogue access.

The product should support sharing publication links through channels such as WhatsApp and other standard sharing mechanisms.

Shared links should provide useful publication context.

Where practical, publication pages should support useful social/link previews containing appropriate catalogue information and imagery.

The catalogue should remain suitable for use with permanent QR-code destinations.

## 12. Search Quality

Search should support the normal ways users identify CPC publications.

Search should account for relevant fields such as title, series, class, subject, medium/language and ISBN where appropriate.

The product should handle no-result searches gracefully.

Anonymous aggregate no-result search information may be used to improve catalogue discoverability and understand unmet search needs.

## 13. Catalogue Analytics & Insights

The Digital Catalogue should support privacy-conscious analytics that help CPC understand and improve catalogue usage.

Useful aggregate events/metrics may include:

- catalogue visits;
- publication views;
- series/category views;
- searches;
- no-result searches;
- filter usage;
- sample views;
- sample opens/downloads where applicable;
- Add to Selection;
- Remove from Selection;
- Custom Kit started;
- Custom Kit completed;
- requirement started;
- requirement submitted;
- publication sharing;
- contact/call/WhatsApp actions;
- appropriate traffic/campaign source information.

Analytics should help CPC understand three broad stages:

### Discovery

Are visitors finding relevant publications?

### Engagement

Are visitors viewing samples, sharing publications, creating selections or using Custom Kit?

### Intent

Are visitors submitting requirements or deliberately contacting CPC?

Analytics must not turn the catalogue into a user-surveillance system.

## 14. Privacy by Design

The Digital Catalogue must follow a data-minimisation and privacy-by-design approach.

It should collect only information reasonably required to:

- operate the catalogue;
- secure the service;
- improve catalogue usability and content;
- provide a feature deliberately initiated by the visitor;
- respond to a submitted requirement;
- satisfy applicable legal/compliance obligations.

The product must not be designed for:

- individual surveillance;
- unnecessary behavioural profiling;
- sale of visitor data;
- unnecessary cross-site tracking;
- collection of personal information merely because it is technically possible.

General catalogue analytics should be anonymous/aggregate wherever reasonably possible.

Personally identifiable information should primarily be collected when there is a genuine operational need, such as when a visitor deliberately submits a requirement.

The product must provide appropriate notice regarding personal data collection and purpose where required.

Personal and analytics data must not be retained indefinitely without a defined operational/legal purpose.

Detailed privacy, retention, consent and security controls will be defined in the Security Design and relevant operational documentation and must comply with applicable Indian requirements at implementation and release time.

## 15. Operational Analytics

Operational/security telemetry should be distinguished from catalogue engagement analytics.

The system may collect the minimum operational information required for:

- error diagnosis;
- service reliability;
- performance monitoring;
- security monitoring;
- abuse/rate-limit detection.

Operational logging must avoid unnecessary exposure of personal data or secrets.

## 16. Admin / Catalogue Management

During development and pre-launch, catalogue information may be managed through controlled development/administrative methods such as Supabase, reviewed imports/spreadsheets, or development tooling.

The completed/live product should eventually provide CPC with a secure Admin Console appropriate for routine catalogue management.

The Admin Console should support, subject to later detailed requirements:

- adding publications;
- editing publication information;
- publishing/unpublishing/inactivating publications;
- managing catalogue classifications;
- managing covers/assets;
- managing sample content;
- managing editions;
- reviewing catalogue requirements;
- viewing appropriate aggregate catalogue analytics.

The Admin Console must not be exposed publicly and must undergo proper authentication, authorization, security and testing before production use.

## 17. Responsive Experience

The catalogue must work effectively across:

- mobile phones;
- tablets;
- desktop/laptop browsers.

Mobile use is a first-class requirement.

The experience should account for visitors arriving from WhatsApp, QR codes, email, social media, search engines and direct links.

## 18. Performance

The catalogue should remain responsive as the publication collection grows.

The product should avoid unnecessary loading of full-resolution covers, sample PDFs or other heavy assets before the visitor needs them.

Large catalogue growth should not inherently require redesigning the user experience or hard-coding publications.

## 19. Accessibility

The catalogue should provide reasonable web accessibility, including where applicable:

- semantic content structure;
- keyboard accessibility;
- readable contrast;
- meaningful labels;
- appropriate image alternative text;
- usable form interactions.

Accessibility should be considered during design and implementation, not only after release.

## 20. Failure and Empty States

The product must handle expected states gracefully, including:

- no search results;
- missing cover;
- unavailable sample;
- inactive/unpublished publication;
- temporary network failure;
- failed requirement submission;
- empty selection;
- unavailable optional content.

A missing optional asset must not break the publication experience.

## 21. Future Interoperability

Future ERP or ordering capabilities are NOT a current core product requirement.

However, the Digital Catalogue should avoid unnecessary architectural decisions that would prevent future CPC systems from reusing catalogue data and functionality.

The catalogue should remain capable of coexisting with or integrating with future systems such as:

- ERP;
- Tally/financial systems;
- inventory systems;
- customer/order portals;
- other CPC digital products.

Future possibilities may include either:

A. extending selected catalogue capabilities; or

B. retaining the Digital Catalogue as a standalone catalogue while a separate ERP-integrated ordering portal reuses relevant publication data and concepts.

No decision between these future approaches is required now.

The current product must not implement speculative ERP/order complexity solely for possible future use.

## 22. Stable Publication Identity

Publication identity must be separable from changeable display and operational information.

A publication may have identifiers such as:

- internal stable identity;
- SKU;
- ISBN;
- Tally identifier;
- future ERP identifier.

Changing a title, cover, MRP, edition-related information or other catalogue information must not inherently require replacing the stable internal identity unless the business meaning genuinely represents a different publication/edition.

Detailed identity and edition rules will be finalized in the Data Model and Technical Design.

## 23. Dynamic Catalogue Content

Catalogue content must be maintainable independently from application source code.

Examples of normal catalogue operations include:

- adding books;
- editing titles/descriptions;
- replacing covers;
- adding/removing sample pages;
- changing MRP;
- changing catalogue classifications;
- publishing/inactivating publications;
- adding new series;
- adding new subjects;
- adding new editions.

These operations should not normally require application code changes.

## 24. Explicitly Out of Current Scope

Unless separately approved in the future, the Digital Catalogue does not provide:

- online checkout;
- online payment;
- customer-specific commercial pricing;
- dealer/school discount calculation;
- credit management;
- inventory reservation;
- invoice generation;
- dispatch management;
- shipping tracking;
- ERP sales-order creation;
- sales-agent commission calculation.

These exclusions must not prevent sensible future interoperability.

## 25. Product Success

Success should primarily be evaluated by whether the catalogue:

- makes CPC's publications easy to discover;
- presents publications clearly and attractively;
- helps users find relevant books;
- provides useful publication/sample information;
- makes catalogue sharing easier;
- encourages meaningful engagement;
- makes Custom Kit useful and convenient;
- allows interested users to communicate requirements easily;
- provides CPC with privacy-conscious insights for improving the catalogue.

Sales/order metrics are not the primary product-success definition for the Digital Catalogue.

## 26. Product Principles

When future product decisions are ambiguous, use these principles:

1. Catalogue first.
2. Discovery before transaction.
3. Clear publication information.
4. Simple browsing without mandatory login.
5. Custom Kit as a differentiated catalogue feature.
6. Selection and Requirement as supplementary features.
7. Catalogue content should be data-driven.
8. Privacy and data minimisation by design.
9. Mobile-first practical usability.
10. Preserve historical integrity.
11. Avoid unnecessary complexity.
12. Remain interoperable without prematurely building future systems.
13. Keep the catalogue useful as a catalogue even if CPC later builds separate ordering/ERP systems.

## Document Status

Status: Initial approved product baseline
Date: 2026-09-29

This document defines the intended product direction. Existing implementation behavior does not override this document where the two conflict. Any future material change to product scope should update this document and be recorded in the project decision log.
