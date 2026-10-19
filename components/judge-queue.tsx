"use client";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState, useTransition } from "react";
import { rateCaption } from "@/app/arena-actions";
import { findMemeImage } from "@/lib/meme-images";
import type { Caption } from "@/lib/types";

type Verdict = { caption: Caption; value: number };

export function JudgeQueue({ captions }: { captions: Caption[] }) {
  // The queue is local so server refreshes after each vote don't reshuffle it.
  const [queue, setQueue] = useState(captions);
  const [history, setHistory] = useState<Verdict[]>([]);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState<"funny" | "missed" | "">("");
  const [, startTransition] = useTransition();
  const [total] = useState(captions.length);
  const current = queue[0];

  const judge = useCallback((value: number) => {
    if (!current) return;
    setFlash(value === 1 ? "funny" : value === -1 ? "missed" : "");
    setTimeout(() => setFlash(""), 350);
    setQueue((items) => items.slice(1));
    setError("");
    if (value === 0) { setQueue((items) => [...items, current]); return; }
    setHistory((items) => [...items, { caption: current, value }]);
    startTransition(async () => {
      const result = await rateCaption(current.id, value).catch(() => ({ error: "Your vote could not be saved." }));
      if (result.error) {
        setError(`${result.error} “${current.caption_text.slice(0, 40)}…” is back in your queue.`);
        setQueue((items) => [current, ...items]);
        setHistory((items) => items.filter((item) => item.caption.id !== current.id));
      }
    });
  }, [current]);

  const undo = useCallback(() => {
    const last = history.at(-1);
    if (!last) return;
    setHistory((items) => items.slice(0, -1));
    setQueue((items) => [last.caption, ...items.filter((item) => item.id !== last.caption.id)]);
    startTransition(async () => {
      const result = await rateCaption(last.caption.id, 0).catch(() => ({ error: "Undo failed." }));
      if (result.error) setError(result.error);
    });
  }, [history]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable]")) return;
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "f") { event.preventDefault(); judge(1); }
      else if (event.key === "ArrowLeft" || event.key.toLowerCase() === "m") { event.preventDefault(); judge(-1); }
      else if (event.key.toLowerCase() === "s" || event.key === "ArrowDown") { event.preventDefault(); judge(0); }
      else if (event.key.toLowerCase() === "z" || event.key === "Backspace") { event.preventDefault(); undo(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [judge, undo]);

  const done = history.length;
  const progress = total ? Math.min(100, Math.round((done / total) * 100)) : 100;
  const laughs = history.filter((item) => item.value === 1).length;

  if (!current) return <section className="judge-done" aria-live="polite">
    <p className="eyebrow">Queue cleared</p>
    <h2>{done ? "You’re all caught up." : "Nothing left to judge."}</h2>
    <p className="panel-copy">{done ? `You judged ${done} caption${done === 1 ? "" : "s"} and laughed at ${laughs}.` : "You’ve already rated every caption in the archive."} Make a new contender and see how it does.</p>
    <div className="hero-actions">
      <Link className="primary-button" href="/create">Create a caption →</Link>
      <Link className="outline-link" href="/vote?view=top">See the rankings</Link>
      {history.length ? <button type="button" className="outline-link" onClick={undo}>Undo last vote</button> : null}
    </div>
  </section>;

  const picture = findMemeImage(current.image_path);
  return <section className="judge" aria-label="Judge captions one at a time">
    <div className="judge-progress">
      <span>{done} of {total} judged</span>
      <span className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="Judging progress"><span style={{ width: `${progress}%` }} /></span>
      <span>{queue.length} left</span>
    </div>
    <article className={`judge-card ${flash ? `flash-${flash}` : ""}`} key={current.id} aria-live="polite">
      {picture ? <Image className="judge-picture" src={picture.path} alt={current.image_description} width={picture.width} height={picture.height} sizes="(max-width: 768px) 100vw, 720px" priority /> : <div className="judge-scene"><span className="eyebrow">The scene</span><p>{current.image_description}</p></div>}
      <div className="judge-copy">
        {current.tone ? <span className={`tone-chip tone-${current.tone.toLowerCase()}`}>{current.tone}</span> : null}
        <p className="judge-caption">{current.caption_text}</p>
        {picture ? <p className="image-description">{current.image_description}</p> : null}
      </div>
    </article>
    <div className="judge-buttons">
      <button type="button" className="judge-button judge-missed" onClick={() => judge(-1)}><span aria-hidden="true">😶</span>Missed<kbd>←</kbd></button>
      <button type="button" className="judge-button judge-skip" onClick={() => judge(0)}>Skip<kbd>S</kbd></button>
      <button type="button" className="judge-button judge-funny" onClick={() => judge(1)}><span aria-hidden="true">😂</span>Funny<kbd>→</kbd></button>
    </div>
    <div className="judge-footer">
      <button type="button" className="text-button" onClick={undo} disabled={!history.length}>↶ Undo <kbd>Z</kbd></button>
      <Link className="text-button" href={`/c/${current.id}`}>Open this caption</Link>
    </div>
    {error ? <p className="form-message form-error" role="alert">{error}</p> : null}
  </section>;
}
