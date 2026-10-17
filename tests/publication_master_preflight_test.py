import importlib.util
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location("preflight", Path("scripts/preflight-publication-master.py"))
PREFLIGHT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PREFLIGHT)

class PublicationMasterPreflightTests(unittest.TestCase):
    def values(self, **overrides):
        row = {header: "" for header in PREFLIGHT.HEADERS}
        row.update({"Catalogue Section": "School Learning", "Book Title": "Example", "Book Type": "Guide", "Status": "Active"})
        row.update(overrides)
        return [row[header] for header in PREFLIGHT.HEADERS]

    def codes(self, values):
        _, findings = PREFLIGHT.normalize_row(2, values)
        return {finding["code"] for finding in findings}

    def test_normalizes_all_schema_fields_without_identity(self):
        record, findings = PREFLIGHT.normalize_row(2, self.values(**{"Class/Stage": "5 | 6", "MRP": "120", "Pages": "128", "Length(cm)": "27.4", "Status": "Discontinued"}))
        self.assertEqual(record["class_stage"], ["5", "6"])
        self.assertEqual(record["mrp"], 120.0)
        self.assertEqual(record["pages"], 128)
        self.assertNotIn("id", record)
        self.assertFalse(any(finding["level"] == "error" for finding in findings))

    def test_rejects_guide_violations(self):
        codes = self.codes(self.values(**{"Class/Stage": "All", "ISBN": "978-9349872912", "MRP": "Rs 120", "Book Type": "Combined Guide", "Subject": "Science"}))
        self.assertTrue({"CLASS_STAGE", "ISBN", "NUMERIC", "COMBINED_GUIDE_SUBJECT"}.issubset(codes))

    def test_reports_schema_discrepancies_without_rejecting_guide_values(self):
        codes = self.codes(self.values(**{"Book Type": "Map Book", "Status": "Upcoming"}))
        self.assertTrue({"SCHEMA_BOOK_TYPE", "SCHEMA_STATUS"}.issubset(codes))

if __name__ == "__main__": unittest.main()
