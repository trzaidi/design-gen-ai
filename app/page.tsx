import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CaptionCard } from "@/components/caption-card";
import { createClient } from "@/lib/supabase/server";
import { CAPTION_FIELDS, TONES, dailyScene, weeklyLeaders } from "@/lib/arena";
import { findMemeImage } from "@/lib/meme-images";
import type { Caption, CaptionStats } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ tone?: string; sort?: string }> }) {
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
  // Members vote straight from the archive; RLS returns only their own votes.
  const votes = signedIn ? await supabase.from("votes").select("caption_id, value") : null;
  const ownVotes = new Map((votes?.data ?? []).map((row) => [row.caption_id, row.value]));
  const unratedCount = signedIn ? captions.filter((caption) => !ownVotes.has(caption.id)).length : 0;
  const { leaders, weekly } = weeklyLeaders(captions, stats);
  const { scene } = dailyScene();
  const totalVotes = [...stats.values()].reduce((sum, row) => sum + row.upvotes + row.downvotes, 0);
  const createHref = signedIn ? "/create" : "/login";

  const { tone, sort } = await searchParams;
  const activeTone = TONES.find((option) => option === tone);
  const top = sort === "top";
  const filtered = captions.filter((caption) => !activeTone || caption.tone === activeTone);
  if (top) filtered.sort((a, b) => (stats.get(b.id)?.score ?? 0) - (stats.get(a.id)?.score ?? 0));
  const filterHref = (next: { tone?: string; sort?: string }) => {
    const query = new URLSearchParams();
    const t = "tone" in next ? next.tone : activeTone;
    const s = "sort" in next ? next.sort : top ? "top" : undefined;
    if (t) query.set("tone", t);
    if (s) query.set("sort", s);
    const text = query.toString();
    return `/${text ? `?${text}` : ""}#captions`;
  };
  const heroPicture = findMemeImage(leaders[0]?.image_path) ?? findMemeImage(captions.find((caption) => caption.image_path)?.image_path);

  return <div className="page">
    <SiteHeader signedIn={signedIn} email={email} />
    <main id="main">
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="assignment">Campus life. City chaos. AI captions.</p>
          <h1 id="page-title">
            <span className="glitch-title" data-text="CAPTION" aria-hidden="true">CAPTION</span>
            <span className="world glitch-title" data-text="ARCHIVE." aria-hidden="true">ARCHIVE<span className="period">.</span></span>
            <span className="sr-only">Caption Archive</span>
          </h1>
          <p className="intro">AI writes the punchline. You decide if it lands. Pick a picture, choose a vibe, and let the arena judge.</p>
          <div className="hero-actions">
            {signedIn && unratedCount ? <Link className="jump-link" href="/vote?view=judge">Judge {unratedCount} new caption{unratedCount === 1 ? "" : "s"} →</Link>
              : <Link className="jump-link" href={createHref}>{signedIn ? "Create a caption" : "Sign in to play"}</Link>}
            <a className="outline-link" href="#captions">Explore the archive</a>
          </div>
          <dl className="stat-strip">
            <div><dt>Captions</dt><dd>{captions.length}</dd></div>
            <div><dt>Votes cast</dt><dd>{totalVotes}</dd></div>
            {signedIn ? <div><dt>Waiting on you</dt><dd>{unratedCount}</dd></div> : <div><dt>Top score</dt><dd>{leaders[0] ? stats.get(leaders[0].id)?.score ?? 0 : 0}</dd></div>}
          </dl>
        </div>
        {heroPicture && leaders[0] ? <Link className="hero-preview" href={`/c/${leaders[0].id}`} aria-label={`Top caption: ${leaders[0].caption_text}`}>
          <Image src={heroPicture.path} alt="" width={heroPicture.width} height={heroPicture.height} sizes="(max-width: 900px) 100vw, 40vw" priority />
          <span className="hero-preview-label">#1 right now</span>
          <span className="hero-preview-caption">{leaders[0].caption_text}</span>
        </Link> : null}
      </section>

      <section className="how-it-works" aria-labelledby="how-heading">
        <h2 className="sr-only" id="how-heading">How it works</h2>
        <ol>
          <li><span className="step-number">01</span><strong>Pick a scene</strong><span>Choose a picture or describe a moment from campus or the city.</span></li>
          <li><span className="step-number">02</span><strong>AI writes it</strong><span>Pick Deadpan, Unhinged, or Wholesome and Gemini writes the caption.</span></li>
          <li><span className="step-number">03</span><strong>The crowd decides</strong><span>Everyone votes Funny or Missed. The best captions climb the board.</span></li>
        </ol>
      </section>

      <section className="daily-scene" aria-labelledby="daily-heading">
        <div><p className="eyebrow">A new scene every day</p><h2 id="daily-heading">Today’s material</h2></div>
        <div className="daily-body"><p>{scene}</p><Link className="primary-button" href={createHref}>Caption this →</Link></div>
      </section>

      {leaders.length ? <section className="leaderboard" aria-labelledby="leaders-heading">
        <div className="section-heading"><div><p className="eyebrow">{weekly ? "Highest scores · last 7 days" : "Highest scores · all time"}</p><h2 id="leaders-heading">{weekly ? "This week’s winners" : "Hall of fame"}</h2></div><Link className="record-count" href={signedIn ? "/vote?view=top" : "/?sort=top#captions"}>Full rankings →</Link></div>
        <ol className="podium">{leaders.map((caption, index) => {
          const picture = findMemeImage(caption.image_path);
          const row = stats.get(caption.id);
          return <li key={caption.id} className={`podium-${index + 1}`}>
            <span className="podium-rank">{["🥇", "🥈", "🥉"][index]}</span>
            {picture ? <Image className="podium-thumb" src={picture.path} alt="" width={96} height={72} /> : null}
            <Link href={`/c/${caption.id}`}>{caption.caption_text}</Link>
            <span className="podium-score">{row?.score ?? 0} pts · {row?.upvotes ?? 0} 😂</span>
          </li>;
        })}</ol>
      </section> : null}

      <section className="caption-section" id="captions" aria-labelledby="caption-heading">
        <div className="section-heading"><div><p className="eyebrow">Fresh from the community</p><h2 id="caption-heading">The archive</h2></div>{signedIn ? <Link className="record-count" href="/vote?view=judge">Judge one at a time →</Link> : null}</div>
        <div className="filter-bar">
          <nav className="chip-row" aria-label="Filter by tone">
            <Link className="chip" href={filterHref({ tone: undefined })} aria-current={!activeTone ? "page" : undefined}>All</Link>
            {TONES.map((option) => <Link className="chip" key={option} href={filterHref({ tone: option })} aria-current={activeTone === option ? "page" : undefined}>{option}</Link>)}
          </nav>
          <nav className="chip-row" aria-label="Sort captions">
            <Link className="chip" href={filterHref({ sort: undefined })} aria-current={!top ? "page" : undefined}>Newest</Link>
            <Link className="chip" href={filterHref({ sort: "top" })} aria-current={top ? "page" : undefined}>Top rated</Link>
          </nav>
        </div>
        {entries.error || totals.error ? <p className="database-message" role="alert">The caption archive could not be loaded. Please refresh to try again.</p> : filtered.length ? (
          <div className="arena-grid">{filtered.map((caption, index) => <CaptionCard key={caption.id} caption={caption} stats={stats.get(caption.id)} vote={ownVotes.get(caption.id)} signedIn={signedIn} rank={top ? index + 1 : undefined} />)}</div>
        ) : captions.length ? <p className="database-message">No {activeTone} captions yet. <Link href={createHref}>Make the first one.</Link></p>
          : <p className="database-message">The arena is waiting for its first caption. <Link href={createHref}>Make one.</Link></p>}
      </section>
    </main>
    <SiteFooter />
  </div>;
}
