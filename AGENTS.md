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
- Before changing user-facing navigation, listing cards, Book Details, My Selection, Standard Kit, or Custom Kit, consult `docs/04-ui-ux-specification.md`, including the Interaction Behaviour Contract. Preserve accepted behaviour unless a change is explicitly approved.
- Do not install packages unless justified and approved.
- Do not touch `asset-import/`, `supabase/recovery/*.json`, or `supabase/schema/` unless explicitly requested.
- Never use `git add .` or `git add -A` when unrelated untracked files exist.
- Do not deploy, push tags, merge to the default branch, or modify production Supabase unless explicitly requested.
- Read only task-relevant files. Keep reports concise.
- If a task requires a major architectural change, stop and report before proceeding.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
