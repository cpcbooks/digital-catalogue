const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("Privacy Notice contains the approved contact information and seven sections", () => {
  const privacy = read("privacy.html");

  assert.match(privacy, /<title>Privacy Notice \| Cambridge Digital Catalogue<\/title>/);
  assert.match(privacy, /<a href="index\.html">Home<\/a>/);
  for (const heading of ["Information We Collect", "How We Use Your Information", "Temporary Browser Storage", "Data Retention", "Information Sharing", "Your Privacy Requests", "Contact"]) {
    assert.match(privacy, new RegExp(`<h2>\\d\\. ${heading}<\\/h2>`));
  }
  assert.match(privacy, /href="mailto:cpcbooksindia@gmail\.com"/);
  assert.match(privacy, /Automated deletion controls are being prepared and are not yet active\./);
});

test("Privacy links use the shared footer convention and do not change requirement actions", () => {
  const sourceLinks = read("js/catalogue-source-links.js");
  const request = read("request.html");
  const css = read("css/catalogue.css");

  assert.match(sourceLinks, /link\.href = bootstrap \? bootstrap\.withSource\("privacy\.html"\) : "privacy\.html"/);
  assert.match(sourceLinks, /link\.textContent = "Privacy Notice"/);
  assert.match(css, /\.footer-meta a:focus-visible/);
  assert.match(request, /You can clear them at any time\. Read our <a href="privacy\.html">Privacy Notice<\/a>\./);
  assert.match(request, /<button type="submit" class="primary">Review Requirement →<\/button>/);
});
