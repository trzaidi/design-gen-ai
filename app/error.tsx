"use client";
import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="page">
    <main className="centered-page" id="main">
      <section className="auth-panel" role="alert">
        <p className="eyebrow">Something broke</p>
        <h1 className="interior-title">GLITCH<span className="period">.</span></h1>
        <p className="panel-copy">The archive hit a snag loading this page. Your votes and captions are safe.</p>
        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={reset}>Try again</button>
          <Link className="outline-link" href="/">Go home</Link>
        </div>
      </section>
    </main>
  </div>;
}
