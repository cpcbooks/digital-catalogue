# CPC Digital Catalogue — Decision Log

Record durable decisions here. Do not rewrite history when a decision changes; add a new entry explaining the superseding decision.

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
