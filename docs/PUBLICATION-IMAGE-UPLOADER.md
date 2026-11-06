# Publication image uploader

`scripts/upload-publication-assets.mjs` is an internal bulk tool. It reads folders named `SKU Book Title` from a directory or ZIP and supports JPG, JPEG, PNG and WebP. It never creates a publication, changes publication metadata, deletes an object, overwrites an object, or patches an existing asset record.

New front covers use `<publication-UUID>/front.<original-extension>`. Explicitly named `back`/`rear` images use `back.<original-extension>`; explicitly named `sample`, `inside`, or `page` images retain a normalized source filename under `samples/` (for example `sample-01.jpg` becomes `samples/sample-01.jpg`). This makes sample paths stable across repeated batches. Numbered sample names determine `sort_order`; use unique `sample-01`, `sample-02`, … names. A folder containing exactly one supported image treats that image as its front cover. Multiple unlabelled images are reported instead of guessed.

## Credentials

Set `SUPABASE_SERVICE_ROLE_KEY` only in the calling shell or secure secret store. Do not put it in a ZIP, report, source file, browser configuration, or Git. The tool defaults to the CPC Supabase URL and `publication-assets`; `SUPABASE_URL` and `SUPABASE_ASSET_BUCKET` can override those for a non-production environment.

## Dry run

Dry runs are the default and make read-only requests for SKU-to-UUID mapping, existing `publication_assets` rows, and the proposed Storage path. They write no Storage or database changes.

```powershell
$env:SUPABASE_SERVICE_ROLE_KEY = "<secure service-role key>"
node scripts/upload-publication-assets.mjs --input "E:\Digital Catalogue\CPC_Publication_Images.zip" --pilot --report reports\cpc00015-cpc00019-dry-run.csv
```

`--pilot` selects only front covers for CPC00015 through CPC00019 and fails if any of those five is missing. The report includes SKU, UUID, SHA-256, source, destination, collision result, and proposed Storage/database operation. Full batches explicitly skip the currently unregistered CPC00428–CPC00430 with `SKIP_EXCLUDED_UNREGISTERED_SKU`; any other missing SKU, invalid image, ambiguous image, or duplicate front/back input is a blocking error and is never inserted.

Review every row before proceeding. `READY` means the tool proposes `UPLOAD` plus `INSERT`; `SKIP_*` means it found an existing object or active asset and will leave it unchanged; `ERROR_*` requires source or data correction.

## Approved pilot execution

Only after CPC approves the dry-run CSV, execute the same command with both write guards:

```powershell
node scripts/upload-publication-assets.mjs --input "E:\Digital Catalogue\CPC_Publication_Images.zip" --pilot --report reports\cpc00015-cpc00019-pilot.csv --apply --confirm-upload
```

The uploader rechecks Storage and `publication_assets` immediately before each write, posts Storage objects with `x-upsert: false`, verifies the object exists and its SHA-256 matches the source, inserts one `publication_assets` row, then verifies registration. If upload verification succeeds but registration fails, the applied CSV records `ERROR_REGISTRATION_FAILED_RECOVERABLE`. A rerun can register only that exact unlinked object after hashing it again; mismatched bytes remain a blocking error. Existing linked assets—including the original eight Storage files and four linked asset rows—are skipped and never changed.

## Audit history and rollback

Keep the dry-run and applied CSV files with the branch/release record and append the run to `PUBLICATION-IMAGE-UPLOAD-HISTORY.md`: date/time, input archive identity, SKU counts, skips, failures, verification result, approval reference, and report path. The CSV is written after the final per-row state, including partial failures. Do not log credentials. No automatic rollback exists, because deleting an object or record risks removing an established asset. If an approved upload must be reverted, first identify the report row and current linked asset, then perform a separately approved manual Storage/metadata change and record it in the history ledger.

## Full batch

After the pilot is accepted, omit `--pilot` and run another dry run first. Use `--apply --confirm-upload` only with explicit approval. ZIP extraction uses the Windows-provided `tar` command and happens in a temporary directory that is removed when the command completes.
