import assert from "node:assert/strict";
import { test } from "node:test";
import { captionModel } from "../lib/ai-provider.ts";

test("uses the direct Gemini provider when its key exists", () => {
  const selected = captionModel({ GEMINI_API_KEY: "local-test-key", AI_GATEWAY_API_KEY: "another-local-test-key" });
  assert.equal(selected.provider, "gemini");
  assert.equal(selected.model.modelId, "gemini-3.5-flash-lite");
  assert.equal(selected.model.provider, "google.generative-ai");
  assert.equal(selected.storedModel, "google/gemini-3.5-flash-lite");
});

test("keeps the existing Gateway connection available when Gemini is not configured", () => {
  const selected = captionModel({});
  assert.equal(selected.provider, "gateway");
  assert.equal(selected.model, "google/gemini-3.5-flash-lite");
});
