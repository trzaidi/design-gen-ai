import { hasAiAuthentication } from "@/lib/ai-auth";
import { createGateway } from "ai";
import { DEFAULT_GEMINI_MODEL } from "@/lib/ai-provider";

export const dynamic = "force-dynamic";

export async function GET() {
  // Readiness metadata only: never returns tokens, keys, or user information.
  // This does not call the model or consume credits.
  const authenticationConfigured = hasAiAuthentication();
  if (process.env.GEMINI_API_KEY?.trim()) {
    const modelId = process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}`, {
        headers: { "x-goog-api-key": process.env.GEMINI_API_KEY.trim() },
        signal: AbortSignal.timeout(8_000), cache: "no-store",
      });
      // Model metadata read only. This does not generate content or check quotas.
      const providerStatus = response.ok ? "available" : response.status === 401 || response.status === 403 ? "authentication_rejected" : response.status === 404 ? "model_unavailable" : "unavailable";
      return Response.json({ provider: "gemini", authenticationConfigured: true, providerStatus, upstreamStatus: response.status }, {
        status: response.ok ? 200 : 503, headers: { "Cache-Control": "no-store" },
      });
    } catch {
      return Response.json({ provider: "gemini", authenticationConfigured: true, providerStatus: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
  }
  if (!authenticationConfigured) return Response.json({ authenticationConfigured, providerStatus: "not_connected" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  let providerStatus = "unavailable";
  let upstreamStatus: number | null = null;
  try {
    const gateway = createGateway({ fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8_000) }) });
    const credits = await gateway.getCredits();
    // The team balance and lifetime spending remain private. Expose only readiness.
    providerStatus = Number(credits.balance) > 0 ? "available" : "no_allowance";
  } catch (error) {
    upstreamStatus = typeof error === "object" && error !== null && "statusCode" in error && typeof error.statusCode === "number" ? error.statusCode : null;
    providerStatus = upstreamStatus === 401 ? "authentication_rejected" : upstreamStatus === 403 ? "access_not_enabled" : upstreamStatus === 402 ? "no_allowance" : "unavailable";
  }
  return Response.json({ provider: "gateway", authenticationConfigured, providerStatus, upstreamStatus }, {
    status: providerStatus === "available" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
