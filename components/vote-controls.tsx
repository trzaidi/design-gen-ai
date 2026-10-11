"use client";
import { useState, useTransition } from "react";
import { rateCaption } from "@/app/arena-actions";

export function VoteControls({ captionId, vote }: { captionId: number; vote: number }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  function rate(value: number) {
    startTransition(async () => {
      try {
        const result = await rateCaption(captionId, vote === value ? 0 : value);
        setMessage(result.error ?? result.success ?? ""); setFailed(Boolean(result.error));
      } catch { setFailed(true); setMessage("Your vote could not be saved. Try again."); }
    });
  }
  return <div className="vote-area">
    <div className="vote-controls" aria-label="Rate this caption">
      <button className="vote-button" aria-pressed={vote === 1} disabled={pending} onClick={() => rate(1)}><span aria-hidden="true">↑</span> Funny</button>
      <button className="vote-button" aria-pressed={vote === -1} disabled={pending} onClick={() => rate(-1)}><span aria-hidden="true">↓</span> Missed</button>
      <span className="vote-hint">{pending ? "Saving…" : vote ? "Tap again to undo" : "Your call"}</span>
    </div>
    <p className={failed ? "vote-status vote-error" : "vote-status"} role={failed ? "alert" : "status"} aria-live="polite">{message}</p>
  </div>;
}
