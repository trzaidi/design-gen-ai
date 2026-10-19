import Link from "next/link";
import Image from "next/image";
import type { Caption, CaptionStats } from "@/lib/types";
import { ScoreLine, VoteControls } from "@/components/vote-controls";
import { ShareButton } from "@/components/share-button";
import { findMemeImage } from "@/lib/meme-images";
import { PhotoCredit } from "@/components/photo-credit";

export function CaptionCard({ caption, stats, vote, signedIn = false, rank, featured = false }: { caption: Caption; stats?: CaptionStats; vote?: number; signedIn?: boolean; rank?: number; featured?: boolean }) {
  const picture = findMemeImage(caption.image_path);
  const totals = { upvotes: stats?.upvotes ?? 0, downvotes: stats?.downvotes ?? 0 };
  const classes = ["arena-card", rank && rank <= 3 ? `ranked-card rank-${rank}` : "", featured ? "featured-card" : ""].filter(Boolean).join(" ");
  return <article className={classes} id={`caption-${caption.id}`}>
    {picture ? <figure className="meme-frame">
      <Image className="meme-picture" src={picture.path} alt={caption.image_description} width={picture.width} height={picture.height} sizes={featured ? "(max-width: 768px) 100vw, 900px" : "(max-width: 768px) 100vw, 33vw"} />
      {rank ? <span className="rank-badge">#{rank}</span> : null}
      <PhotoCredit picture={picture} />
    </figure> : rank ? <span className="rank-badge rank-badge-inline">#{rank}</span> : null}
    <div className="card-body">
      <div className="card-topline">
        <span className={`tone-chip tone-${(caption.tone ?? "archive").toLowerCase()}`}>{caption.model ? caption.tone ?? "AI" : "Original"}</span>
        <time dateTime={caption.created_at}>{relativeTime(caption.created_at)}</time>
      </div>
      <p className="caption-text">{caption.caption_text}</p>
      <p className="image-description">{caption.image_description}</p>
      {signedIn ? <VoteControls captionId={caption.id} vote={vote ?? 0} totals={totals} /> : <div className="vote-area"><ScoreLine {...totals} /><Link className="card-login" href="/login">Sign in to vote →</Link></div>}
      <div className="card-actions">
        <ShareButton captionId={caption.id} text={caption.caption_text} />
        {featured ? null : <Link className="text-button" href={`/c/${caption.id}`}>Open</Link>}
        {caption.prompt ? <details className="prompt-details"><summary>How AI made this</summary><p>{caption.prompt}</p><small>{caption.model}</small></details> : null}
      </div>
    </div>
  </article>;
}

function relativeTime(iso: string) {
  const minutes = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" });
}
