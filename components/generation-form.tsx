"use client";
import Link from "next/link";
import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { generateCaption } from "@/app/arena-actions";
import { TONES, TONE_DETAILS } from "@/lib/arena";
import type { ActionResult } from "@/lib/types";
import { MEME_IMAGES, findMemeImage } from "@/lib/meme-images";
import { PhotoCredit } from "@/components/photo-credit";
import { COLUMBIA_MATERIAL, findMaterialTopic, type MaterialTopic } from "@/lib/columbia-material";

export function GenerationForm({ initialTopic, used, dailyLimit }: { initialTopic: MaterialTopic; used: number; dailyLimit: number | null }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(generateCaption, {});
  const [description, setDescription] = useState(initialTopic.scene);
  const [imagePath, setImagePath] = useState(initialTopic.imagePath);
  const [topicId,setTopicId]=useState(initialTopic.id);
  const topic=findMaterialTopic(topicId);
  const chooseTopic=(id:string)=>{const next=findMaterialTopic(id);setTopicId(next?.id??"");if(next){setImagePath(next.imagePath);setDescription(next.scene);}};
  const [tone, setTone] = useState<string>(TONES[0]);
  const formRef = useRef<HTMLFormElement>(null);
  const picture = findMemeImage(imagePath);
  const limitReached = dailyLimit !== null && used >= dailyLimit;
  const remaining = dailyLimit === null ? null : Math.max(0, dailyLimit - used);
  const result = state.success && state.caption ? state : null;
  const resultPicture = findMemeImage(result?.imagePath);

  return <div className="create-layout">
    <form className="profile-form generation-form" action={action} ref={formRef}>
      <div className="section-heading compact-heading"><p className="eyebrow">Step 1 · Your scene</p><span className="record-count">{remaining === null ? "Unlimited generations" : `${remaining} of ${dailyLimit} left today`}</span></div>
      <label htmlFor="material-topic">Start with Columbia material</label>
      <select id="material-topic" name="topic_id" value={topicId} disabled={pending} onChange={event=>chooseTopic(event.target.value)}>
        <option value="">My own scene</option>
        {(["In the news","Campus life"] as const).map(category=><optgroup key={category} label={category}>{COLUMBIA_MATERIAL.filter(item=>item.category===category).map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</optgroup>)}
      </select>
      {topic&&<div className="material-context"><strong>{topic.category} · checked Oct 25, 2026</strong><p>{topic.fact}</p><div>{topic.sources.map(source=><a href={source.url} key={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>)}</div></div>}
      <Link className="text-button" href="/material">Browse all 15 joke setups →</Link>
      <fieldset className="picture-fieldset" disabled={pending}><legend>Choose a picture</legend>
      <p className="picture-group-label">Around campus</p>
      <div className="picture-options">

        {MEME_IMAGES.filter((image) => image.group === "Columbia").map((image) => <label className="picture-option" key={image.path}><input type="radio" name="image_path" required value={image.path} checked={imagePath === image.path} onChange={() => { setTopicId("");setImagePath(image.path); setDescription(image.description); }} /><Image src={image.path} alt="" width={image.width} height={image.height} sizes="10rem" /><span>{image.title}</span></label>)}
      </div>
      <p className="picture-group-label">Internet classics</p>
      <div className="picture-options">
        {MEME_IMAGES.filter((image) => image.group === "Classics").map((image) => <label className="picture-option" key={image.path}><input type="radio" name="image_path" required value={image.path} checked={imagePath === image.path} onChange={() => { setTopicId("");setImagePath(image.path); setDescription(image.description); }} /><Image src={image.path} alt="" width={image.width} height={image.height} sizes="10rem" /><span>{image.title}</span></label>)}
      </div></fieldset>
      <label htmlFor="scene">Describe the scene</label>
      <textarea id="scene" name="scene" value={description} disabled={pending} onChange={(event) => {setTopicId("");setDescription(event.target.value);}} required minLength={10} maxLength={600} rows={4} placeholder="e.g. A pigeon confidently boarding the 1 train at 116th St." />
      <p className="scene-locked">Every caption includes a picture. Choose a topic for its matching image, or pick a picture and write your own setup.</p>
      <div className="scene-tools"><button className="nav-button" type="button" onClick={() => chooseTopic(initialTopic.id)} disabled={pending}>↺ Reset scene</button><span className={description.length < 10 ? "count-warning" : undefined}>{description.length}/600</span></div>

      <fieldset className="tone-fieldset"><legend>Step 2 · Choose a tone</legend><div className="tone-options">{TONES.map((option) => <label key={option} className={`tone-card tone-${option.toLowerCase()}`}><input type="radio" name="tone" value={option} checked={tone === option} onChange={() => setTone(option)} required /><span className="tone-icon" aria-hidden="true">{TONE_DETAILS[option].icon}</span><strong>{option}</strong><small>{TONE_DETAILS[option].blurb}</small></label>)}</div></fieldset>

      <p className="generation-notice">Your scene, caption, and prompt are published in the public archive. Avoid personal information.{dailyLimit !== null ? " Each attempt counts toward your daily allowance." : ""}</p>
      {limitReached ? <p className="form-message" role="status">You’ve used all {dailyLimit} attempts in the last 24 hours, including any that failed. You can generate again as they expire. <Link href="/vote?view=judge">Judge other captions in the meantime →</Link></p> : null}
      {state.error ? <p className="form-message form-error" role="alert">{state.error}</p> : null}
      <button className="primary-button generate-button" disabled={pending || limitReached || !picture} aria-busy={pending} type="submit">{pending ? <><span className="typing-dots" aria-hidden="true"><span /><span /><span /></span>Writing your caption…</> : limitReached ? "Daily limit reached" : "✦ Generate & publish"}</button>
    </form>

    <aside className="create-preview" aria-live="polite" aria-label="Result">
      <p className="eyebrow">Step 3 · The result</p>
      {pending ? <div className="preview-card preview-pending">
        {picture ? <Image src={picture.path} alt="" width={picture.width} height={picture.height} sizes="400px" /> : null}
        <p className="typing-line"><span className="typing-dots" aria-hidden="true"><span /><span /><span /></span> AI is workshopping a punchline…</p>
      </div> : result ? <div className="preview-card preview-done">
        {resultPicture ? <figure className="judge-figure"><Image src={resultPicture.path} alt="" width={resultPicture.width} height={resultPicture.height} sizes="400px" /><PhotoCredit picture={resultPicture} /></figure> : null}
        <span className={`tone-chip tone-${result.tone?.toLowerCase()}`}>{result.tone}</span>
        <p className="caption-text">{result.caption}</p>
        <p className="form-message form-success">Published! The arena can vote on it now.</p>
        <div className="preview-actions">
          <Link className="primary-button" href={`/c/${result.captionId}`}>See it live →</Link>
          <button className="outline-link" type="button" disabled={limitReached} onClick={() => formRef.current?.requestSubmit()}>↻ Try another take</button>
        </div>
      </div> : <div className="preview-card preview-empty">
        {picture ? <><Image src={picture.path} alt="" width={picture.width} height={picture.height} sizes="400px" /><PhotoCredit picture={picture} /></> : <span className="preview-placeholder" aria-hidden="true">✦</span>}
        <p>Your caption will appear here. Pick a picture and a tone, then hit generate.</p>
      </div>}
    </aside>
  </div>;
}
