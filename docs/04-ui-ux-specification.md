# UI/UX Specification — Reconciled Development Notes

## Status

This focused document reconciles the accepted IM-12C production behaviour with IM-14A development work. It does not replace the historical specification retained in the previous development checkout. IM-14A is not deployed.

## Publication listings

- All Books and category listings use the shared vertical publication-card grid.
- A card places its cover, title, metadata, MRP, View Book action and Selection action in that order. Text is left aligned; covers are centred.
- The grid uses four columns where the content width supports it, three at medium desktop widths, two through 390px mobile widths, and one at 359px and below. Cards keep actions at their bottom without clipping content.
- Existing search, filters, subject grouping, URL state, selection state and return behaviour remain unchanged.

## Cover presentation

- Real front covers preserve their own aspect ratio with contained rendering; they are never cropped, stretched or rotated.
- A missing or failed cover is a blank light-grey portrait placeholder, centred inside the compact media region. It carries no SKU, caption, icon or substitute artwork. Listing media regions are 200px desktop, 180px medium desktop/tablet, 165px mobile, and 150px at narrow mobile; the placeholder is 140px desktop and 110px mobile.
- Book Details retains its gallery and uses the same blank placeholder rule. IM-12B.1 optional-metadata handling remains: absent optional values are omitted and valid values remain visible.

## Scope boundary

Homepage refinement is deferred. My Selection retains its existing selection-specific controls and workflow.
