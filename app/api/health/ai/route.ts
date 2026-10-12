import { hasAiAuthentication } from "@/lib/ai-auth";

export const dynamic = "force-dynamic";

export function GET() {
  // Readiness metadata only: never returns tokens, keys, or user information.
  // This does not call the model or consume credits.
  const authenticationConfigured = hasAiAuthentication();
  return Response.json({ authenticationConfigured }, {
    status: authenticationConfigured ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
