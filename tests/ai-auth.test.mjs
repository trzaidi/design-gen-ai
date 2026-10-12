import assert from "node:assert/strict";
import { test } from "node:test";
import { hasAiAuthentication } from "../lib/ai-auth.ts";

test("recognizes Vercel request-context OIDC without an environment token", () => {
  const symbol = Symbol.for("@vercel/request-context");
  const previousContext = globalThis[symbol];
  const previousKey = process.env.AI_GATEWAY_API_KEY;
  const previousToken = process.env.VERCEL_OIDC_TOKEN;
  const previousGeminiKey = process.env.GEMINI_API_KEY;
  try {
    delete process.env.AI_GATEWAY_API_KEY;
    delete process.env.VERCEL_OIDC_TOKEN;
    delete process.env.GEMINI_API_KEY;
    globalThis[symbol] = { get: () => ({ headers: { "x-vercel-oidc-token": "local-test-token" } }) };
    assert.equal(hasAiAuthentication(), true);
    globalThis[symbol] = { get: () => ({}) };
    assert.equal(hasAiAuthentication(), false);
    process.env.GEMINI_API_KEY = "local-gemini-test-key";
    assert.equal(hasAiAuthentication(), true);
    delete process.env.GEMINI_API_KEY;
    process.env.AI_GATEWAY_API_KEY = "local-test-key";
    assert.equal(hasAiAuthentication(), true);
  } finally {
    globalThis[symbol] = previousContext;
    if (previousKey === undefined) delete process.env.AI_GATEWAY_API_KEY;
    else process.env.AI_GATEWAY_API_KEY = previousKey;
    if (previousToken === undefined) delete process.env.VERCEL_OIDC_TOKEN;
    else process.env.VERCEL_OIDC_TOKEN = previousToken;
    if (previousGeminiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousGeminiKey;
  }
});
