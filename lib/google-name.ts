// Google sign-in supplies the member's name; use it so new members skip the profile form.
export function nameFromMetadata(metadata: Record<string, unknown> | undefined) {
  const text = (value: unknown) => (typeof value === "string" ? value.trim().slice(0, 80) : "");
  let first = text(metadata?.given_name);
  let last = text(metadata?.family_name);
  if (!first || !last) {
    const parts = text(metadata?.full_name ?? metadata?.name).split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      first ||= parts.slice(0, -1).join(" ").slice(0, 80);
      last ||= parts.at(-1)!.slice(0, 80);
    }
  }
  return { first, last };
}
