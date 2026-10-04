import { redirect } from "next/navigation";
import { signInWithGoogle } from "@/app/actions";
import { SiteHeader } from "@/components/site-header";
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
      <main className="centered-page">
        <section className="auth-panel" aria-labelledby="login-title">
          <p className="eyebrow">Restricted access</p>
          <h1 className="interior-title" id="login-title">
            SIGN IN<span className="period">.</span>
          </h1>
          <p className="panel-copy">
            Continue with Google to create your profile and enter the protected Caption Arena.
          </p>
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
        </section>
      </main>
    </div>
  );
}
