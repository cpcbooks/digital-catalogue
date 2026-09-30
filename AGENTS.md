# CPC Digital Catalogue

## Product

- Digital Catalogue, not an e-commerce or online-ordering portal.
- Catalogue browsing is primary; My Selection is not a cart, and Send Requirement is an optional add-on, not checkout.
- MRP may be displayed. Public catalogue browsing and available samples require no customer login.
- Dealer/school discount logic does not belong in the public catalogue.

## Early Learning / Custom Kit

- Stages: Playgroup, Nursery, LKG, UKG.
- Custom Kit is Early Learning-only where stage configuration enables it.
- Kit minimums are configuration; never permanently hard-code 8.
- Nursery/LKG/UKG currently require 8 titles. Playgroup is enabled with a null minimum and completion disabled.
- An incomplete Kit is valid working state and must never accidentally become complete.
- Do not fabricate catalogue publications to satisfy UI behaviour.

## Architecture and data

- Preserve and evolve the existing HTML/CSS/browser-JS application; no rewrite or new framework without explicit approval.
- Supabase is the current backend/catalogue direction; static catalogue compatibility may remain during migration.
- Keep GitHub Pages delivery unless explicitly changed. Preserve localStorage and payload compatibility unless approved.
- Future ERP/order capability is not current scope.
- Never expose service-role/database secrets. Use only necessary data; no surveillance analytics.
- Never query or use production customer/request data for tests. Production Supabase changes and destructive operations require explicit approval.

## Development

- Prefer small changes, existing architecture, and synthetic fixtures.
- Run `node --test` after relevant application changes and `git diff --check` before commit.
- Do not install packages unless justified and approved.
- Do not touch `asset-import/`, `supabase/recovery/*.json`, or `supabase/schema/` unless explicitly requested.
- Never use `git add .` or `git add -A` when unrelated untracked files exist.
- Do not deploy, push tags, merge to the default branch, or modify production Supabase unless explicitly requested.
- Read only task-relevant files. Keep reports concise.
- If a task requires a major architectural change, stop and report before proceeding.
