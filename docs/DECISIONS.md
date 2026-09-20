# CPC Digital Catalogue — Decision Log

Record durable decisions here. Do not rewrite history when a decision changes; add a new entry explaining the superseding decision.

## 2026-09-20 22:40 IST — Publication Master V1 refined after pilot

**Decision:** refine the pilot Publication Master rules before the full CPC dataset is prepared. These decisions supersede conflicting field/value details in the earlier 15:53 pilot-freeze entry while preserving its overall lean-master principle.

- `Category` remains excluded and has been removed from the working master.
- `Language Position` is removed from V1. First/Second/Third Language may remain in the customer-facing Book Title where applicable, but is not separately maintained for current catalogue discovery.
- `Description` is added as optional customer-facing publication metadata and is already supported by Supabase/Book Details.
- `Book Title` stores the complete customer-facing publication name even when Series is stored separately.
- `Series` is optional and only for genuine CPC product families. Generic names/formats such as Workbook, Q-Bank and Internal Assessment are not Series.
- `Class/Stage` is optional and controlled. Empty means intentionally not class-specific. Multiple specific stages are allowed; Excel uses ` | ` and import tooling normalizes to an array. Current values: Nursery, LKG, UKG, 1–10, 1st PUC, 2nd PUC.
- `Subject` is optional, controlled-but-extensible and single-valued in the master. Combined/multi-subject books may leave it blank.
- `Medium` remains optional and controlled as English/Kannada; it is never inferred from Subject.
- `Book Type` is required and controlled-but-extensible. Current approved values: Textbook, Guide, Combined Guide, Question Bank, Workbook, Activity Book, Writing Book, Drawing Book, Reader, Semester Book, Assessment Book, Rhymes Book, Map Book.
- `Catalogue Section` remains required with Early Learning, School Learning, College and University, Competitive Exams. PUC and Degree/college remain combined under College and University for now because current volume does not justify separate top-level sections.
- `ISBN` canonical storage/input format is ISBN-13 digits only, no spaces/hyphens. Display formatting is separate. Future validation should verify the ISBN-13 check digit.
- `Status` values are Active, Upcoming, Inactive, Discontinued. `Upcoming` may display as `Coming Soon` to customers.
- `SKU ID` is deliberately parked; CPC will decide the convention later. Do not invent SKUs to unblock pilot/full-master preparation.

**Controlled-value policy:** current lists are V1 approved values based on the sample, not permanent closed taxonomies. The full CPC catalogue may reveal legitimate additions. Validator/import configuration should make deliberate additions easy while preventing ad-hoc spelling/case variants.

**Migration direction:** the 33 Supabase records are pilot data. Once the complete master is validated, it is acceptable to back up and replace the pilot publication dataset with one clean full-master import. Recreated UUIDs require publication asset mappings to be recreated/remapped. A permanent SKU/matching strategy becomes necessary before repeated production update cycles, not before the one-time pilot-to-production reset.

**Customer journey:** the existing Selection → Review → Submit Request flow is already implemented and Supabase-backed. Do not rebuild it as the next catalogue architecture task. Remaining catalogue completion is primarily real data/taxonomy coverage for College and University, Competitive Exams, and verification of universal Browse/Search against the broader dataset.

---

## 2026-09-20 15:53 IST — Publication Master V1 frozen for Supabase pilot

**Decision:** freeze the lean Publication Master V1 after validation against the curated CPC sample dataset and proceed to a Supabase pilot without further speculative fields.

Canonical dimensions are Catalogue Section, Series, Book Title, Class/Stage, Subject, Medium, Language Position and Book Type, plus commercial/physical/status fields documented in `DATA-MODEL.md`.

**Category is excluded from V1.** In the sample data it alternated between subject-like and book-type-like meanings. Discovery groupings should be derived from the canonical dimensions unless a future concrete requirement proves a separate Category is necessary.

**Book Type stays.** It describes the generic publication format independently of Subject and Series. Use controlled generic values such as Textbook, Reader, Workbook, Guide, Combined Guide and Question Bank; do not encode language into Book Type.

**Medium is optional.** Ordinary textbooks/readers/workbooks are not automatically classified as English medium. Use English/Kannada only where CPC genuinely distinguishes medium-specific publications, principally guides/question banks and similar products.

**Class/Stage is array-based in the database.** An empty array means intentionally not class/stage restricted within the catalogue section; do not invent an `All` stage.

**Publication identity is database-generated and immutable.** SKU is optional business data and is not the primary key. Tally/ERP mapping remains separate from public catalogue presentation.

**Migration strategy:** keep `catalogue-data.js` live while a curated Supabase pilot is imported and verified. Do not perform a big-bang replacement or move all covers to Storage at the same time.

See `SUPABASE-CATALOGUE-ARCHITECTURE.md` for the implementation blueprint.

---

## 2026-09-20 11:33 IST — Catalogue is the primary product

**Decision:** CPC Digital Catalogue is fundamentally a catalogue/discovery product. Selection, Review and Submit Request are secondary convenience features, not the system's primary purpose.

**Reason:** customers should get full value from discovering, browsing, searching and understanding CPC publications even if they never submit a request. Designing the architecture around order/request processing would distort the catalogue and create unnecessary e-commerce/ERP scope.

**Consequences:**

- Architecture priority is publication master → taxonomy → discovery/search → publication detail/content → catalogue maintenance → selection/request add-on.
- The canonical publication model must be designed around CPC publishing needs: title/series, class or academic stage, subject, medium, book type, edition, ISBN, MRP, covers, descriptions, features, samples/digital resources and status.
- Selection/request records reference catalogue publications; request-specific snapshots/workflow must not become the organizing principle for publication data.
- Staff/admin work should be catalogue-management-first. Request management can remain a smaller secondary module.
- Do not expand into sales-order processing, accounting, dispatch or ERP functionality unless explicitly required later.
- Existing request submission infrastructure remains valid and can stay largely frozen while catalogue architecture is developed.

**Next architecture task:** use verified CPC item data to design and validate the canonical Product/Publication Master schema before implementing a database migration.

---

## 2026-09-20 10:51 IST — Cover-led publication cards and direct Home escape

**Decision:** publication browsers should use a shared cover-led responsive card system rather than one full-width row per book. Desktop uses a multi-column grid; mobile uses compact horizontal cards with the cover at left and book information/actions at right.

**Reason:** full-width rows consume excessive vertical space and make a customer catalogue feel more like an administrative listing. Covers are an important discovery cue, while mobile needs fast scanning without tiny two-column cards.

**Decision:** internal catalogue browsing pages should provide both a direct `Home` route and a contextual parent/back route.

**Reason:** users should be able to leave a deep catalogue path immediately without repeatedly backing through every hierarchy level, while still retaining the contextual return route.

**Implementation:** shared publication presentation rules live in `css/publication-browser.css`. New publication browsers should reuse this system rather than create another page-specific list layout.

---

## 2026-08-16 — Git documentation is project memory

**Decision:** Git `/docs` is the persistent source for project state and architectural decisions rather than relying on chat history.

**Reason:** A significant portion of active development discussion became unavailable in chat context. Project continuity must survive conversation loss.

**Process:** meaningful development follows Inspect → Implement → Test → Verify → Document → Commit.

---

## 2026-08-16 — One `class` concept for Nursery–10

**Decision:** Remove the conceptual duplication of `level` and `class`. Use `class` only for Nursery, LKG, UKG and Classes 1–10. `class` supports arrays.

**Reason:** `level` and `class` represented the same customer-facing classification and created unnecessary compatibility code and search complexity.

**Consequence:** migrate legacy catalogue `levels` data and then remove compatibility handling.

---

## 2026-08-16 — Subject does not imply medium

**Decision:** `subject` and `medium` are independent fields.

**Reason:** Kannada can be the subject of an English-medium publication. Automatically classifying it as Kannada medium would produce incorrect catalogue/search results.

**Consequence:** medium must come from verified edition data, not from subject name.

---

## 2026-08-16 — Finish catalogue discovery before product mapping

**Decision:** after proving Supabase submission end-to-end, pause product-mapping/staff-dashboard work until Higher Education, Competitive Exams and universal discovery are complete.

**Reason:** search/browse architecture should be based on the complete catalogue taxonomy, and customers should not encounter two non-functional top-level catalogue modules.

**Order:** data model → Higher Education → Competitive Exams → universal Browse/Search → regression → product mapping → staff workflow.

---

## 2026-08-16 — Global Search and Browse All share one engine

**Decision:** do not build independent homepage-search and browse-all systems.

**Reason:** shared filters/results/cards prevent duplicated logic and future drift.

---

## 2026-08-16 — Browser-native Book Details return

**Decision:** ordinary View Book → Back navigation uses browser-native history/scroll restoration.

**Reason:** custom persisted scroll restoration caused visible jumps and stale positions after refresh/revisit.

---

## 2026-08-16 — Supabase request submission architecture

**Decision:** public catalogue submissions go through a Supabase Edge Function and trusted atomic database function. Request tables are not directly writable/readable by browser roles.

**Reason:** protects customer request data and prevents browser-supplied internal SKU/Tally values from becoming authoritative.

See `request-backend-architecture.md` for details.
