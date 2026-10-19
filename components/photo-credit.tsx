import type { MemeImage } from "@/lib/meme-images";

export function PhotoCredit({ picture }: { picture: MemeImage }) {
  return "sourceUrl" in picture
    ? <a className="photo-credit" href={picture.sourceUrl} target="_blank" rel="noopener noreferrer">{picture.source}</a>
    : <span className="photo-credit">{picture.source}</span>;
}
