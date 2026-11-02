"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { AVATAR_TYPES, avatarProblem } from "@/lib/avatar-rules";

// Checks the photo as soon as it is chosen, so an oversized image never reaches
// the upload limit and the member learns why it was refused.
export function AvatarInput() {
  const input = useRef<HTMLInputElement>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function check(file: File | undefined) {
    setPreview(null);
    const message = file ? avatarProblem(file) : null;
    setProblem(message);
    if (message && input.current) input.current.value = "";
    else if (file) setPreview(URL.createObjectURL(file));
  }

  return (
    <label>
      <span>Profile photo</span>
      <input ref={input} name="avatar" type="file" accept={AVATAR_TYPES.join(",")} aria-describedby="avatar-help avatar-problem" onChange={(event) => check(event.target.files?.[0])} />
      <small id="avatar-help">JPG, PNG, WEBP, or GIF · 4 MB maximum</small>
      {problem ? <p className="form-message form-error" id="avatar-problem" role="alert">{problem}</p> : null}
      {preview ? <img className="avatar-preview avatar-preview-small" src={preview} alt="New profile photo preview" /> : null}
    </label>
  );
}
