import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import type { Caption } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const [captionResult, claimsResult] = await Promise.all([
    supabase
      .from("captions")
      .select("id, caption_text, image_description")
      .order("id", { ascending: true }),
    supabase.auth.getClaims(),
  ]);

  const captions = (captionResult.data ?? []) as Caption[];
  const claims = claimsResult.data?.claims;
  const signedIn = Boolean(claims?.sub);
  const email = typeof claims?.email === "string" ? claims.email : undefined;

  return (
    <div className="page">
      <SiteHeader signedIn={signedIn} email={email} />

      <main>
        <section className="hero" aria-labelledby="page-title">
          <p className="assignment">Assignment 03 · Auth</p>

          <h1 id="page-title">
            <span className="glitch-title" data-text="CAPTION" aria-hidden="true">
              CAPTION
            </span>
            <span className="world glitch-title" data-text="ARCHIVE." aria-hidden="true">
              ARCHIVE<span className="period">.</span>
            </span>
            <span className="sr-only">Caption Archive</span>
          </h1>

          <p className="intro">
            Six questionable decisions, retrieved live from Supabase. Sign in to enter the gated
            Caption Arena and build your profile.
          </p>

          <div className="hero-actions">
            <a className="jump-link" href="#captions">View captions</a>
            <Link className="outline-link" href={signedIn ? "/vote" : "/login"}>
              {signedIn ? "Enter Caption Arena" : "Sign in with Google"}
            </Link>
          </div>
        </section>

        <section className="caption-section" id="captions" aria-labelledby="caption-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Live database feed</p>
              <h2 id="caption-heading">Current entries</h2>
            </div>
            <span className="record-count">
              {captions.length.toString().padStart(2, "0")} records
            </span>
          </div>

          {captionResult.error ? (
            <p className="database-message" role="alert">
              The caption archive could not be loaded.
            </p>
          ) : (
            <div className="caption-grid">
              {captions.map((caption, index) => (
                <article className="caption-card" key={caption.id}>
                  <div className="card-topline">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>CAP-{String(caption.id).padStart(4, "0")}</span>
                  </div>
                  <p className="caption-text">{caption.caption_text}</p>
                  <p className="image-description">{caption.image_description}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>
        <span>Tai Zaidi</span>
        <span>Columbia University · 2026</span>
      </footer>
    </div>
  );
}
