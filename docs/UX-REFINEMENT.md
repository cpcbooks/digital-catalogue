# Catalogue UX refinement

The `codex/catalogue-ux-refinement` branch applies the approved catalogue-first refinements without changing publication data or Supabase.

- The footer retains its original shared layout. `js/catalogue-source-links.js` continues to add only the existing source-aware Privacy Notice link.
- `css/ux-refinement.css` is a small shared enhancement layer: it keeps the existing cards, header, controls and responsive breakpoints while adding the outlined contextual Back treatment, three-line card-title reserve and accessible autocomplete surface.
- At the existing mobile breakpoint, content-page headers use a scoped 32px/1.15 title treatment with 14px/1.5 supporting copy and consistent breadcrumb, Back, eyebrow and tab spacing. Homepage and functional request/privacy pages are excluded.
- Option C+ promotes the category name to the H1 on Early Learning, School Learning, College & University, and Competitive Exams. Their former promotional line is secondary text where present; a shared 3px CPC-navy accent marks the heading and tagline. At 760px and below the category hierarchy is 30px/36px, 16px/24px and 14px/21px; at 1024px and above it is 38px/45px, 19px/28px and 16px/24px. Early Learning, School Learning and College level templates retain their complete stage/class H1s and receive only the restrained title accent. Browse, Book Details, kit, selection, request, privacy and homepage layouts remain unchanged.
- Listing cards render only Class / level, Series, Book type and SKU, in that order; Category and Subject remain available to catalogue data, filtering and search but are not visible on cards. Metadata labels are semibold and values regular at 13px/19px, with missing rows omitted. MRP and actions share a bottom-pushed card group so they align within each grid row without placeholder metadata.
- Search suggestions use the existing `CambridgeCatalogueQuery` data and routes. Numeric/SKU-shaped input only returns an exact SKU; normal text still searches catalogue text fields.
- Competitive Exams uses its dedicated category page and the shared catalogue query/card renderer. It intentionally has no exam subdivisions or generic Browse controls; future `competitive-exams` records render there automatically.
- The Early Learning Custom Kit still uses `CambridgeEarlyLearningKitConfig` and `CambridgeCustomKitState`. All four configured stages currently have an eight-title minimum, while the builder presents their eligible titles as one continuous grid.

No publication master data, identifiers, Supabase schema, RLS, storage, Edge Functions, or deployment configuration are changed by this refinement.

## Inner-page visual layer — 2026-10-29 18:20 IST (UTC+05:30)

`css/inner-pages-refinement.css` is a scoped presentation layer for catalogue inner pages. It keeps the homepage and all catalogue behaviour unchanged while applying restrained banner washes, card borders, active navigation, focus states and category accents: Early Learning (`#D88936`), School Books (`#2878B5`), Exam Preparation (`#7853A6`), College & University (`#198A7C`) and Competitive Exams (`#A66B42`). The shared loader adds the layer only after the normal UX refinement stylesheet, and `catalogue-source-links.js` supplies page tone through a body data attribute. Publication card metadata, search/filter URL state, Selection, Custom Kit and requirement behaviour remain untouched.

## Consistency correction — 2026-10-29 21:09 IST (UTC+05:30)

Landing and selection cards use lightweight inline SVG icons through the shared source-link enhancement, with category-coloured icon containers rather than numeric labels or empty circles. Headings remain CPC navy; title accents and eyebrows use the page category tone. School Books now preserves a valid class parameter in its generated contextual Back control, matching Exam Preparation. Unconfigured Standard Kits remain non-actionable Coming Soon cards, Custom Kit progress is Early Learning orange, and the obsolete College & University development notice is removed at presentation time. No catalogue, selection, kit, Supabase or request contracts changed.

## Mobile choice cards and detail fallback — 2026-10-29 22:15 IST (UTC+05:30)

Early Learning and School Learning choice cards retain their desktop grids but become compact, whole-card links on mobile. Their existing anchors provide the single keyboard focus target; unavailable Standard Kits remain non-actionable and omit the navigation chevron. Book Details now keeps the desktop two-column presentation while reducing the title scale and presenting a compact mobile cover area. When no approved image is available, the gallery shows a small “Cover not yet available” placeholder and hides its caption, arrows and counter. Listing empty states use public copy: no published titles, no search match, and data-load failure are distinguished without exposing repository or implementation details. Read-only catalogue verification found 45 College & University records: 21 1st PUC, 24 2nd PUC and no Degree records; Degree therefore uses the public no-publications state rather than an internal-development message.
