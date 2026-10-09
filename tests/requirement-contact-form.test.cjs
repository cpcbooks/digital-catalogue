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
