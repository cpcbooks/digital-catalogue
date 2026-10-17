const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const migration = fs.readFileSync(path.resolve("supabase/migrations/20261017110000_align_publication_master_vocabulary.sql"), "utf8");

test("publication vocabulary migration retains existing values and adds the approved values", () => {
  for (const value of ["Textbook", "Reader", "Semester Book", "Workbook", "Writing Book", "Activity Book", "Drawing Book", "Rhymes Book", "Guide", "Combined Guide", "Question Bank", "Assessment Book", "Map Book", "Active", "Upcoming", "Inactive", "Discontinued", "Out of Print", "Archived"]) {
    assert.match(migration, new RegExp(`'${value}'`));
  }
  assert.match(migration, /drop constraint if exists publications_book_type_check/);
  assert.match(migration, /drop constraint if exists publications_status_check/);
  assert.doesNotMatch(migration, /\b(update|delete|insert)\b/i);
});
