"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { generateCaption } from "@/app/arena-actions";
import { TONES } from "@/lib/arena";
import type { ActionResult } from "@/lib/types";

export function GenerationForm({ scene, used }: { scene: string; used: number }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(generateCaption, {});
  const [description, setDescription] = useState(scene);
  return <form className="profile-form generation-form" action={action}>
    <div className="section-heading compact-heading"><p className="eyebrow">Your scene. AI’s punchline.</p><span className="record-count">{Math.max(0, 5 - used)} attempts left / 24h</span></div>
    <label htmlFor="scene">Describe the scene</label>
    <textarea id="scene" name="scene" value={description} onChange={(event) => setDescription(event.target.value)} required minLength={10} maxLength={600} rows={4} />
    <div className="scene-tools"><button className="nav-button" type="button" onClick={() => setDescription(scene)} disabled={pending}>Use today’s scene</button><span>{description.length}/600</span></div>
    <fieldset className="tone-fieldset"><legend>Choose a tone</legend><div className="tone-options">{TONES.map((tone, index) => <label key={tone}><input type="radio" name="tone" value={tone} defaultChecked={index === 0} required /><span>{tone}</span></label>)}</div></fieldset>
    <p className="generation-notice">Your scene, generated caption, and prompt will be published in the public archive. Avoid personal information. Each generation attempt counts toward your allowance.</p>
    {state.error ? <p className="form-message form-error" role="alert">{state.error}</p> : null}
    {state.success ? <p className="form-message form-success" role="status">{state.success} <Link href={`/vote?sort=new#caption-${state.captionId}`}>Rate it in the arena →</Link></p> : null}
    <button className="primary-button" disabled={pending || used >= 5} type="submit">{pending ? "Writing your caption…" : "Generate & publish"}</button>
  </form>;
}
