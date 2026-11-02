# CPC Digital Catalogue UI Page Patterns

Last updated: 2026-11-01 23:17 IST (UTC+05:30)

Read this with `docs/06-catalogue-design-system.md` and `docs/04-ui-ux-specification.md`. The listed classes are inspected implementation references, not a new component API.

## Production acceptance (2026-11-02)

All five final smoke checks passed, including homepage/navigation, catalogue categories, book detail/fallback media, mobile Standard/Custom Kit entry and My Selection → Requirement Details → Review Requirement. Preserve accepted structures and only retest affected pages after media/content changes. PR #33 resolved mobile kit navigation; PR #34 improved network/retry messages.

## 1. Homepage

- **Pages:** `index.html`.
- **Reference:** approved homepage implementation and `docs/04-ui-ux-specification.md`.
- **Structure:** `.homepage` → `.home-shell` → `.home-hero` / `.hero-layout`; `.home-categories`; New Arrivals; footer.
- **Layout:** four category cards, two at `max-width: 1100px`, one at `max-width: 650px`; homepage imagery changes at `650px` and its own artwork rules apply.
- **Function:** source-aware search and all category/stage shortcuts remain actual links.
- **Failure modes:** treating homepage card colours as inner-page tone variables; removing stage shortcuts; making a whole card swallow nested links.

## 2. Category landing

- **Pages:** `early-learning.html`, `school-education.html`, `college-university.html`, `competitive-exams.html`.
- **Reference:** `early-learning.html` for Early Learning, then the matching category tone.
- **Structure:** `.stage-hero` → `.stage-wrap` → `.context-nav` → category heading (`.category-heading-group` where injected) → stage grid; footer.
- **Layout:** centred category landing may retain its approved centered copy; mobile card behaviour is page-specific (`early-learning.html` changes to compact stage pills at `700px`).
- **Failure modes:** applying stage/listing left alignment to a category landing; missing Home route; inventing a different palette.

## 3. Stage/class landing

- **Pages:** `early-learning-level.html`, `school-learning.html`.
- **Reference:** `early-learning-level.html?level=lkg`.
- **Structure:** `.page-hero` → `.page-wrap` → `.context-nav`, eyebrow, `h1`, intro, `.level-tabs` or `.class-tabs`; `.content` → choice/category grid.
- **Colour/navigation:** active tab, hero border, eyebrow, and accent derive from the category tone; CTA stays navy. Back returns to Early Learning or School Learning respectively.
- **Responsive:** tabs scroll horizontally and cards become one column at `max-width: 700px`.
- **Failure modes:** clipping the active tab, using a generic Home Back route, or hiding functional card actions.

## 4. Individual publication listing

- **Pages:** `early-learning-books.html`, `school-books.html`, `exam-preparation.html`, `college-books.html`, competitive-exam listings.
- **Primary reference:** `early-learning-books.html?level=lkg`.
- **Structure:** `.page-hero` → `.hero-inner` → `.context-nav`, eyebrow, `h1`, `.hero-description`, `.controls`; main `.catalogue-section` → result summary/group headings → `.publication-grid`.
- **Colour/navigation:** category tone applies to hero and contextual border; group divider and primary actions remain navy.
- **Responsive:** listing hero changes at `720px`; shared cards are three columns at `1100px`, two at `760px`, one at `319px`.
- **Failure modes:** separate full-width mobile book rows, cropped covers, controls that overflow, or lost source/query state.

## 5. Standard Kit details

- **Pages:** `standard-kit.html?level={playgroup|nursery|lkg|ukg}`.
- **Reference:** `early-learning-books.html?level=lkg` for the introductory structure; existing `standard-kit.html` for kit list and actions.
- **Structure:** `.page-hero` → `.hero-inner` → `.context-nav`, eyebrow, `h1`, `.hero-description`; `.kit-main` → `.catalogue-section.kit-content` → `.kit-card` → `.kit-list` / `.kit-book` → `.kit-actions`.
- **Functional contract:** preserve configured order, cover/metadata/MRP, one copy per title, total MRP, add-to-selection action, composition safety, and all selection/request contracts. There are no component quantity controls.
- **Responsive:** standard page hero uses `36px 18px 28px` at `600px`; kit actions stack and cards compact.
- **Known failure mode:** if the route is not given the Early Learning tone, the otherwise-correct hero remains neutral/navy. See the diagnosis below.

## 6. Custom Kit builder

- **Pages:** `kit-builder.html?level={stage}`.
- **Reference:** Individual Books introductory sequence, with Custom Kit’s existing minimum message, name field, selectable catalogue, and fixed review bar retained.
- **Current structure:** `.kit-hero` → `.kit-wrap` → `.context-nav`, eyebrow, `h1`, `.kit-intro`, `.minimum-box`, `.kit-name`; `.kit-content`; `.kit-summary`.
- **Functional contract:** preserve stage configuration, title selection, draft restoration, named draft, review routing, and selection/request integration. UI work must not alter eligibility, minimums, or completion rules.
- **Responsive:** book grid is three columns at `850px`, two at `600px`; the review bar stacks at `600px`.
- **Known failure mode:** `.kit-hero` is a legacy structural class and is outside the shared inner-page hero selectors, leaving its white, oversized introductory treatment independent of the approved Early Learning hero.

## 7. Custom Kit review

- **Pages:** `kit-review.html?level={stage}`.
- **Reference:** the builder introduction for category context and the existing review card for working draft controls.
- **Current structure:** `.review-hero` → `.review-wrap` → `.context-nav`, eyebrow, `h1`, `.review-intro`; `.review-content` → `.review-card` / title list / review actions.
- **Functional contract:** preserve draft state, edit/remove actions, completion gate, and My Selection payload.
- **Responsive:** review cards/actions compact and stack at `600px`; remove actions retain a `44px` touch target.
- **Failure modes:** applying a visual replacement that resets title IDs, review links, draft state, or action semantics.

## 8. My Selection

- **Pages:** `order.html`.
- **Reference:** existing `.order-hero`, `.order-section`, and quantity controls.
- **Structure:** `.order-hero` → `.order-wrap` → `.order-nav`; `.order-section` → cards/summary/actions; existing mobile sticky action.
- **Functional contract:** shared selection persistence, separate individual-copy and kit-set counts, plus/minus/manual quantity controls, validation, component disclosure, Continue Browsing context, and Send Requirement navigation.
- **Responsive:** at `650px`, cards/actions stack and quantity controls are `44px` usable controls.
- **Failure modes:** a new selection store, cart/checkout terminology, or hiding manual input/validation.

## 9. Requirement form

- **Pages:** `request.html`.
- **Reference:** current request form and the workflow rules in `docs/04-ui-ux-specification.md`.
- **Structure:** request hero/navigation, form cards/fields, secondary Back and navy Review Requirement action.
- **Functional contract:** preserve conditional required fields, validation, session draft, privacy link, source-aware navigation, and selection summary.
- **Responsive:** fields and actions must remain fully visible and keyboard usable; do not add whitespace that separates validation from its field.

## 10. Pre-submission review

- **Pages:** `review-request.html`.
- **Reference:** existing review layout and request form navigation.
- **Structure:** workflow hero/navigation, review sections, confirmation action.
- **Functional contract:** retain request payload review, edit routes, validation boundary, and no duplicate submission affordance.
- **Exception:** the final successful-submission page can retain its confirmation-first composition, but still requires branding, accessibility, and mobile usability.

## Kit diagnosis and smallest approved next step

### Standard Kit

**Verified root cause:** `js/catalogue-source-links.js` selects Early Learning tone only when the pathname matches `early-learning` or `kit-`. `standard-kit.html` matches neither: it contains `-kit`, not `kit-`. The script therefore sets `data-catalogue-tone="catalogue"`; `css/inner-pages-refinement.css` consequently supplies neutral/navy `--inner-*` values. `standard-kit.html` does have the repaired `.page-hero` / `.hero-inner` structure and `stage-level-page` treatment, so its centered alignment is not the problem.

**Implemented correction:** the shared tone resolver explicitly classifies `standard-kit.html` as Early Learning. Existing `--inner-accent`, `--inner-wash`, and `--inner-border` now colour the eyebrow, heading line, hero wash, and contextual action border. `.kit-main` remains the approved shared content background `#F2F6FA`; kit lists, selection, and server data are unchanged.

### Custom Kit builder and review

**Verified root cause:** `kit-builder.html` is correctly classified by the existing `kit-` matcher, but its local `.kit-hero` is not included in the shared inner-page hero selector `:is(.page-hero,.stage-hero,.browse-hero)`. It keeps an inline white hero and `clamp(34px,5vw,52px)` heading. Its `h1` is only given the generic mobile rule, not the approved listing/stage accent structure. `kit-review.html` has the analogous legacy `.review-hero` structure.

**Implemented correction:** the shared refinement promotes the existing builder and review introductory nodes to the Individual Books `.page-hero` + `.hero-inner` pattern, preserving their legacy classes, element IDs, `context-nav`, form fields, fixed review bar, draft/state scripts, and content sections. The existing Early Learning tone applies without kit-only CSS. Manual desktop/mobile acceptance remains required; Custom Kit business logic is unchanged.

## Structural regression prevention

Add DOM-structure tests around rendered documents/refinement output, not class-name string searches alone:

1. For each inner-page pattern, assert that the contextual navigation precedes eyebrow/title and all belong to the expected hero wrapper and inner container.
2. Run `catalogue-source-links.js` in a DOM fixture for representative routes; assert the expected `data-catalogue-tone`, `catalogue-inner-page`, and `stage-level-page` classification.
3. Assert that Standard Kit and Custom Kit preserve their required IDs, controls, heading sequence, component/list container, and footer after future structural changes.
4. Assert breadcrumb and contextual Back elements have an actual parent-stage destination for each kit stage; verify source query propagation separately.
5. Assert listing and kit content uses the existing main content wrappers rather than nested page-width wrappers that defeat the shared max width.
6. Add visual/manual checks at the breakpoints in `docs/06-catalogue-design-system.md`; DOM tests cannot detect clipping, visual balance, or real touch usability.
