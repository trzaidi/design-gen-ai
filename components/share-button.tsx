"use client";
import { useState } from "react";

export function ShareButton({ captionId, text }: { captionId: number; text: string }) {
  const [label, setLabel] = useState("Share");
  async function share() {
    const url = `${window.location.origin}/c/${captionId}`;
    try {
      if (navigator.share) await navigator.share({ title: "Caption Archive", text, url });
      else { await navigator.clipboard.writeText(url); setLabel("Link copied"); }
    } catch (error) {
      if ((error as Error).name !== "AbortError") setLabel("Copy failed");
    }
    setTimeout(() => setLabel("Share"), 2000);
  }
  return <button type="button" className="text-button" onClick={share}><span aria-hidden="true">↗</span> <span aria-live="polite">{label}</span></button>;
}
