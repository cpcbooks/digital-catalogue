# digital-catalogue
Digital publication catalogue for Cambridge Publishing Company Pvt. Ltd.

## Publication image operations

Use the approval-gated uploader documentation at [docs/PUBLICATION-IMAGE-UPLOADER.md](docs/PUBLICATION-IMAGE-UPLOADER.md). Its input is `CPC_Publication_Images.zip`, which contains `SKU Book Title` folders; do not use the separate `CPC_Cover_Uploader_Pilot.zip` starter-code archive as image input.

For an approved, narrowly scoped recovery, use the documented `--skus CPC00001,CPC00002` selector. It limits both planning and writes to those exact SKUs; run its dry run before adding `--apply --confirm-upload`.

The approved 2026-11-06 image batch and its three-SKU recovery are recorded in [docs/PUBLICATION-IMAGE-UPLOAD-HISTORY.md](docs/PUBLICATION-IMAGE-UPLOAD-HISTORY.md). Final verification found 101 active primary covers with matching Storage objects; CPC00428–CPC00430 remain excluded until they are registered publications.
