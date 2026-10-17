#!/usr/bin/env python3
"""Offline CPC Publication Master preflight. It never contacts Supabase."""
import argparse
import json
import re
import zipfile
from collections import defaultdict
from pathlib import Path
from xml.etree import ElementTree as ET

HEADERS = ["Catalogue Section", "Series", "Book Title", "Class/Stage", "Subject", "Medium", "Book Type", "Description", "SKU ID", "MRP", "ISBN", "Author", "Co Author", "Pages", "Length(cm)", "Breadth", "Thickness", "Weight(kg)", "Status"]
SECTIONS = {"Early Learning", "School Learning", "College and University", "Competitive Exams"}
STAGES = {"Nursery", "LKG", "UKG", *map(str, range(1, 11)), "1st PUC", "2nd PUC"}
SUBJECTS = {"English", "Kannada", "Hindi", "Mathematics", "Science", "Social Science", "Environmental Studies", "Grammar", "Economics"}
MEDIA = {"English", "Kannada"}
BOOK_TYPES = {"Textbook", "Guide", "Combined Guide", "Question Bank", "Workbook", "Activity Book", "Writing Book", "Drawing Book", "Reader", "Semester Book", "Assessment Book", "Rhymes Book", "Map Book"}
STATUSES = {"Active", "Upcoming", "Inactive", "Discontinued"}
SCHEMA_BOOK_TYPES = BOOK_TYPES - {"Map Book"}
SCHEMA_STATUSES = {"Active", "Discontinued", "Out of Print", "Archived"}
NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main", "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships", "p": "http://schemas.openxmlformats.org/package/2006/relationships", "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

def text(value):
    return "" if value is None else str(value).strip()

def column_number(reference):
    result = 0
    for char in re.match(r"[A-Z]+", reference).group(0): result = result * 26 + ord(char) - 64
    return result - 1

def shared_strings(archive):
    if "xl/sharedStrings.xml" not in archive.namelist(): return []
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    return ["".join(node.text or "" for node in item.findall(".//a:t", NS)) for item in root.findall("a:si", NS)]

def workbook_rows(path):
    with zipfile.ZipFile(path) as archive:
        shared = shared_strings(archive)
        sheet = "xl/worksheets/sheet1.xml"
        root = ET.fromstring(archive.read(sheet))
        rows = []
        for row in root.findall(".//a:sheetData/a:row", NS):
            values = []
            for cell in row.findall("a:c", NS):
                index = column_number(cell.attrib["r"])
                while len(values) <= index: values.append("")
                kind, value = cell.attrib.get("t"), cell.findtext("a:v", default="", namespaces=NS)
                if kind == "s": value = shared[int(value)]
                elif kind == "inlineStr": value = "".join(node.text or "" for node in cell.findall(".//a:t", NS))
                values[index] = value
            rows.append(values)
        return rows

def document_text(path):
    with zipfile.ZipFile(path) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
        return "\n".join(node.text or "" for node in root.findall(".//w:t", NS))

def verify_guides(data_guide, image_guide):
    data, images = document_text(data_guide), document_text(image_guide)
    required = ["Category and Language Position are not part of the V1 Publication Master", "Map Book", "Upcoming", "Inactive", "13 digits only"]
    image_required = ["complete Book Title", "front", "back", "sample-01", "sample-02"]
    missing = [value for value in required if value not in data] + [value for value in image_required if value not in images]
    return missing

def number(value, integer=False, positive=False):
    raw = text(value)
    if not raw: return None, None
    try:
        parsed = float(raw)
    except ValueError:
        return None, "must be a number only"
    if not parsed == parsed or parsed in (float("inf"), float("-inf")): return None, "must be finite"
    if integer and not parsed.is_integer(): return None, "must be a whole number"
    if positive and parsed <= 0: return None, "must be greater than zero"
    if not integer and parsed < 0: return None, "must not be negative"
    return int(parsed) if integer else parsed, None

def stages(value):
    raw = text(value)
    if not raw: return [], None
    values = [part.strip() for part in raw.split("|")]
    if not all(values) or any(value not in STAGES for value in values): return values, "must use approved stages separated by |"
    if len(set(values)) != len(values): return values, "must not repeat a stage"
    return values, None

def issue(level, code, row, field, message):
    return {"level": level, "code": code, "row": row, "field": field, "message": message}

def normalize_row(row_number, values):
    raw = {header: text(values[index]) if index < len(values) else "" for index, header in enumerate(HEADERS)}
    findings, normalized = [], {"source_row": row_number}
    for field in ("Catalogue Section", "Book Title", "Book Type", "Status"):
        if not raw[field]: findings.append(issue("error", "REQUIRED", row_number, field, "is required"))
    controls = [("Catalogue Section", SECTIONS), ("Subject", SUBJECTS), ("Medium", MEDIA), ("Book Type", BOOK_TYPES), ("Status", STATUSES)]
    for field, allowed in controls:
        if raw[field] and raw[field] not in allowed: findings.append(issue("error", "CONTROLLED_VALUE", row_number, field, "is not an approved value"))
    class_stage, error = stages(raw["Class/Stage"])
    if error: findings.append(issue("error", "CLASS_STAGE", row_number, "Class/Stage", error))
    if raw["Book Type"] == "Combined Guide" and raw["Subject"]: findings.append(issue("error", "COMBINED_GUIDE_SUBJECT", row_number, "Subject", "must be blank for Combined Guide"))
    isbn = raw["ISBN"]
    if isbn and not re.fullmatch(r"\d{13}", isbn): findings.append(issue("error", "ISBN", row_number, "ISBN", "must be 13 digits without spaces or hyphens"))
    if raw["SKU ID"]: findings.append(issue("warning", "SKU_PENDING", row_number, "SKU ID", "guide says to leave blank until the CPC SKU format is approved"))
    numeric = [("MRP", "mrp", False, False), ("Pages", "pages", True, True), ("Length(cm)", "length_cm", False, True), ("Breadth", "breadth_cm", False, True), ("Thickness", "thickness_cm", False, True), ("Weight(kg)", "weight_kg", False, True)]
    for field, target, integer, positive in numeric:
        value, error = number(raw[field], integer, positive)
        if error: findings.append(issue("error", "NUMERIC", row_number, field, error))
        normalized[target] = value
    normalized.update({
        "catalogue_section": raw["Catalogue Section"] or None, "series": raw["Series"] or None, "title": raw["Book Title"] or None,
        "class_stage": class_stage, "subject": raw["Subject"] or None, "medium": raw["Medium"] or None, "book_type": raw["Book Type"] or None,
        "description": raw["Description"] or None, "sku": raw["SKU ID"] or None, "isbn": isbn or None, "author": raw["Author"] or None,
        "co_author": raw["Co Author"] or None, "status": raw["Status"] or None
    })
    if normalized["book_type"] and normalized["book_type"] not in SCHEMA_BOOK_TYPES: findings.append(issue("warning", "SCHEMA_BOOK_TYPE", row_number, "Book Type", "accepted by the guide but absent from recovered publications constraint"))
    if normalized["status"] and normalized["status"] not in SCHEMA_STATUSES: findings.append(issue("warning", "SCHEMA_STATUS", row_number, "Status", "accepted by the guide but absent from recovered publications constraint"))
    return normalized, findings

def scan_assets(records, assets_dir):
    if not assets_dir: return [], []
    root = Path(assets_dir)
    findings, assets = [], []
    folders = [path for path in root.iterdir() if path.is_dir()]
    by_folded = defaultdict(list)
    for folder in folders: by_folded[folder.name.casefold()].append(folder)
    for record in records:
        matches = by_folded[record["title"].casefold()] if record["title"] else []
        if len(matches) != 1:
            findings.append(issue("warning", "ASSET_FOLDER", record["source_row"], "Book Title", "no exact title folder" if not matches else "ambiguous title-folder match")); continue
        files = {file.stem.lower(): file for file in matches[0].iterdir() if file.is_file() and file.suffix.lower() in {".png", ".jpg", ".jpeg"}}
        if "front" not in files: findings.append(issue("warning", "FRONT_COVER", record["source_row"], "Book Title", "front cover is required by the image guide"))
        for label, file in sorted(files.items()):
            if label == "front": kind, order = "cover", 0
            elif label == "back": kind, order = "back_cover", 0
            elif re.fullmatch(r"sample-\d{2}", label): kind, order = "sample_page", int(label[-2:])
            else: continue
            assets.append({"source_row": record["source_row"], "title": record["title"], "asset_type": kind, "sort_order": order, "file": str(file)})
    return assets, findings

def main():
    parser = argparse.ArgumentParser(description="Offline CPC Publication Master preflight; no Supabase access.")
    parser.add_argument("workbook", type=Path); parser.add_argument("--data-guide", required=True, type=Path); parser.add_argument("--image-guide", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path); parser.add_argument("--assets-dir", type=Path)
    args = parser.parse_args()
    for path in (args.workbook, args.data_guide, args.image_guide):
        if not path.is_file(): parser.error("missing required input: " + str(path))
    guide_missing = verify_guides(args.data_guide, args.image_guide)
    rows = workbook_rows(args.workbook)
    headers = [text(value) for value in (rows[0] if rows else [])]
    findings = [issue("error", "HEADERS", 1, "headers", "must exactly match the approved 19-column format")] if headers != HEADERS else []
    if guide_missing: findings += [issue("error", "GUIDE", 0, "guide", "missing expected guide text: " + value) for value in guide_missing]
    records = []
    for index, row in enumerate(rows[1:], start=2):
        if not any(text(value) for value in row): continue
        normalized, row_findings = normalize_row(index, row); records.append(normalized); findings.extend(row_findings)
    titles = defaultdict(list)
    for record in records:
        if record["title"]: titles[record["title"].casefold()].append(record["source_row"])
    for source_rows in titles.values():
        if len(source_rows) > 1: findings.append(issue("warning", "DUPLICATE_TITLE", source_rows[0], "Book Title", "same-title candidate rows: " + ", ".join(map(str, source_rows))))
    assets, asset_findings = scan_assets(records, args.assets_dir); findings.extend(asset_findings)
    asset_notes = ["Asset scan not requested: pass --assets-dir after CPC supplies image folders."] if not args.assets_dir else []
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / "normalized-publications.json").write_text(json.dumps({"source": str(args.workbook), "identity": "No UUIDs created or matched.", "custom_kit": "Not decided by this adapter.", "records": records}, indent=2) + "\n", encoding="utf-8")
    report = {"source": str(args.workbook), "headers": headers, "record_count": len(records), "findings": findings, "current_importer_does_not_persist": ["description", "author", "co_author", "pages", "length_cm", "breadth_cm", "thickness_cm", "weight_kg", "source Status", "all-section class/stage values"], "schema_discrepancies": ["Map Book is guide-approved but absent from recovered book_type constraint.", "Upcoming and Inactive are guide-approved but absent from recovered status constraint."], "identity": "No UUID assignment, existing-record matching, merge, retirement, or import was attempted.", "kit_decisions": "Custom Kit eligibility and Standard Kit composition require separate CPC review.", "asset_notes": asset_notes}
    (args.output_dir / "validation-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    (args.output_dir / "asset-preview.json").write_text(json.dumps(assets, indent=2) + "\n", encoding="utf-8")
    summary = ["# CPC Publication Master preflight", "", f"Records: {len(records)}", f"Errors: {sum(item['level'] == 'error' for item in findings)}", f"Warnings: {sum(item['level'] == 'warning' for item in findings)}", "", "No UUID, Supabase, kit, or retirement operation was performed.", "", "## Findings", ""]
    summary += [f"- {item['level'].upper()} row {item['row']} {item['field']}: {item['message']}" for item in findings] or ["- None"]
    (args.output_dir / "validation-report.md").write_text("\n".join(summary) + "\n", encoding="utf-8")

if __name__ == "__main__": main()
