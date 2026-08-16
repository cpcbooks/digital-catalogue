/* Cambridge Digital Catalogue — catalogue data validator */
(function () {
  "use strict";

  const VALID_CATEGORIES = new Set([
    "school",
    "exam",
    "early-learning"
  ]);

  const VALID_LEVELS = new Set([
    "nursery",
    "lkg",
    "ukg"
  ]);

  const VALID_CLASSES = new Set([
    1, 2, 3, 4, 5,
    6, 7, 8, 9, 10
  ]);

  function issue(
    severity,
    code,
    message,
    book,
    index
  ) {
    return {
      severity,
      code,
      message,
      index,

      id:
        book && book.id
          ? book.id
          : "",

      title:
        book && book.title
          ? book.title
          : ""
    };
  }

  function textOrEmpty(value) {
    return (
      value === undefined ||
      value === null ||
      typeof value === "string"
    );
  }

  function validateCatalogue(records) {
    const errors = [];
    const warnings = [];
    const info = [];

    if (!Array.isArray(records)) {
      errors.push(
        issue(
          "error",
          "CATALOGUE_NOT_ARRAY",
          "CAMBRIDGE_CATALOGUE must be an array.",
          null,
          -1
        )
      );

      return {
        valid: false,
        errors,
        warnings,
        info,

        summary: {
          records: 0,
          errors: 1,
          warnings: 0,
          info: 0
        }
      };
    }

    const ids = new Map();
    const skus = new Map();
    const isbns = new Map();

    records.forEach(
      (book, index) => {

        /*
         * RECORD SHAPE
         */
        if (
          !book ||
          typeof book !== "object" ||
          Array.isArray(book)
        ) {
          errors.push(
            issue(
              "error",
              "INVALID_RECORD",
              "Catalogue record must be an object.",
              book,
              index
            )
          );

          return;
        }

        /*
         * ID
         */
        if (
          typeof book.id !== "string" ||
          !book.id.trim()
        ) {
          errors.push(
            issue(
              "error",
              "MISSING_ID",
              "Every catalogue record requires a permanent id.",
              book,
              index
            )
          );
        } else {
          const id =
            book.id.trim();

          if (ids.has(id)) {
            errors.push(
              issue(
                "error",
                "DUPLICATE_ID",
                'Duplicate id "' +
                  id +
                  '".',
                book,
                index
              )
            );
          } else {
            ids.set(
              id,
              index
            );
          }
        }

        /*
         * TITLE
         */
        if (
          typeof book.title !== "string" ||
          !book.title.trim()
        ) {
          errors.push(
            issue(
              "error",
              "MISSING_TITLE",
              "Every catalogue record requires a title.",
              book,
              index
            )
          );
        }

        /*
         * CATEGORY
         */
        if (
          !VALID_CATEGORIES.has(
            book.category
          )
        ) {
          errors.push(
            issue(
              "error",
              "INVALID_CATEGORY",
              'category must be "school", "exam", or "early-learning".',
              book,
              index
            )
          );
        }

        /*
         * ACTIVE FLAG
         */
        if (
          book.active !== undefined &&
          typeof book.active !== "boolean"
        ) {
          errors.push(
            issue(
              "error",
              "INVALID_ACTIVE",
              "active must be true or false.",
              book,
              index
            )
          );
        }

        /*
         * TEXT FIELDS
         */
        [
          "sku",
          "isbn",
          "series",
          "family",
          "subject",
          "displaySubject",
          "medium",
          "type",
          "cover",
          "description"
        ].forEach(
          field => {

            if (
              !textOrEmpty(
                book[field]
              )
            ) {
              errors.push(
                issue(
                  "error",
                  "INVALID_" +
                    field.toUpperCase(),
                  field +
                    " must be text or empty.",
                  book,
                  index
                )
              );
            }
          }
        );

        /*
         * SKU
         *
         * Missing SKU is allowed
         * for now.
         */
        if (
          typeof book.sku ===
            "string" &&
          book.sku.trim()
        ) {
          const sku =
            book.sku
              .trim()
              .toUpperCase();

          if (skus.has(sku)) {
            errors.push(
              issue(
                "error",
                "DUPLICATE_SKU",
                'Duplicate SKU "' +
                  book.sku.trim() +
                  '".',
                book,
                index
              )
            );
          } else {
            skus.set(
              sku,
              index
            );
          }
        } else {
          info.push(
            issue(
              "info",
              "SKU_PENDING",
              "SKU is not populated yet.",
              book,
              index
            )
          );
        }

        /*
         * ISBN
         *
         * Missing ISBN is allowed.
         */
        if (
          typeof book.isbn ===
            "string" &&
          book.isbn.trim()
        ) {
          const isbn =
            book.isbn.replace(
              /[\s-]/g,
              ""
            );

          if (
            !/^(?:\d{10}|\d{13})$/.test(
              isbn
            )
          ) {
            warnings.push(
              issue(
                "warning",
                "ISBN_FORMAT",
                "ISBN should contain 10 or 13 digits after spaces/hyphens are removed.",
                book,
                index
              )
            );
          }

          if (
            isbns.has(isbn)
          ) {
            errors.push(
              issue(
                "error",
                "DUPLICATE_ISBN",
                'Duplicate ISBN "' +
                  book.isbn.trim() +
                  '".',
                book,
                index
              )
            );
          } else {
            isbns.set(
              isbn,
              index
            );
          }
        } else {
          info.push(
            issue(
              "info",
              "ISBN_PENDING",
              "ISBN is not populated yet.",
              book,
              index
            )
          );
        }

        /*
         * MRP
         *
         * null / blank is currently
         * allowed because verified
         * pricing is not yet loaded.
         */
        if (
          book.mrp === undefined ||
          book.mrp === null ||
          book.mrp === ""
        ) {
          info.push(
            issue(
              "info",
              "MRP_PENDING",
              "MRP is not populated yet.",
              book,
              index
            )
          );
        } else if (
          typeof book.mrp !==
            "number" ||
          !Number.isFinite(
            book.mrp
          ) ||
          book.mrp < 0
        ) {
          errors.push(
            issue(
              "error",
              "INVALID_MRP",
              "mrp must be a non-negative number or null.",
              book,
              index
            )
          );
        }

        /*
         * EARLY LEARNING RULES
         */
        if (
          book.category ===
          "early-learning"
        ) {

          /*
           * Early Learning does not
           * use school class numbers.
           */
          if (
            book.class !== null &&
            book.class !== undefined
          ) {
            errors.push(
              issue(
                "error",
                "EARLY_LEARNING_CLASS",
                "Early Learning records must not use a school class number.",
                book,
                index
              )
            );
          }

          /*
           * levels must always exist
           * for Early Learning.
           *
           * [] is valid and means
           * mapping still pending.
           */
          if (
            !Array.isArray(
              book.levels
            )
          ) {
            errors.push(
              issue(
                "error",
                "LEVELS_REQUIRED",
                "Early Learning records require a levels array.",
                book,
                index
              )
            );
          } else {

            const seen =
              new Set();

            book.levels.forEach(
              level => {

                if (
                  !VALID_LEVELS.has(
                    level
                  )
                ) {
                  errors.push(
                    issue(
                      "error",
                      "INVALID_LEVEL",
                      'Invalid Early Learning level "' +
                        level +
                        '".',
                      book,
                      index
                    )
                  );
                }

                if (
                  seen.has(level)
                ) {
                  warnings.push(
                    issue(
                      "warning",
                      "DUPLICATE_LEVEL",
                      'Level "' +
                        level +
                        '" is repeated.',
                      book,
                      index
                    )
                  );
                }

                seen.add(level);
              }
            );

            /*
             * Empty array is not an
             * error.
             *
             * It deliberately means
             * mapping not yet confirmed.
             */
            if (
              book.levels.length === 0
            ) {
              info.push(
                issue(
                  "info",
                  "LEVEL_MAPPING_PENDING",
                  "Nursery/LKG/UKG mapping is intentionally pending.",
                  book,
                  index
                )
              );
            }
          }

        } else {

          /*
           * School + Exam records
           * require Class 1–10.
           */
          if (
            !VALID_CLASSES.has(
              Number(
                book.class
              )
            )
          ) {
            errors.push(
              issue(
                "error",
                "INVALID_CLASS",
                "School and Exam records require class 1–10.",
                book,
                index
              )
            );
          }

          /*
           * Early Learning levels
           * normally should not
           * appear on these records.
           */
          if (
            book.levels !==
              undefined &&
            Array.isArray(
              book.levels
            ) &&
            book.levels.length
          ) {
            warnings.push(
              issue(
                "warning",
                "UNEXPECTED_LEVELS",
                "School/Exam records should not normally contain Early Learning levels.",
                book,
                index
              )
            );
          }
        }

        /*
         * FEATURES
         */
        if (
          book.features !==
          undefined
        ) {
          if (
            !Array.isArray(
              book.features
            ) ||
            book.features.some(
              value =>
                typeof value !==
                "string"
            )
          ) {
            errors.push(
              issue(
                "error",
                "INVALID_FEATURES",
                "features must be an array of text values.",
                book,
                index
              )
            );
          }
        }

        /*
         * IMAGES
         */
        if (
          book.images !==
          undefined
        ) {
          if (
            !book.images ||
            typeof book.images !==
              "object" ||
            Array.isArray(
              book.images
            )
          ) {
            errors.push(
              issue(
                "error",
                "INVALID_IMAGES",
                "images must be an object.",
                book,
                index
              )
            );
          } else {

            if (
              !textOrEmpty(
                book.images.front
              ) ||
              !textOrEmpty(
                book.images.back
              )
            ) {
              errors.push(
                issue(
                  "error",
                  "INVALID_IMAGE_PATH",
                  "images.front and images.back must be text or empty.",
                  book,
                  index
                )
              );
            }

            if (
              book.images.samples !==
                undefined &&
              (
                !Array.isArray(
                  book.images.samples
                ) ||
                book.images.samples.some(
                  value =>
                    typeof value !==
                    "string"
                )
              )
            ) {
              errors.push(
                issue(
                  "error",
                  "INVALID_SAMPLE_IMAGES",
                  "images.samples must be an array of image paths.",
                  book,
                  index
                )
              );
            }
          }
        }

        /*
         * FRONT COVER
         *
         * Missing image is currently
         * informational only.
         */
        if (
          !book.cover &&
          !(
            book.images &&
            book.images.front
          )
        ) {
          info.push(
            issue(
              "info",
              "COVER_PENDING",
              "Front cover is not populated yet.",
              book,
              index
            )
          );
        }

        /*
         * DESCRIPTION
         */
        if (
          !book.description
        ) {
          info.push(
            issue(
              "info",
              "DESCRIPTION_PENDING",
              "Description is not populated yet.",
              book,
              index
            )
          );
        }

        /*
         * FAMILY / SERIES
         *
         * Currently allowed because
         * Exam Preparation relies on
         * family for grouping.
         *
         * We can migrate this later.
         */
        if (
          book.family &&
          book.series &&
          book.family ===
            book.series
        ) {
          warnings.push(
            issue(
              "warning",
              "REDUNDANT_FAMILY",
              "family duplicates series. Keep this temporarily for compatibility, but migrate later.",
              book,
              index
            )
          );
        }
      }
    );

    return {
      valid:
        errors.length === 0,

      errors,
      warnings,
      info,

      summary: {
        records:
          records.length,

        errors:
          errors.length,

        warnings:
          warnings.length,

        info:
          info.length
      }
    };
  }

  /*
   * Print validation report
   * only in browser developer console.
   *
   * It does NOT show anything
   * to catalogue customers.
   */
  function printReport(
    report
  ) {
    const s =
      report.summary;

    const label =
      report.valid
        ? "PASS"
        : "FAIL";

    console.groupCollapsed(
      "Cambridge Catalogue Validation: " +
        label +
        " | " +
        s.records +
        " records" +
        " | " +
        s.errors +
        " errors" +
        " | " +
        s.warnings +
        " warnings" +
        " | " +
        s.info +
        " pending/info"
    );

    if (
      report.errors.length
    ) {
      console.table(
        report.errors
      );
    }

    if (
      report.warnings.length
    ) {
      console.table(
        report.warnings
      );
    }

    console.log(
      "Pending SKU/ISBN/MRP/covers/descriptions and unconfirmed Early Learning mappings are informational, not validation failures."
    );

    console.groupEnd();
  }

  /*
   * Run validator.
   */
  function run(records) {
    const report =
      validateCatalogue(
        records === undefined
          ? window.CAMBRIDGE_CATALOGUE
          : records
      );

    /*
     * Store latest report so it
     * can later be inspected,
     * exported, or used by an
     * admin/data-import workflow.
     */
    window.CAMBRIDGE_CATALOGUE_VALIDATION =
      report;

    printReport(
      report
    );

    return report;
  }

  /*
   * Public API
   */
  window.CambridgeCatalogueValidator =
    Object.freeze({
      validate:
        validateCatalogue,

      run
    });

  /*
   * Auto-run only when catalogue
   * data is already present.
   *
   * Validation does NOT modify,
   * filter, or block catalogue data.
   */
  if (
    Array.isArray(
      window.CAMBRIDGE_CATALOGUE
    )
  ) {
    run(
      window.CAMBRIDGE_CATALOGUE
    );
  }
})();
