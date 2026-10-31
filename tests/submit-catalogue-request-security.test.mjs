import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
const root=resolve(import.meta.dirname,"..");

test("transitional endpoint accepts legacy and simplified CORS requests without CAPTCHA",async()=>{
  const source=await readFile(resolve(root,"supabase/functions/submit-catalogue-request/index.ts"),"utf8");
  assert.match(source,/Access-Control-Allow-Headers.*idempotency-key, x-turnstile-token/);
  assert.doesNotMatch(source,/verifyTurnstile|TURNSTILE_SECRET|challenges\.cloudflare\.com/i);
  assert.match(source,/MAX_BYTES=512000/);
  assert.match(source,/validPayload\(payload,key\)/);
  assert.doesNotMatch(source,/req\.headers\.get\("x-turnstile-token"\)/);
});

test("request payload and idempotent replay behaviour remain in the database RPC contract",async()=>{
  const source=await readFile(resolve(root,"supabase/functions/submit-catalogue-request/index.ts"),"utf8");
  assert.match(source,/validPayload\(payload,key\)/);
  assert.match(source,/supabase\.rpc\("submit_catalogue_request",\{payload\}\)/);
  assert.match(source,/data\.replayed\?200:201/);
});
