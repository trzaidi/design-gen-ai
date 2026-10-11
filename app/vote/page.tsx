import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { CaptionCard } from "@/components/caption-card";
import { createClient } from "@/lib/supabase/server";
import { CAPTION_FIELDS } from "@/lib/arena";
import type { Caption, CaptionStats } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function VotePage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user || data.user.is_anonymous) redirect("/login");
  const { sort } = await searchParams;
  const top = sort === "top";
  const [profile, entries, totals, votes] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name").eq("id", data.user.id).maybeSingle(),
    supabase.from("captions").select(CAPTION_FIELDS).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(100),
    supabase.from("caption_stats").select("caption_id, upvotes, downvotes, score"),
    supabase.from("votes").select("caption_id, value"),
  ]);
  if (!profile.data?.first_name || !profile.data?.last_name) redirect("/profile");
  const stats = new Map((totals.data ?? []).map((row) => [row.caption_id, row as CaptionStats]));
  const ownVotes = new Map((votes.data ?? []).map((row) => [row.caption_id, row.value]));
  const captions = (entries.data ?? []) as unknown as Caption[];
  if (top) captions.sort((a, b) => (stats.get(b.id)?.score ?? 0) - (stats.get(a.id)?.score ?? 0));
  return <div className="page">
    <SiteHeader signedIn email={data.user.email} />
    <main className="interior-page">
      <section className="arena-heading">
        <div><p className="eyebrow">The community has the final word</p><h1 className="interior-title">CAPTION ARENA<span className="period">.</span></h1></div>
        <Link className="primary-button" href="/create">Create a caption →</Link>
      </section>
      <p className="panel-copy">Funny or missed? Your vote decides. Change your mind any time; every account gets one vote per caption.</p>
      <nav className="feed-tabs" aria-label="Sort captions">
        <Link href="/vote?sort=new" aria-current={!top ? "page" : undefined}>New</Link>
        <Link href="/vote?sort=top" aria-current={top ? "page" : undefined}>Top</Link>
      </nav>
      {entries.error || totals.error || votes.error ? <p className="database-message" role="alert">The arena could not be loaded. Please try again.</p> : captions.length ? (
        <div className="arena-grid">{captions.map((caption) => <CaptionCard key={caption.id} caption={caption} stats={stats.get(caption.id)} vote={ownVotes.get(caption.id)} signedIn />)}</div>
      ) : <p className="database-message">No captions yet. <Link href="/create">Create the first contender.</Link></p>}
    </main>
  </div>;
}
