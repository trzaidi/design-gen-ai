import Link from "next/link";
import type { Caption, CaptionStats } from "@/lib/types";
import { VoteControls } from "@/components/vote-controls";

export function CaptionCard({ caption, stats, vote, signedIn = false, arenaLink = false }: { caption: Caption; stats?: CaptionStats; vote?: number; signedIn?: boolean; arenaLink?: boolean }) {
  return <article className="arena-card" id={`caption-${caption.id}`}>
    <div className="card-topline"><span>{caption.model ? `AI · ${caption.tone ?? "Caption"}` : "Original archive"}</span><span>#{caption.id.toString().padStart(3, "0")}</span></div>
    <p className="caption-text">{caption.caption_text}</p>
    <p className="image-description">{caption.image_description}</p>
    <div className="caption-score"><strong>{stats?.score ?? 0} points</strong><span>{stats?.upvotes ?? 0} funny · {stats?.downvotes ?? 0} missed</span></div>
    {caption.prompt ? <details className="prompt-details"><summary>View generation prompt</summary><p>{caption.prompt}</p><small>{caption.model}</small></details> : null}
    {signedIn ? <VoteControls captionId={caption.id} vote={vote ?? 0} /> : <Link className="card-login" href={arenaLink ? `/vote#caption-${caption.id}` : "/login"}>{arenaLink ? "Rate in the arena →" : "Sign in to rate →"}</Link>}
  </article>;
}
