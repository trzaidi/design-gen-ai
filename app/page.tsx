import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { CaptionCard } from "@/components/caption-card";
import { createClient } from "@/lib/supabase/server";
import { CAPTION_FIELDS, dailyScene } from "@/lib/arena";
import type { Caption, CaptionStats } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const [entries, totals, claimsResult] = await Promise.all([
    supabase.from("captions").select(CAPTION_FIELDS).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(100),
    supabase.from("caption_stats").select("caption_id, upvotes, downvotes, score"),
    supabase.auth.getClaims(),
  ]);
  const captions = (entries.data ?? []) as unknown as Caption[];
  const stats = new Map((totals.data ?? []).map((row) => [row.caption_id, row as CaptionStats]));
  const claims = claimsResult.data?.claims;
  const signedIn = Boolean(claims?.sub) && !claims?.is_anonymous;
  const email = typeof claims?.email === "string" ? claims.email : undefined;
  const { scene } = dailyScene();
  return <div className="page">
    <SiteHeader signedIn={signedIn} email={email} />
    <main>
      <section className="hero" aria-labelledby="page-title">
        <p className="assignment">Campus life. City chaos. AI captions.</p>
        <h1 id="page-title">
          <span className="glitch-title" data-text="CAPTION" aria-hidden="true">CAPTION</span>
          <span className="world glitch-title" data-text="ARCHIVE." aria-hidden="true">ARCHIVE<span className="period">.</span></span>
          <span className="sr-only">Caption Archive</span>
        </h1>
        <p className="intro">AI writes the punchline. You decide if it lands. Make a caption for your next questionable New York moment, then let the arena judge.</p>
        <div className="hero-actions">
          <Link className="jump-link" href={signedIn ? "/create" : "/login"}>Create a caption</Link>
          <a className="outline-link" href="#captions">Explore the archive</a>
        </div>
      </section>
      <section className="daily-scene" aria-labelledby="daily-heading">
        <div><p className="eyebrow">A new scene every day</p><h2 id="daily-heading">Today’s material</h2></div>
        <p>{scene}</p>
        <Link className="primary-button" href={signedIn ? "/create" : "/login"}>Caption this →</Link>
      </section>
      <section className="caption-section" id="captions" aria-labelledby="caption-heading">
        <div className="section-heading"><div><p className="eyebrow">Fresh from the community</p><h2 id="caption-heading">Current entries</h2></div><Link className="record-count" href="/vote?sort=top">Find the funniest →</Link></div>
        {entries.error || totals.error ? <p className="database-message" role="alert">The caption archive could not be loaded.</p> : captions.length ? (
          <div className="arena-grid">{captions.map((caption) => <CaptionCard key={caption.id} caption={caption} stats={stats.get(caption.id)} arenaLink={signedIn} />)}</div>
        ) : <p className="database-message">The arena is waiting for its first caption. <Link href={signedIn ? "/create" : "/login"}>Make one.</Link></p>}
      </section>
    </main>
    <footer><span>Tai Zaidi</span><span>Columbia University · 2026</span></footer>
  </div>;
}
