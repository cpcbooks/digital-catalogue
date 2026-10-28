# Catalogue UX refinement

The `codex/catalogue-ux-refinement` branch applies the approved catalogue-first refinements without changing publication data or Supabase.

- The footer is enhanced at runtime by `js/catalogue-source-links.js`, so the existing page footers retain one shared, source-aware link structure.
- `css/ux-refinement.css` is a small shared enhancement layer: it keeps the existing cards, header, controls and responsive breakpoints while adding the outlined contextual Back treatment, three-line card-title reserve, accessible autocomplete surface and mobile footer alignment.
- Search suggestions use the existing `CambridgeCatalogueQuery` data and routes. Numeric/SKU-shaped input only returns an exact SKU; normal text still searches catalogue text fields.
- Competitive Exams routes directly to Browse with `category=competitive-exams`. Browse preserves that route even when its empty state is shown.
- The Early Learning Custom Kit still uses `CambridgeEarlyLearningKitConfig` and `CambridgeCustomKitState`. All four configured stages currently have an eight-title minimum, while the builder presents their eligible titles as one continuous grid.

No publication master data, identifiers, Supabase schema, RLS, storage, Edge Functions, or deployment configuration are changed by this refinement.
