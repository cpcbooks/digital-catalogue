# Graph Report - digital-catalogue  (2026-10-06)

## Corpus Check
- 88 files · ~213,065 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .css 3, .toml 1)

## Summary
- 359 nodes · 607 edges · 30 communities (19 shown, 11 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 97 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d36c155f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- standard-kit-public-read-migration.test.cjs
- catalogue-selection.js
- import-publications.mjs
- request-submission.js
- catalogue-supabase-adapter.js
- create
- book-details.js
- index.ts
- createBrowserSandbox
- upload-publication-assets.mjs
- catalogue-query.js
- CPC Digital Catalogue
- init
- catalogue-navigation.js
- 20261005000000_harden_requirement_submission.sql
- catalogue-validator.js
- early-learning-kit-config.js
- catalogue-bootstrap.js
- standard-kit-config.js
- public.submit_catalogue_request
- public.submit_catalogue_request
- catalogue-data.js
- standard-kit.js
- imports

## God Nodes (most connected - your core abstractions)
1. `createBrowserSandbox()` - 26 edges
2. `loadBrowserScript()` - 25 edges
3. `create()` - 13 edges
4. `init()` - 11 edges
5. `text()` - 10 edges
6. `actionNode()` - 9 edges
7. `setQty()` - 9 edges
8. `updateFloatingBar()` - 9 edges
9. `init()` - 8 edges
10. `toLegacyBook()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `classArray()` --indirect_call--> `text()`  [INFERRED]
  js/request-submission.js → js/catalogue-supabase-adapter.js
- `adapter()` --calls--> `createBrowserSandbox()`  [EXTRACTED]
  tests/catalogue-supabase-adapter.test.cjs → tests/helpers/browser-script-sandbox.cjs
- `adapter()` --calls--> `loadBrowserScript()`  [EXTRACTED]
  tests/catalogue-supabase-adapter.test.cjs → tests/helpers/browser-script-sandbox.cjs
- `selectionWithStorage()` --calls--> `createBrowserSandbox()`  [EXTRACTED]
  tests/catalogue-selection.test.cjs → tests/helpers/browser-script-sandbox.cjs
- `selectionWithStorage()` --calls--> `createStorage()`  [EXTRACTED]
  tests/catalogue-selection.test.cjs → tests/helpers/browser-script-sandbox.cjs

## Import Cycles
- None detected.

## Communities (30 total, 11 thin omitted)

### Community 0 - "standard-kit-public-read-migration.test.cjs"
Cohesion: 0.05
Nodes (33): assert, fs, importerPromise, manifestPath, path, { pathToFileURL }, test, assert (+25 more)

### Community 1 - "catalogue-selection.js"
Cohesion: 0.17
Nodes (28): actionNode(), add(), currentRelativeUrl(), detailsUrl(), emitChange(), ensureFloatingBar(), ensureFloatingStyle(), indexOfBook() (+20 more)

### Community 2 - "import-publications.mjs"
Cohesion: 0.14
Nodes (16): BOOK_TYPES, comparable(), EARLY_STAGES, equal(), execute(), issue(), LIFECYCLES, MEDIA (+8 more)

### Community 3 - "request-submission.js"
Cohesion: 0.22
Nodes (15): attemptKey(), backendClass(), bookLine(), buildBackendPayload(), buildPayload(), catalogueProducts(), classArray(), customerPayload() (+7 more)

### Community 4 - "catalogue-supabase-adapter.js"
Cohesion: 0.33
Nodes (15): activeAssets(), categoryFor(), classArray(), compareWithStatic(), firstAsset(), installPilot(), legacyImages(), legacyType() (+7 more)

### Community 5 - "create"
Cohesion: 0.20
Nodes (10): configuredMinimum(), create(), add(), canReview(), contains(), count(), isComplete(), remaining() (+2 more)

### Community 6 - "book-details.js"
Cohesion: 0.34
Nodes (13): backLabel(), block(), classTag(), detailEarlyClass(), gallery(), imageList(), init(), refresh() (+5 more)

### Community 7 - "index.ts"
Cohesion: 0.21
Nodes (10): contacts, corsHeaders, customerTypes, existingCustomers, keys(), object(), optionalText(), text() (+2 more)

### Community 8 - "createBrowserSandbox"
Cohesion: 0.05
Nodes (60): assert, bootstrap(), { createBrowserSandbox, loadBrowserScript }, test, assert, { createBrowserSandbox, loadBrowserScript }, navigation(), test (+52 more)

### Community 9 - "upload-publication-assets.mjs"
Cohesion: 0.26
Nodes (11): allowedTypes, assertPublication(), EXT, headers(), jsonRequest(), manifest, manifestText, MIME (+3 more)

### Community 10 - "catalogue-query.js"
Cohesion: 0.28
Nodes (9): active(), browseMatches(), browseValues(), byCategory(), byCategoryAndClass(), byId(), classValues(), matchesClass() (+1 more)

### Community 11 - "CPC Digital Catalogue"
Cohesion: 0.29
Nodes (6): Architecture and data, CPC Digital Catalogue, Development, Early Learning / Custom Kit, graphify, Product

### Community 13 - "init"
Cohesion: 0.39
Nodes (7): init(), clear(), currentBrowseUrl(), hasActive(), render(), renderActive(), syncUrl()

### Community 14 - "catalogue-navigation.js"
Cohesion: 0.42
Nodes (7): captureBookLink(), captureBookLinks(), pageKey(), read(), restore(), save(), storageKey()

### Community 16 - "20261005000000_harden_requirement_submission.sql"
Cohesion: 0.29
Nodes (4): public.early_learning_kit_rules, public.standard_kit_definitions, public.standard_kit_publications, requests_idempotency_key_unique

### Community 17 - "catalogue-validator.js"
Cohesion: 0.52
Nodes (6): issue(), normalizedClass(), printReport(), run(), textOrEmpty(), validateCatalogue()

### Community 18 - "early-learning-kit-config.js"
Cohesion: 0.43
Nodes (5): belongsToStage(), createProvider(), getStageConfig(), isEligible(), stageCode()

### Community 20 - "catalogue-bootstrap.js"
Cohesion: 0.47
Nodes (3): readCache(), ready(), writeCache()

### Community 22 - "standard-kit-config.js"
Cohesion: 0.50
Nodes (3): createProvider(), get(), resolve()

## Knowledge Gaps
- **99 isolated node(s):** `Product`, `Early Learning / Custom Kit`, `Architecture and data`, `Development`, `graphify` (+94 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 148 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `text()` connect `catalogue-supabase-adapter.js` to `request-submission.js`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `create()` (e.g. with `custom-kit-state.js` and `add()`) actually correct?**
  _`create()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Product`, `Early Learning / Custom Kit`, `Architecture and data` to the rest of the system?**
  _99 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `standard-kit-public-read-migration.test.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.049682875264270614 - nodes in this community are weakly interconnected._
- **Should `import-publications.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `createBrowserSandbox` be split into smaller, more focused modules?**
  _Cohesion score 0.05331510594668489 - nodes in this community are weakly interconnected._