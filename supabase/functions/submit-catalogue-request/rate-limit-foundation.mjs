const hex = (bytes) => Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");

function canonicalIpv4(value) {
  const parts = value.split(".");
  if (parts.length !== 4 || !parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255)) return null;
  return parts.map((part) => String(Number(part))).join(".");
}

function canonicalIpv6(value) {
  if (!/^[0-9a-f:]+$/i.test(value) || value.split("::").length > 2) return null;
  const compressed = value.includes("::");
  const [left, right] = value.split("::");
  const leftParts = left ? left.split(":") : [];
  const rightParts = right ? right.split(":") : [];
  if (![...leftParts, ...rightParts].every((part) => /^[0-9a-f]{1,4}$/i.test(part))) return null;
  if (!compressed && leftParts.length !== 8) return null;
  if (compressed && leftParts.length + rightParts.length >= 8) return null;
  const groups = [...leftParts, ...Array(8 - leftParts.length - rightParts.length).fill("0"), ...rightParts]
    .map((part) => Number.parseInt(part, 16));
  let bestStart = -1, bestLength = 0, start = -1;
  for (let index = 0; index <= groups.length; index += 1) {
    if (groups[index] === 0 && start === -1) start = index;
    if (groups[index] !== 0 || index === groups.length) {
      const length = index - start;
      if (start !== -1 && length > bestLength && length >= 2) [bestStart, bestLength] = [start, length];
      start = -1;
    }
  }
  const output = groups.map((group) => group.toString(16));
  if (bestStart === -1) return output.join(":");
  const before = output.slice(0, bestStart).join(":");
  const after = output.slice(bestStart + bestLength).join(":");
  return before && after ? `${before}::${after}` : before ? `${before}::` : after ? `::${after}` : "::";
}

export function canonicalIp(value) {
  if (typeof value !== "string" || value.length === 0 || value !== value.trim() || /[,\[\]%]/.test(value)) return null;
  return canonicalIpv4(value) ?? canonicalIpv6(value);
}

async function hmacHex(secret, value) {
  if (typeof secret !== "string" || secret.length < 32) throw new Error("Rate-limit secret is unavailable");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

export function canonicalJson(value) {
  if (value === null || typeof value === "boolean" || typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("Payload must contain JSON values");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  throw new TypeError("Payload must contain JSON values");
}

export async function fingerprintCanonicalIp(secret, ip) {
  const canonical = canonicalIp(ip);
  if (!canonical) throw new TypeError("Canonical IP is required");
  return hmacHex(secret, `cpc-catalogue-rate-limit:fingerprint:v1:${canonical}`);
}

export async function digestValidatedPayload(secret, payload) {
  return hmacHex(secret, `cpc-catalogue-rate-limit:payload:v1:${canonicalJson(payload)}`);
}

export function rateLimitDecision(result, error = null) {
  if (error || !result || typeof result !== "object") return { kind: "unavailable", status: 503 };
  if (result.decision === "allowed" || result.decision === "retry") return { kind: result.decision, status: null };
  if (result.decision === "limited") return { kind: "limited", status: 429, retryAfterSeconds: 600 };
  if (result.decision === "idempotency_payload_mismatch") return { kind: "idempotency_payload_mismatch", status: 409 };
  return { kind: "unavailable", status: 503 };
}
