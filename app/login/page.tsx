import { redirect } from "next/navigation";
import { signInWithGoogle } from "@/app/actions";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (claims?.sub) {
    redirect("/profile");
  }

  const { error } = await searchParams;

  return (
    <div className="page">
      <SiteHeader signedIn={false} />
      <main className="centered-page" id="main">
        <section className="auth-panel" aria-labelledby="login-title">
          <p className="eyebrow">Members only</p>
          <h1 className="interior-title" id="login-title">
            SIGN IN<span className="period">.</span>
          </h1>
          <p className="panel-copy">
            Sign in to vote on captions, generate your own with AI, and climb the leaderboard.
          </p>
          <ul className="perk-list">
            <li><span aria-hidden="true">😂</span>Vote Funny or Missed on every caption</li>
            <li><span aria-hidden="true">✦</span>Generate AI captions for any scene</li>
            <li><span aria-hidden="true">🏆</span>Compete for this week’s top spot</li>
          </ul>
          {error ? (
            <p className="form-message form-error" role="alert">
              Google sign-in could not be started. Try again.
            </p>
          ) : null}
          <form action={signInWithGoogle}>
            <button className="primary-button google-button" type="submit">
              <span className="google-mark" aria-hidden="true">G</span>
              Continue with Google
            </button>
          </form>
          <p className="fine-print">We only use your Google name and email. <Link href="/privacy">Privacy policy</Link> · <Link href="/">Browse without signing in</Link></p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
