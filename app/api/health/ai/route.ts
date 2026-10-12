import { hasAiAuthentication } from "@/lib/ai-auth";
import { createGateway } from "ai";

export const dynamic = "force-dynamic";

export async function GET() {
  // Readiness metadata only: never returns tokens, keys, or user information.
  // This does not call the model or consume credits.
  const authenticationConfigured = hasAiAuthentication();
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
  return Response.json({ authenticationConfigured, providerStatus, upstreamStatus }, {
    status: providerStatus === "available" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
