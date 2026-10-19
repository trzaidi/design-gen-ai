import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CaptionCard } from "@/components/caption-card";
import { JudgeQueue } from "@/components/judge-queue";
import { createClient } from "@/lib/supabase/server";
import { CAPTION_FIELDS } from "@/lib/arena";
import type { Caption, CaptionStats } from "@/lib/types";

export const dynamic = "force-dynamic";

type View = "judge" | "new" | "top";

export default async function VotePage({ searchParams }: { searchParams: Promise<{ sort?: string; view?: string }> }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user || data.user.is_anonymous) redirect("/login");
  const params = await searchParams;
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
  const unrated = captions.filter((caption) => !ownVotes.has(caption.id));
  // Older links used ?sort=; members with captions to rate land in Judge mode.
  const requested = params.view ?? params.sort;
  const view: View = requested === "top" || requested === "new" || requested === "judge" ? requested : unrated.length ? "judge" : "new";
  const shown = view === "top" ? [...captions].sort((a, b) => (stats.get(b.id)?.score ?? 0) - (stats.get(a.id)?.score ?? 0)) : captions;
  const failed = entries.error || totals.error || votes.error;
  const tabs: { id: View; label: string; hint: string }[] = [
    { id: "judge", label: "Judge", hint: unrated.length ? `${unrated.length} new` : "done" },
    { id: "new", label: "Newest", hint: `${captions.length}` },
    { id: "top", label: "Top rated", hint: "ranked" },
  ];
  return <div className="page">
    <SiteHeader signedIn email={data.user.email} />
    <main className="interior-page" id="main">
      <section className="arena-heading">
        <div><p className="eyebrow">The community has the final word</p><h1 className="interior-title">CAPTION ARENA<span className="period">.</span></h1></div>
        <Link className="primary-button" href="/create">Create a caption →</Link>
      </section>
      <p className="panel-copy">{view === "judge" ? "One caption at a time. Funny or missed? Use the buttons or your arrow keys (← missed · → funny · S skip · Z undo)." : "Funny or missed? Your vote decides. Change your mind any time; every account gets one vote per caption."}</p>
      <nav className="feed-tabs" aria-label="Arena views">
        {tabs.map((tab) => <Link key={tab.id} href={`/vote?view=${tab.id}`} aria-current={view === tab.id ? "page" : undefined}>{tab.label}<span className="tab-hint">{tab.hint}</span></Link>)}
      </nav>
      {failed ? <p className="database-message" role="alert">The arena could not be loaded. Please refresh to try again.</p>
        : view === "judge" ? <JudgeQueue captions={unrated} />
        : shown.length ? <div className="arena-grid">{shown.map((caption, index) => <CaptionCard key={caption.id} caption={caption} stats={stats.get(caption.id)} vote={ownVotes.get(caption.id)} signedIn rank={view === "top" ? index + 1 : undefined} />)}</div>
        : <p className="database-message">No captions yet. <Link href="/create">Create the first contender.</Link></p>}
    </main>
    <SiteFooter />
  </div>;
}
