# Graph Report - digital-catalogue  (2026-10-06)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 352 nodes · 601 edges · 38 communities (27 shown, 11 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 97 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `01cb3d2e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31

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
- `selectionWithStorage()` --calls--> `loadBrowserScript()`  [EXTRACTED]
  tests/catalogue-selection.test.cjs → tests/helpers/browser-script-sandbox.cjs
- `bootstrap()` --calls--> `createBrowserSandbox()`  [EXTRACTED]
  tests/catalogue-bootstrap.test.cjs → tests/helpers/browser-script-sandbox.cjs

## Import Cycles
- None detected.

## Communities (38 total, 11 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (33): allowedTypes, assertPublication(), EXT, headers(), jsonRequest(), manifest, manifestText, MIME (+25 more)

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (28): actionNode(), add(), currentRelativeUrl(), detailsUrl(), emitChange(), ensureFloatingBar(), ensureFloatingStyle(), indexOfBook() (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (16): BOOK_TYPES, comparable(), EARLY_STAGES, equal(), execute(), issue(), LIFECYCLES, MEDIA (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.22
Nodes (15): attemptKey(), backendClass(), bookLine(), buildBackendPayload(), buildPayload(), catalogueProducts(), classArray(), customerPayload() (+7 more)

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (15): activeAssets(), categoryFor(), classArray(), compareWithStatic(), firstAsset(), installPilot(), legacyImages(), legacyType() (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.20
Nodes (10): configuredMinimum(), create(), add(), canReview(), contains(), count(), isComplete(), remaining() (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.34
Nodes (13): backLabel(), block(), classTag(), detailEarlyClass(), gallery(), imageList(), init(), refresh() (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.21
Nodes (10): contacts, corsHeaders, customerTypes, existingCustomers, keys(), object(), optionalText(), text() (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (11): assert, { clonePublications }, { createBrowserSandbox, loadBrowserScript }, queryWithCatalogue(), test, clonePublications(), publications, assert (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.19
Nodes (12): assert, { createBrowserSandbox, loadBrowserScript }, eligibleKit(), kit(), test, loadBrowserScript(), assert, books (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.28
Nodes (9): active(), browseMatches(), browseValues(), byCategory(), byCategoryAndClass(), byId(), classValues(), matchesClass() (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (8): adapter(), assert, { createBrowserSandbox, loadBrowserScript }, test, assert, fs, path, test

### Community 12 - "Community 12"
Cohesion: 0.20
Nodes (7): assert, fs, importerPromise, manifestPath, path, { pathToFileURL }, test

### Community 13 - "Community 13"
Cohesion: 0.39
Nodes (7): init(), clear(), currentBrowseUrl(), hasActive(), render(), renderActive(), syncUrl()

### Community 14 - "Community 14"
Cohesion: 0.42
Nodes (7): captureBookLink(), captureBookLinks(), pageKey(), read(), restore(), save(), storageKey()

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (8): assert, { clonePublications }, { createBrowserSandbox, createStorage, loadBrowserScript }, selectionWithStorage(), test, createBrowserSandbox(), createStorage(), submissionWithState()

### Community 16 - "Community 16"
Cohesion: 0.29
Nodes (4): public.early_learning_kit_rules, public.standard_kit_definitions, public.standard_kit_publications, requests_idempotency_key_unique

### Community 17 - "Community 17"
Cohesion: 0.52
Nodes (6): issue(), normalizedClass(), printReport(), run(), textOrEmpty(), validateCatalogue()

### Community 18 - "Community 18"
Cohesion: 0.43
Nodes (5): belongsToStage(), createProvider(), getStageConfig(), isEligible(), stageCode()

### Community 19 - "Community 19"
Cohesion: 0.29
Nodes (6): assert, { createBrowserSandbox, loadBrowserScript }, fs, path, source(), test

### Community 20 - "Community 20"
Cohesion: 0.47
Nodes (3): readCache(), ready(), writeCache()

### Community 21 - "Community 21"
Cohesion: 0.33
Nodes (4): assert, { createBrowserSandbox, loadBrowserScript }, test, validator()

### Community 22 - "Community 22"
Cohesion: 0.50
Nodes (3): createProvider(), get(), resolve()

### Community 23 - "Community 23"
Cohesion: 0.40
Nodes (3): fs, path, vm

### Community 26 - "Community 26"
Cohesion: 0.40
Nodes (4): assert, bootstrap(), { createBrowserSandbox, loadBrowserScript }, test

### Community 27 - "Community 27"
Cohesion: 0.40
Nodes (4): assert, { createBrowserSandbox, loadBrowserScript }, navigation(), test

### Community 28 - "Community 28"
Cohesion: 0.40
Nodes (4): assert, config(), { createBrowserSandbox, loadBrowserScript }, test

## Knowledge Gaps
- **94 isolated node(s):** `allowedTypes`, `EXT`, `manifest`, `manifestText`, `MIME` (+89 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 142 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createBrowserSandbox()` connect `Community 15` to `Community 8`, `Community 9`, `Community 11`, `Community 19`, `Community 21`, `Community 23`, `Community 26`, `Community 27`, `Community 28`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `create()` (e.g. with `custom-kit-state.js` and `add()`) actually correct?**
  _`create()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `allowedTypes`, `EXT`, `manifest` to the rest of the system?**
  _94 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05975609756097561 - nodes in this community are weakly interconnected._
- **Why does `loadBrowserScript()` connect `Community 9` to `Community 8`, `Community 11`, `Community 15`, `Community 19`, `Community 21`, `Community 23`, `Community 26`, `Community 27`, `Community 28`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Why does `text()` connect `Community 4` to `Community 3`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._