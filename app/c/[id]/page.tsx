import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CaptionCard } from "@/components/caption-card";
import { createClient } from "@/lib/supabase/server";
import { CAPTION_FIELDS } from "@/lib/arena";
import type { Caption, CaptionStats } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

// Shared by metadata and the page so each request reads the caption once.
const loadCaption = cache(async (rawId: string) => {
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("captions").select(CAPTION_FIELDS).eq("id", id).maybeSingle();
  return data as unknown as Caption | null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const caption = await loadCaption((await params).id);
  if (!caption) return { title: "Caption not found | Caption Archive" };
  const title = `“${caption.caption_text}” | Caption Archive`;
  return {
    title,
    description: `${caption.image_description} Vote on whether this AI caption lands.`,
    openGraph: { title, description: caption.image_description, images: caption.image_path ? [caption.image_path] : undefined },
  };
}

export default async function CaptionPage({ params }: Props) {
  const caption = await loadCaption((await params).id);
  if (!caption) notFound();
  const supabase = await createClient();
  const [{ data: claimsData }, totals, neighbours] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.from("caption_stats").select("caption_id, upvotes, downvotes, score").eq("caption_id", caption.id).maybeSingle(),
    Promise.all([
      supabase.from("captions").select("id").lt("id", caption.id).order("id", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("captions").select("id").gt("id", caption.id).order("id", { ascending: true }).limit(1).maybeSingle(),
    ]),
  ]);
  const claims = claimsData?.claims;
  const signedIn = Boolean(claims?.sub) && !claims?.is_anonymous;
  const email = typeof claims?.email === "string" ? claims.email : undefined;
  const vote = signedIn ? (await supabase.from("votes").select("value").eq("caption_id", caption.id).maybeSingle()).data?.value : undefined;
  const [older, newer] = neighbours.map((result) => result.data?.id as number | undefined);
  return <div className="page">
    <SiteHeader signedIn={signedIn} email={email} />
    <main className="interior-page single-caption" id="main">
      <Link className="back-link" href="/#captions">← Back to the archive</Link>
      <CaptionCard caption={caption} stats={(totals.data as CaptionStats | null) ?? undefined} vote={vote} signedIn={signedIn} featured />
      <nav className="pager" aria-label="More captions">
        {newer ? <Link className="outline-link" href={`/c/${newer}`}>← Newer</Link> : <span />}
        {signedIn ? <Link className="primary-button" href="/vote?view=judge">Keep judging →</Link> : <Link className="primary-button" href="/login">Sign in to vote →</Link>}
        {older ? <Link className="outline-link" href={`/c/${older}`}>Older →</Link> : <span />}
      </nav>
    </main>
    <SiteFooter />
  </div>;
}
