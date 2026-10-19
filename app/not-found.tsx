import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return <div className="page">
    <main className="centered-page" id="main">
      <section className="auth-panel">
        <p className="eyebrow">Error 404</p>
        <h1 className="interior-title glitch-title" data-text="LOST.">LOST<span className="period">.</span></h1>
        <p className="panel-copy">This page wandered off like a pigeon on the 1 train. The caption may have been removed, or the link is mistyped.</p>
        <div className="hero-actions"><Link className="primary-button" href="/">Back to the archive →</Link></div>
      </section>
    </main>
    <SiteFooter />
  </div>;
}
