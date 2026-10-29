# Catalogue UX refinement

The `codex/catalogue-ux-refinement` branch applies the approved catalogue-first refinements without changing publication data or Supabase.

- The footer retains its original shared layout. `js/catalogue-source-links.js` continues to add only the existing source-aware Privacy Notice link.
- `css/ux-refinement.css` is a small shared enhancement layer: it keeps the existing cards, header, controls and responsive breakpoints while adding the outlined contextual Back treatment, three-line card-title reserve and accessible autocomplete surface.
- Search suggestions use the existing `CambridgeCatalogueQuery` data and routes. Numeric/SKU-shaped input only returns an exact SKU; normal text still searches catalogue text fields.
- Competitive Exams uses its dedicated category page and the shared catalogue query/card renderer. It intentionally has no exam subdivisions or generic Browse controls; future `competitive-exams` records render there automatically.
- The Early Learning Custom Kit still uses `CambridgeEarlyLearningKitConfig` and `CambridgeCustomKitState`. All four configured stages currently have an eight-title minimum, while the builder presents their eligible titles as one continuous grid.

No publication master data, identifiers, Supabase schema, RLS, storage, Edge Functions, or deployment configuration are changed by this refinement.
