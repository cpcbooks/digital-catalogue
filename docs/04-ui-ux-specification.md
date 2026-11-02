# UI/UX Specification — Reconciled Development Notes

## Status

This focused document reconciles the accepted IM-12C production behaviour with the deployed IM-14A/A.1 work. It does not replace the historical specification retained in the previous development checkout. IM-14A/A.1 was deployed to `main` in `1857057` on 2026-10-23 13:14 IST (UTC+05:30).

## Approved colour architecture

Production CSS is authoritative. Shared catalogue workflows use `--navy` `#17365D`, `--navy-dark` `#102945`, the inner neutral accent `#183B63`, neutral wash `#F2F6FA`, neutral border `#DBE5EF`, and the floating-selection background `#12233F`. These values remain defined in `css/catalogue.css`, `css/inner-pages-refinement.css`, and the injected floating-selection style in `js/catalogue-selection.js`.

Inner-page category tones are intentionally distinct from homepage category cards: Early Learning `#D88936` / `#FFF7ED` / `#F0D9BF`; School Learning `#2878B5` / `#EEF7FC` / `#CCE1F0`; Exam Preparation `#7853A6` / `#F6F1FB` / `#DFD1EE`; College & University `#198A7C` / `#EEF9F7` / `#C9E7E1`; Competitive Exams `#A66B42` / `#FCF4ED` / `#EAD5C4` (accent / wash / border). Homepage category cards retain their own palette: Early `#FFF4DF` / `#89540C`, School `#E6F3FF` / `#1463A8`, College `#F0E9FF` / `#7648BF`, Competitive `#E8F6ED` / `#21794C` (background / foreground). Do not normalise or migrate either palette.

## Publication listings

- All Books and category listings use the shared vertical publication-card grid.
- A card places its cover, title, Class/Level and permanent SKU on one metadata row, MRP, View Book action, and Selection action in that order. Class/Level is left-aligned; SKU is right-aligned. Series, Book Type and ISBN are not listing-card metadata.
- The title reserves exactly three lines using the active title type scale and clamps beyond that limit. This gives every card in a row the same title, metadata, MRP and action positions regardless of title length.
- Desktop content uses 16px horizontal padding, 16px title type at 1.35 line height, 10px from title to metadata, 4px from metadata to MRP, and 12px before actions. Mobile preserves the approved compact two-column presentation at 390px and 450px: 12px padding, 14px title type at 1.35 line height, and 8px, 3px and 10px at those same boundaries. Both actions remain full-width with an 8px gap.
- The grid uses four columns where the content width supports it, three at medium desktop widths, two through 390px mobile widths, and one at 319px and below. School Books uses the same approved desktop content width as Browse/New Arrivals, so complete and incomplete rows retain equal card dimensions.
- Existing search, filters, subject grouping, URL state, selection state and return behaviour remain unchanged.
- Listing-card metadata remains compact: Class/Level and permanent SKU, followed by MRP. ISBN is displayed on Book Details, not on listing cards.

## Inner-page navigation

- Breadcrumbs stay at the top-left of the existing inner-page content container and retain the shared breadcrumb styling.
- The contextual Back/return link sits immediately below the breadcrumb at left. Workflow-page Home breadcrumbs are not paired beside the Back action; New Arrivals retains its existing `View All Publications` secondary action where applicable.
- Contextual destinations take precedence over an unconditional Home route. Page-specific heading alignment is unchanged: the School Learning category landing page remains centred, while class-specific publication listings remain left-aligned.

## Cover presentation

- Real front covers preserve their own aspect ratio with contained rendering; they are never cropped, stretched or rotated.
- Listing-card cover regions and their missing-cover placeholders are plain white (`#FFFFFF`), centered and contained with no separate tinted media panel. They carry no SKU, caption, icon or substitute artwork. Listing media regions are 200px desktop, 180px medium desktop/tablet, 165px mobile, and 150px at narrow mobile; the image maximums are 180px desktop, 165px medium desktop/tablet and 150px mobile, while the portrait placeholder is 140px desktop and 110px mobile.
- Book Details retains its existing gallery behaviour and optional-metadata handling; absent optional values are omitted and valid values remain visible.

## Scope boundary

## Homepage — IM-15 Development

- The owner-approved homepage composition uses a left-aligned serif hero, functional search, four category cards, a New Arrivals structure, and the footer. The Complete Cambridge Collection panel is absent.
- The shared logo route, My Selection control, source-aware search and Privacy Notice remain provided by the existing shared scripts. Every category destination and direct stage/class shortcut remains a real link.
- Category cards stack on mobile without hiding shortcuts. IM-14A/A.1 publication-card presentation is unchanged.
- New Arrivals is curated-only at `browse.html?view=new-arrivals`, using the existing Browse page and shared publication cards. The current approved Class 1–8 Wondera Computational Thinking & AI list is configured by the permanent CPC SKUs `CPC00252`–`CPC00259`; it must not infer newness from timestamps or identifiers.
- In New Arrivals mode, the existing breadcrumb and Back to Home / View All Publications row remain available, while Browse tabs, search, filters and sorting controls are absent. It is not a separate page and adds no ordering or checkout flow.
- Wondera CT & AI cover assets are deferred for this release. The existing shared blank portrait fallback remains the approved presentation until original covers are supplied.
- Approved homepage presentation assets are deployed under `assets/homepage/`: `desktop/` and `mobile/` contain matching `hero-*` and `home-{early-learning,school-learning,college-university,competitive-exams,new-arrivals}` names. The owner-controlled master sources remain outside deployed assets in `catalogue-image-assets/`; do not edit or delete those sources during website cleanup.
- At the `650px` breakpoint, category cards use their `<picture>` mobile JPEG source. The desktop hero uses `hero-desktop.png`; the compact mobile hero uses `hero-mobile.png` as a bottom-anchored, cover-fitted background so its lower books, globe, plant, pencils and open book remain visible without changing the search layout. New Arrivals uses the desktop PNG above the breakpoint and its separately approved mobile JPEG below it. Media containers, headings, controls and links remain HTML.
- The hero and New Arrivals media use restrained CSS fades/masks to blend into their surrounding washes. New Arrivals retains its pale blue `#EFF6FB` background with CPC Navy `#17365D` for its border, star icon and CTA. Homepage category colours remain Early `#FFF4DF` / `#89540C`, School `#E6F3FF` / `#1463A8`, College `#F0E9FF` / `#7648BF`, and Competitive `#E8F6ED` / `#21794C`.
- These are catalogue presentation assets only: they must not be stored with, mapped to, or removed alongside publication covers, back covers, samples or PDFs. Replace presentation artwork by supplying an approved same-purpose file in `catalogue-image-assets/`, copying it into the matching `assets/homepage/{desktop|mobile}/` path, checking all three responsive widths, and publishing through the normal reviewed GitHub Pages workflow.
