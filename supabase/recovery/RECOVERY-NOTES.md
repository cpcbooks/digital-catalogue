# Backend metadata recovery snapshot

- Capture date: 2026-09-29 20:57:41 IST (UTC+05:30)
- Source project: CPC Digital Catalogue (`ysaxagxortpxyifyaydx`)
- Supabase CLI: `2.118.0`
- Method: authenticated `supabase db query --linked --project-ref ysaxagxortpxyifyaydx --output-format json`, using one-line `SELECT` statements only.

These files are recovery snapshots, **not migration files**. No production table rows were intentionally captured. In particular, no rows from `public.requests`, `public.request_items`, `public.request_kit_components`, `public.product_mappings`, `public.publications`, `public.publication_assets`, or `storage.objects` were queried.

## Artifact purposes

- `tables.json` — public base-table names and types from `information_schema.tables`.
- `columns.json` — public-column types, nullability, defaults, and identity/generated metadata from `information_schema.columns`.
- `constraints.json` — public-table PK/FK/unique/check metadata and `pg_get_constraintdef` definitions.
- `indexes.json` — public-table index metadata and `pg_get_indexdef` definitions.
- `enums.json` — public enum labels and order from `pg_type` and `pg_enum`.
- `views.json` — public ordinary-view definitions from `information_schema.views` and materialized-view definitions from `pg_matviews`.
- `functions.json` — public function/procedure signatures, execution attributes, and `pg_get_functiondef` definitions.
- `triggers.json` — non-internal public triggers and `pg_get_triggerdef` definitions.
- `rls-status.json` — public-table row-security status from `pg_class`.
- `policies.json` — public-schema policy metadata from `pg_policies`.
- `table-grants.json` — public relation privileges from `information_schema.role_table_grants`.
- `routine-grants.json` — public routine privileges from `information_schema.role_routine_grants`.
- `default-acls.json` — applicable default ACL metadata from `pg_default_acl`.
- `extensions.json` — installed extension metadata from `pg_extension`.
- `storage-bucket.json` — the permitted metadata fields for `storage.buckets` row `publication-assets` only.
- `storage-rls-status.json` — row-security status for `storage.objects` and `storage.buckets`.
- `storage-policies.json` — policies for `storage.objects` and `storage.buckets`; no object rows.
- `storage-grants.json` — relation privileges for `storage.objects` and `storage.buckets`.

The CLI required the existing local link record together with `--linked`; no remote object, migration history, policy, bucket, function, or table was changed.
