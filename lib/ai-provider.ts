import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";

export function captionModel(env = process.env) {
  if (env.GEMINI_API_KEY?.trim()) {
    const modelId = env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
    const google = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY.trim() });
    return { provider: "gemini" as const, model: google(modelId), storedModel: `google/${modelId}` };
  }
  const modelId = env.AI_GATEWAY_MODEL ?? "google/gemini-3.5-flash-lite";
  return { provider: "gateway" as const, model: modelId, storedModel: modelId };
}
