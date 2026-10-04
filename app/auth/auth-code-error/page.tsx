import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function AuthCodeErrorPage() {
  return (
    <div className="page">
      <SiteHeader signedIn={false} />
      <main className="centered-page">
        <section className="auth-panel">
          <p className="eyebrow">Authentication error</p>
          <h1 className="interior-title">
            ACCESS DENIED<span className="period">.</span>
          </h1>
          <p className="panel-copy">The Google sign-in response could not be verified.</p>
          <Link className="primary-button" href="/login">Try again</Link>
        </section>
      </main>
    </div>
  );
}
