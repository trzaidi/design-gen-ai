import { getVercelOidcTokenSync } from "@vercel/oidc";

export function hasAiAuthentication() {
  if (process.env.AI_GATEWAY_API_KEY) return true;
  try {
    // Deployed functions can receive the token through Vercel's request context.
    // The AI SDK validates it with the gateway and handles refreshing it.
    return Boolean(getVercelOidcTokenSync());
  } catch {
    return false;
  }
}
