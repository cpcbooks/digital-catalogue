# Publication image uploader

`scripts/upload-publication-assets.mjs` is an internal bulk tool. It reads folders named `SKU Book Title` from a directory or ZIP and supports JPG, JPEG, PNG and WebP. It never creates a publication, changes publication metadata, deletes an object, overwrites an object, or patches an existing asset record.

New front covers use `<publication-UUID>/front.<original-extension>`. Explicitly named `back`/`rear` images use `back.<original-extension>`; explicitly named `sample`, `inside`, or `page` images use `samples/01.<original-extension>`, etc. A folder containing exactly one supported image treats that image as its front cover. Multiple unlabelled images are reported instead of guessed.

## Credentials

Set `SUPABASE_SERVICE_ROLE_KEY` only in the calling shell or secure secret store. Do not put it in a ZIP, report, source file, browser configuration, or Git. The tool defaults to the CPC Supabase URL and `publication-assets`; `SUPABASE_URL` and `SUPABASE_ASSET_BUCKET` can override those for a non-production environment.

## Dry run

Dry runs are the default and make read-only requests for SKU-to-UUID mapping, existing `publication_assets` rows, and the proposed Storage path. They write no Storage or database changes.

```powershell
$env:SUPABASE_SERVICE_ROLE_KEY = "<secure service-role key>"
node scripts/upload-publication-assets.mjs --input C:\secure\CPC_Cover_Uploader_Pilot.zip --pilot --report reports\cpc00015-cpc00019-dry-run.csv
```

`--pilot` selects only front covers for CPC00015 through CPC00019. The report includes SKU, UUID, SHA-256, source, destination, collision result, and proposed Storage/database operation. A missing mapping—for example CPC00428–CPC00430—produces `ERROR_PUBLICATION_NOT_FOUND`; it is never inserted.

Review every row before proceeding. `READY` means the tool proposes `UPLOAD` plus `INSERT`; `SKIP_*` means it found an existing object or active asset and will leave it unchanged; `ERROR_*` requires source or data correction.

## Approved pilot execution

Only after CPC approves the dry-run CSV, execute the same command with both write guards:

```powershell
node scripts/upload-publication-assets.mjs --input C:\secure\CPC_Cover_Uploader_Pilot.zip --pilot --report reports\cpc00015-cpc00019-pilot.csv --apply --confirm-upload
```

The uploader posts Storage objects with `x-upsert: false`, verifies the object exists and its SHA-256 matches the source, inserts one `publication_assets` row, then verifies registration. Re-running it is idempotent: it sees the registered path and reports `SKIP_REGISTERED`. It does not overwrite or repair conflicting pre-existing files/records.

## Audit history and rollback

Keep the dry-run and applied CSV files with the branch/release record and append the run to `PUBLICATION-IMAGE-UPLOAD-HISTORY.md`: date/time, input archive identity, SKU counts, skips, failures, verification result, approval reference, and report path. Do not log credentials. No automatic rollback exists, because deleting an object or record risks removing an established asset. If an approved upload must be reverted, first identify the report row and current linked asset, then perform a separately approved manual Storage/metadata change and record it in the history ledger.

## Full batch

After the pilot is accepted, omit `--pilot` and run another dry run first. Use `--apply --confirm-upload` only with explicit approval. ZIP extraction uses the Windows-provided `tar` command and happens in a temporary directory that is removed when the command completes.
