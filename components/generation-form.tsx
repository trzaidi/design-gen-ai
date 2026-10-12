"use client";
import Link from "next/link";
import Image from "next/image";
import { useActionState, useState } from "react";
import { generateCaption } from "@/app/arena-actions";
import { TONES } from "@/lib/arena";
import type { ActionResult } from "@/lib/types";
import { MEME_IMAGES, findMemeImage } from "@/lib/meme-images";

export function GenerationForm({ scene, used, dailyLimit }: { scene: string; used: number; dailyLimit: number | null }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(generateCaption, {});
  const [description, setDescription] = useState(scene);
  const [imagePath, setImagePath] = useState("");
  const picture = findMemeImage(imagePath);
  const limitReached = dailyLimit !== null && used >= dailyLimit;
  return <form className="profile-form generation-form" action={action}>
    <div className="section-heading compact-heading"><p className="eyebrow">Your scene. AI’s punchline.</p><span className="record-count">{dailyLimit === null ? "Unlimited generations" : `${Math.max(0, dailyLimit - used)} attempts left / 24h`}</span></div>
    <label htmlFor="meme-image">Choose a picture</label>
    <select id="meme-image" name="image_path" value={imagePath} onChange={(event) => {
      const path = event.target.value;
      setImagePath(path);
      setDescription(findMemeImage(path)?.description ?? scene);
    }}>
      <option value="">My own scene (text only)</option>
      {MEME_IMAGES.map((image) => <option key={image.path} value={image.path}>{image.title}</option>)}
    </select>
    {picture ? <figure className="meme-frame generator-picture"><Image className="meme-picture" src={picture.path} alt={picture.description} width={picture.width} height={picture.height} sizes="(max-width: 768px) 100vw, 800px" /><figcaption className="image-source">{picture.source}</figcaption></figure> : null}
    <label htmlFor="scene">Describe the scene</label>
      <textarea id="scene" name="scene" value={description} readOnly={Boolean(picture)} onChange={(event) => setDescription(event.target.value)} required minLength={10} maxLength={600} rows={4} />
    <div className="scene-tools"><button className="nav-button" type="button" onClick={() => { setImagePath(""); setDescription(scene); }} disabled={pending}>Use today’s scene</button><span>{description.length}/600</span></div>
    <fieldset className="tone-fieldset"><legend>Choose a tone</legend><div className="tone-options">{TONES.map((tone, index) => <label key={tone}><input type="radio" name="tone" value={tone} defaultChecked={index === 0} required /><span>{tone}</span></label>)}</div></fieldset>
    <p className="generation-notice">Your scene, generated caption, and prompt will be published in the public archive. Avoid personal information.{dailyLimit !== null ? " Each generation attempt counts toward your allowance." : ""}</p>
    {limitReached ? <p className="form-message" role="status">You’ve used all {dailyLimit} attempts in the last 24 hours, including earlier failed attempts. You can generate again as those attempts expire. <Link href="/vote?sort=new">View and rate your published captions →</Link></p> : null}
    {state.error ? <p className="form-message form-error" role="alert">{state.error}</p> : null}
    {state.success ? <p className="form-message form-success" role="status">{state.success} <Link href={`/vote?sort=new#caption-${state.captionId}`}>Rate it in the arena →</Link></p> : null}
    <button className="primary-button" disabled={pending || limitReached} aria-busy={pending} type="submit">{pending ? "Writing your caption…" : limitReached ? "Daily limit reached" : "Generate & publish"}</button>
  </form>;
}
