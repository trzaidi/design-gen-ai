"use client";
import { useOptimistic, useState, useTransition } from "react";
import { rateCaption } from "@/app/arena-actions";
import { applyVote } from "@/lib/arena";

type Totals = { upvotes: number; downvotes: number };

export function VoteControls({ captionId, vote, totals }: { captionId: number; vote: number; totals: Totals }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  // Shows the new score immediately; React reverts it if the server rejects the vote.
  const [current, setCurrent] = useOptimistic({ vote, ...totals, score: totals.upvotes - totals.downvotes }, applyVote);
  function rate(value: number) {
    const next = current.vote === value ? 0 : value;
    startTransition(async () => {
      setCurrent(next);
      try {
        const result = await rateCaption(captionId, next);
        setMessage(result.error ?? ""); setFailed(Boolean(result.error));
      } catch { setFailed(true); setMessage("Your vote could not be saved. Try again."); }
    });
  }
  return <div className="vote-area">
    <ScoreLine {...current} />
    <div className="vote-controls" role="group" aria-label="Rate this caption">
      <button type="button" className="vote-button vote-funny" aria-pressed={current.vote === 1} onClick={() => rate(1)}><span aria-hidden="true">😂</span> Funny</button>
      <button type="button" className="vote-button vote-missed" aria-pressed={current.vote === -1} onClick={() => rate(-1)}><span aria-hidden="true">😶</span> Missed</button>
      <span className="vote-hint" aria-live="polite">{pending ? "Saving…" : current.vote ? "Tap again to undo" : "Your call"}</span>
    </div>
    {message ? <p className={failed ? "vote-status vote-error" : "vote-status"} role={failed ? "alert" : "status"}>{message}</p> : null}
  </div>;
}

export function ScoreLine({ upvotes, downvotes }: Totals) {
  const total = upvotes + downvotes;
  const percent = total ? Math.round((upvotes / total) * 100) : 0;
  return <div className="caption-score">
    <strong>{upvotes - downvotes} pts</strong>
    <span className={total ? "score-meter" : "score-meter empty"} aria-hidden="true"><span style={{ width: `${percent}%` }} /></span>
    <span>{total ? `${percent}% laughed · ${total} vote${total === 1 ? "" : "s"}` : "No votes yet"}</span>
  </div>;
}
