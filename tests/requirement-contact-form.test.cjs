const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("Requirement contact controls reflect the existing conditional validation policy", () => {
  const request = read("request.html");

  assert.match(request, /id="mobile"[^>]*required[^>]*aria-required="true"/);
  assert.match(request, /id="emailRequirement"/);
  assert.match(request, /function updateContactRequirements\(\).*setRequired\("email",required\)/);
  assert.match(request, /function updateAdaptiveFields\(\).*setRequired\("whatsapp",separateWhatsapp\)/);
  assert.match(request, /preferredContact.*updateContactRequirements\(\);clearFieldError\("email"\);saveDraft\(\)/);
  assert.match(request, /if\(d\.preferredContact==="email"&&!d\.email\)/);
  assert.match(request, /if\(d\.preferredContact==="whatsapp"\)/);
  assert.match(request, /Mobile is required for every requirement/);
});

test("Requirement contact errors and saved-draft review validation are accessible", () => {
  const request = read("request.html");
  const review = read("review-request.html");

  assert.match(request, /<fieldset class="field full contact-preference" aria-describedby="contactHelp preferredContactError">/);
  assert.match(request, /id="emailError" role="status" aria-live="polite"/);
  assert.match(request, /input\.setAttribute\("aria-invalid","true"\)/);
  assert.match(request, /input\.setAttribute\("aria-invalid","false"\)/);
  assert.match(review, /function validEmail\(v\)/);
  assert.match(review, /if\(d\.email&&!validEmail\(d\.email\)\)return false/);
  assert.match(review, /if\(d\.preferredContact==="email"&&!validEmail\(d\.email\)\)return false/);
  assert.match(review, /!d\.whatsappSameAsMobile&&!validPhone\(d\.whatsapp\)/);
});

test("Requirement drafts are session-only, legacy contact data is removed, and Clear Details is guarded", () => {
  const request = read("request.html");
  const review = read("review-request.html");

  assert.match(request, /localStorage\.removeItem\(STORAGE_KEY\)/);
  assert.match(request, /sessionStorage\.setItem\(STORAGE_KEY,JSON\.stringify\(collectData\(\)\)\)/);
  assert.match(request, /sessionStorage\.getItem\(STORAGE_KEY\)/);
  assert.doesNotMatch(request, /localStorage\.getItem\(STORAGE_KEY\)/);
  assert.match(request, /<button type="button" id="clearDetailsButton" class="clear-details">Clear Details<\/button>/);
  assert.match(request, /window\.confirm\("Clear the contact details saved in this tab\?"\)/);
  assert.match(request, /sessionStorage\.removeItem\(ATTEMPT_KEY\)/);
  assert.match(review, /sessionStorage\.getItem\(REQUEST_KEY\)/);
  assert.doesNotMatch(review, /localStorage\.getItem\(REQUEST_KEY\)/);
});

test("Requirement actions keep the primary review control prominent without changing Clear Details semantics", () => {
  const request = read("request.html");

  assert.match(request, /Your contact details are saved temporarily while you complete this requirement\. You can clear them at any time\./);
  assert.match(request, /<div class="form-actions"><a href="order\.html" class="secondary">← Back to Selection<\/a><div class="form-actions-right"><button type="button" id="clearDetailsButton" class="clear-details">Clear Details<\/button><button type="submit" class="primary">Review Requirement →<\/button><\/div><\/div>/);
  assert.match(request, /\.form-actions-right\{display:flex;align-items:center;gap:10px\}/);
  assert.match(request, /\.clear-details\{padding:10px 8px;border:0;background:transparent/);
  assert.match(request, /@media\(max-width:650px\)\{\.form-actions\{display:grid;grid-template-columns:minmax\(0,1fr\) auto;gap:12px\}/);
  assert.match(request, /\.form-actions \.primary\{grid-column:1\/-1;grid-row:1;width:100%/);
});
