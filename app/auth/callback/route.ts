import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nameFromMetadata } from "@/lib/google-name";

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

  let complete = Boolean(profile?.first_name && profile?.last_name);
  if (!complete) {
    const { data: userData } = await supabase.auth.getUser();
    const { first, last } = nameFromMetadata(userData.user?.user_metadata);
    if (first && last) {
      const { error: profileError } = await supabase.from("profiles").upsert(
        { id: claims.sub, first_name: profile?.first_name || first, last_name: profile?.last_name || last, updated_at: new Date().toISOString() },
        { onConflict: "id" },
      );
      complete = !profileError;
    }
  }

  const destination = complete ? "/vote" : "/profile";
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";

  if (!isLocal && forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${destination}`);
  }

  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
