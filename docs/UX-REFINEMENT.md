# Catalogue UX refinement

The `codex/catalogue-ux-refinement` branch applies the approved catalogue-first refinements without changing publication data or Supabase.

- The footer retains its original shared layout. `js/catalogue-source-links.js` continues to add only the existing source-aware Privacy Notice link.
- `css/ux-refinement.css` is a small shared enhancement layer: it keeps the existing cards, header, controls and responsive breakpoints while adding the outlined contextual Back treatment, three-line card-title reserve and accessible autocomplete surface.
- At the existing mobile breakpoint, content-page headers use a scoped 32px/1.15 title treatment with 14px/1.5 supporting copy and consistent breadcrumb, Back, eyebrow and tab spacing. Homepage and functional request/privacy pages are excluded.
- Option C+ promotes the category name to the H1 on Early Learning, School Learning, College & University, and Competitive Exams. Their former promotional line is secondary text where present; a shared 3px CPC-navy accent marks the heading and tagline. At 760px and below the category hierarchy is 30px/36px, 16px/24px and 14px/21px; at 1024px and above it is 38px/45px, 19px/28px and 16px/24px. Early Learning, School Learning and College level templates retain their complete stage/class H1s and receive only the restrained title accent. Browse, Book Details, kit, selection, request, privacy and homepage layouts remain unchanged.
- Search suggestions use the existing `CambridgeCatalogueQuery` data and routes. Numeric/SKU-shaped input only returns an exact SKU; normal text still searches catalogue text fields.
- Competitive Exams uses its dedicated category page and the shared catalogue query/card renderer. It intentionally has no exam subdivisions or generic Browse controls; future `competitive-exams` records render there automatically.
- The Early Learning Custom Kit still uses `CambridgeEarlyLearningKitConfig` and `CambridgeCustomKitState`. All four configured stages currently have an eight-title minimum, while the builder presents their eligible titles as one continuous grid.

No publication master data, identifiers, Supabase schema, RLS, storage, Edge Functions, or deployment configuration are changed by this refinement.
