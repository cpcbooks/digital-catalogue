# UI/UX Specification — Reconciled Development Notes

## Status

This focused document reconciles the accepted IM-12C production behaviour with the deployed IM-14A/A.1 work. It does not replace the historical specification retained in the previous development checkout. IM-14A/A.1 was deployed to `main` in `1857057` on 2026-10-23 13:14 IST (UTC+05:30).

## Publication listings

- All Books and category listings use the shared vertical publication-card grid.
- A card places its cover, title, metadata, MRP, View Book action and Selection action in that order. Text is left aligned; covers are centred.
- The grid uses four columns where the content width supports it, three at medium desktop widths, two through 390px mobile widths, and one at 359px and below. Cards keep actions at their bottom without clipping content.
- Existing search, filters, subject grouping, URL state, selection state and return behaviour remain unchanged.
- Listing-card metadata remains compact: category/class, series where applicable, subject/book type, permanent SKU and MRP. ISBN is displayed on Book Details, not on listing cards.

## Inner-page navigation

- Breadcrumbs stay at the top-left of the existing inner-page content container and retain the shared breadcrumb styling.
- The contextual Back/return link sits immediately below the breadcrumb at left. Where an existing secondary link is useful, it shares that row at right; New Arrivals retains `View All Publications` there.
- Contextual destinations take precedence over an unconditional Home route. Page-specific heading alignment is unchanged: the School Learning category landing page remains centred, while class-specific publication listings remain left-aligned.

## Cover presentation

- Real front covers preserve their own aspect ratio with contained rendering; they are never cropped, stretched or rotated.
- A missing or failed cover is a blank light-grey portrait placeholder, centred inside the compact media region. It carries no SKU, caption, icon or substitute artwork. Listing media regions are 200px desktop, 180px medium desktop/tablet, 165px mobile, and 150px at narrow mobile; the placeholder is 140px desktop and 110px mobile.
- Book Details retains its gallery and uses the same blank placeholder rule. IM-12B.1 optional-metadata handling remains: absent optional values are omitted and valid values remain visible.

## Scope boundary

## Homepage — IM-15 Development

- The owner-approved homepage composition uses a left-aligned serif hero, functional search, four category cards, a New Arrivals structure, and the footer. The Complete Cambridge Collection panel is absent.
- The shared logo route, My Selection control, source-aware search and Privacy Notice remain provided by the existing shared scripts. Every category destination and direct stage/class shortcut remains a real link.
- Category cards stack on mobile without hiding shortcuts. IM-14A/A.1 publication-card presentation is unchanged.
- New Arrivals is curated-only at `browse.html?view=new-arrivals`, using the existing Browse page and shared publication cards. The current approved Class 1–8 Wondera Computational Thinking & AI list is configured by the permanent CPC SKUs `CPC00252`–`CPC00259`; it must not infer newness from timestamps or identifiers.
- In New Arrivals mode, the existing breadcrumb and Back to Home / View All Publications row remain available, while Browse tabs, search, filters and sorting controls are absent. It is not a separate page and adds no ordering or checkout flow.
- Wondera CT & AI cover assets are deferred for this release. The existing shared blank portrait fallback remains the approved presentation until original covers are supplied.
- IM-15 uses owner-supplied PNG assets under `assets/im15/` for the hero, each category card, and New Arrivals. Images are contained by fixed media regions with responsive `object-fit: cover` cropping; headings, controls and links remain HTML.
- The hero and New Arrivals media use responsive CSS masks to blend into their cream backgrounds. Mobile uses a compact stacked hero while retaining the same source image and search behavior.
