import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/auth/auth-code-error", requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/auth/auth-code-error", requestUrl.origin));
  }

  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  if (!claims?.sub) {
    return NextResponse.redirect(new URL("/auth/auth-code-error", requestUrl.origin));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", claims.sub)
    .maybeSingle();

  const destination = profile?.first_name && profile?.last_name ? "/vote" : "/profile";
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";

  if (!isLocal && forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${destination}`);
  }

  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
