# CPC Digital Catalogue Design System

Last updated: 2026-11-01 23:09 IST (UTC+05:30)

## Purpose and authority

**Current acceptance (2026-11-02):** Public catalogue functional testing is closed (37/37 mobile; 5/5 final smoke). Maintain the approved design system while completing cover/sample media and visual content; do not use launch-content work to introduce a competing layout system. See `PROJECT-STATE.md` for production status.

This is the reusable description of the approved catalogue language already implemented in the repository. It preserves, rather than replaces, `docs/04-ui-ux-specification.md`. Where the documents differ, inspected production CSS and the approved page pattern govern the implementation; escalate a material conflict instead of silently normalising it.

The catalogue remains catalogue-first: primary buttons may support My Selection or a requirement workflow, but must not turn the pages into checkout surfaces.

## Shared foundation

### Branding and type

- The shared `.catalogue-header` contains the linked Cambridge brand and the injected My Selection control (`.catalogue-header-selection`). At `max-width: 600px` its padding is `12px 16px`, the brand name is `20px`, and the company line is `7px`.
- Base tokens in `css/catalogue.css` are `--navy: #17365D`, `--navy-dark: #102945`, `--muted: #687386`, `--background: #F6F7F9`, `--surface: #FFFFFF`, `--border: #E4E7EC`, and `--radius: 14px`.
- `.eyebrow` is the compact uppercase hierarchy label: `11px`, weight `800`, `1.8px` letter spacing. Inner-page refinement changes its colour to the active category accent.
- Inner-page headings use the existing page-local `clamp()` declarations and refinement rules. The shared stage/listing pattern is `38px/45px` from `761px` upward, `34px/41px` on `761px–1023px` where the category-heading group is used, and `30px/36px` at `max-width: 760px`.
- Supporting copy is muted and left-aligned for stage/listing/detail workflows. Existing hero descriptions are commonly constrained to `680px`; do not widen them just to fill desktop space.
- Publication title, metadata, SKU and MRP follow the shared publication-card order defined in `docs/04-ui-ux-specification.md`: cover, title, compact metadata, MRP, View Book, then selection action. MRP remains visible; ISBN stays on Book Details.

### Category tone layer

`js/catalogue-source-links.js` gives inner pages `body.catalogue-inner-page` and a `data-catalogue-tone`. `css/inner-pages-refinement.css` exposes the active `--inner-accent`, `--inner-wash`, and `--inner-border` values.

| Category | Accent | Wash | Border |
| --- | --- | --- | --- |
| Early Learning | `#D88936` | `#FFF7ED` | `#F0D9BF` |
| School Learning | `#2878B5` | `#EEF7FC` | `#CCE1F0` |
| Exam Preparation | `#7853A6` | `#F6F1FB` | `#DFD1EE` |
| College & University | `#198A7C` | `#EEF9F7` | `#C9E7E1` |
| Competitive Exams | `#A66B42` | `#FCF4ED` | `#EAD5C4` |

Category colour identifies the section: eyebrow, vertical heading accent, contextual borders, active stage/class tab, and category-specific card detail. CPC navy remains the primary button and primary text colour; it is not replaced by the category accent.

Homepage category-card colours are a separate approved palette and must not be normalised into these inner-page tokens. Shared content background is `#F2F6FA`; the shared inner-page neutral border is `#DBE5EF`.

## Layout and navigation

- Inner heroes use `.page-hero`, `.stage-hero`, or `.browse-hero`, an inner wrapper such as `.hero-inner`, `.page-wrap`, or `.stage-wrap`, and a `1180px` maximum content width where declared. The inner-page layer gives these heroes an active-wash-to-white gradient and an active-border lower edge.
- Shared content uses `.catalogue-section`: `max-width: 1280px`, horizontal auto margin, `64px 6%` padding; at `max-width: 600px`, it is `44px 18px`.
- Context navigation starts with `.context-nav`; the selection script renders `.catalogue-breadcrumbs` and `.catalogue-context-action`. Breadcrumbs precede the contextual action. The action must return to the actual parent context, not a generic substitute.
- `.catalogue-context-action` is compact, outlined by the inner-page layer, and is at least `40px` tall at `max-width: 760px`. Keep Home reachable through the breadcrumb hierarchy.
- The heading sequence is breadcrumb, contextual Back action, eyebrow, title with vertical accent where the approved stage/listing pattern applies, then description and optional tabs/controls. These elements share one horizontal container.
- `footer` remains after page content; no fixed footer is introduced. The only fixed workflow element is the existing mobile selection/review affordance where that page already provides it.

## Components and states

- **Landing and stage cards:** existing `.stage-card`, `.level-card`, `.choice-card`, and `.category-card` retain their existing grids and shared `catalogue-card-icon` treatment. Category accent affects icon and border state; primary CTA stays navy.
- **Publication cards:** use `css/publication-browser.css`; covers remain contained, with the established light-grey portrait fallback. Do not create a second listing-card layout.
- **Kit lists:** Standard Kit uses ordered `.kit-list` / `.kit-book` rows; Custom Kit uses existing selectable `.book-card` controls. Standard Kit has no per-title controls.
- **Filters:** page-local `.controls` retain the existing input/select layout and URL state. At narrow widths, controls wrap rather than overflow.
- **Quantity controls:** selection cards and My Selection retain the shared minus/input/plus contract. Manual input remains usable and bounded by the existing validation; no kit-specific quantity widget is introduced.
- **Forms and review:** preserve labels, validation state, draft persistence, contextual Back route, compact cards, and the existing navy primary action. The post-success confirmation page is exempt from the shared inner-page hero requirement.
- **Loading, empty, error, and unavailable states:** retain the existing bordered `.message`, `.empty`, `.browse-empty`, `.competitive-empty`, `.data-message`, or page-local unavailable treatment. Do not mask a load failure as an empty catalogue.

## Interaction principles

- Make one primary next action obvious; do not duplicate navigation or selection controls.
- Retain URL source, parent context, selection quantities, kit draft state, and requirement-form drafts through normal navigation.
- Use real links and buttons with visible focus states. Inner-page refinement supplies an accent-aware `:focus-visible` outline.
- Keep controls readable and touchable; preserve existing button labels and catalogue terminology such as My Selection, kit set, and Send Requirement.
- Do not change business rules merely to make a visual pattern uniform.

## Mobile Design Principles and Responsive UI Contract

Mobile is a first-class layout, not a scaled desktop view.

### Alignment, type, and spacing

- Use the same hero wrapper for breadcrumb, Back action, eyebrow, heading, description, tabs, and controls. The approved small-screen hero padding is page-specific but consistently uses `18px` horizontal padding in listing, stage, and kit patterns.
- At `max-width: 760px`, shared refinement makes breadcrumbs `11px/1.35`, Back actions at least `40px`, and stage/listing heading groups `30px/36px`; at `max-width: 600px`, base breadcrumb sizing is `10px` and `.catalogue-section` is `44px 18px`.
- Long names must wrap in the content container. Do not use negative margins or page-only offsets to line up a hero.

### Cards, controls, navigation, and forms

- Publication grids are four columns where supported, three at `max-width: 1100px`, two at `max-width: 760px`, and one at `max-width: 319px`. Covers remain contained.
- Early Learning stage/class tabs may become horizontally scrollable at `max-width: 700px`; their links remain visible, non-shrinking touch targets. Do not hide the active stage.
- Existing Custom Kit cards move from four to three columns at `850px` and two at `600px`; the fixed review bar stacks at `600px`.
- Existing My Selection mobile controls use `44px` quantity buttons/inputs at `max-width: 650px`. Preserve this layout and avoid horizontal control scrolling.
- Forms retain labels and validation feedback, use their existing mobile stack, and preserve draft values. Mobile action buttons must remain inside the viewport and keyboard focusable.

### Verification matrix

The project has page-specific breakpoints rather than a new global breakpoint system. Verify the following bands against the cited existing rules:

| Band | Existing breakpoint anchors | Required checks |
| --- | --- | --- |
| Narrow mobile | `max-width: 319px` / `360px` | One-column publication fallback where defined; no clipped title, breadcrumb, controls, or CTA. |
| Standard mobile | `max-width: 600px` | `18px` content padding, compact header, stacked actions, usable quantities and forms. |
| Large mobile | `max-width: 700px` / `720px` / `760px` | Stage tabs and filters wrap/scroll correctly; two-column publication grid; Back action and hero sequence remain aligned. |
| Tablet | `761px–1023px`, plus page rules at `850px`, `900px`, `1000px` | Appropriate grid reduction, no excessive card whitespace, and readable heading scale. |
| Desktop | Above the applicable page breakpoint | Centered wrappers, correct maximum width, category wash/border, balanced cards, and footer after content. |

Automated structure checks are useful regression alarms; they do not establish visual acceptance. Manual desktop and mobile review remains required for UI changes.

## Scope references

This system applies to homepage; category and stage/class landings; book listings; Standard Kit; Custom Kit builder/review; My Selection; requirement form/review; and shared header/footer. The successful-submission confirmation retains its confirmation-specific layout while meeting basic branding, accessibility, and mobile-use requirements.
