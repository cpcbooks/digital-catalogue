# Publication image upload history

Append one row for every dry run and every approved apply run. Do not record credentials. Production uploads require a reviewed dry-run report and explicit approval; a dry run is not an upload.

| Date/time (IST) | Run type | Source | SKU count | Ready/uploaded | Skipped | Failures | Verification | Report | Approval / notes |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| 2026-11-06 | Dry run — pilot | `CPC_Publication_Images.zip`, CPC00015–CPC00019 | 5 | 5 ready / 0 uploaded | 0 | 0 | UUID mappings, active-asset checks and public object-existence checks passed; SHA-256 recorded | `reports/cpc00015-cpc00019-dry-run.csv` | Phase A only; production pilot not approved or executed |
| 2026-11-06 | Revised dry run — pilot | `CPC_Publication_Images.zip`, CPC00015–CPC00019 | 5 | 5 ready / 0 uploaded | 0 | 0 | Required-pilot, collision, source hash and destination checks passed after recovery/sample handling review | `reports/cpc00015-cpc00019-dry-run.csv` | Phase A only; production pilot not approved or executed |

For an apply run, retain the applied CSV, record the post-upload Storage and `publication_assets` verification result, and note any separately approved rollback here.
