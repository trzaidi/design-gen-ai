import Link from "next/link";
import Image from "next/image";
import type { Caption, CaptionStats } from "@/lib/types";
import { VoteControls } from "@/components/vote-controls";
import { findMemeImage } from "@/lib/meme-images";

export function CaptionCard({ caption, stats, vote, signedIn = false, arenaLink = false }: { caption: Caption; stats?: CaptionStats; vote?: number; signedIn?: boolean; arenaLink?: boolean }) {
  const picture = findMemeImage(caption.image_path);
  return <article className="arena-card" id={`caption-${caption.id}`}>
    <div className="card-topline"><span>{caption.model ? `AI · ${caption.tone ?? "Caption"}` : "Original archive"}</span><span>#{caption.id.toString().padStart(3, "0")}</span></div>
    {picture ? <figure className="meme-frame">
      <Image className="meme-picture" src={picture.path} alt={caption.image_description} width={picture.width} height={picture.height} sizes="(max-width: 768px) 100vw, 50vw" />
      <figcaption className="image-source">{picture.source}</figcaption>
    </figure> : null}
    <p className="caption-text">{caption.caption_text}</p>
    <p className="image-description">{caption.image_description}</p>
    <div className="caption-score"><strong>{stats?.score ?? 0} points</strong><span>{stats?.upvotes ?? 0} funny · {stats?.downvotes ?? 0} missed</span></div>
    {caption.prompt ? <details className="prompt-details"><summary>View generation prompt</summary><p>{caption.prompt}</p><small>{caption.model}</small></details> : null}
    {signedIn ? <VoteControls captionId={caption.id} vote={vote ?? 0} /> : <Link className="card-login" href={arenaLink ? `/vote#caption-${caption.id}` : "/login"}>{arenaLink ? "Rate in the arena →" : "Sign in to rate →"}</Link>}
  </article>;
}
