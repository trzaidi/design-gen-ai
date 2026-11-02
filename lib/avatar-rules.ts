// Shared by the profile form (instant feedback) and the server action (enforcement).
// Storage accepts 5 MB, but Vercel rejects any request body over 4.5 MB, so 4 MB
// leaves room for the rest of the form.
export const AVATAR_MAX_BYTES = 4 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const formatMegabytes = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export function avatarProblem(file: { type: string; size: number }): string | null {
  if (!AVATAR_TYPES.includes(file.type)) {
    return "That file type isn’t supported. Choose a JPG, PNG, WEBP, or GIF image.";
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return `That image is ${formatMegabytes(file.size)}. Photos must be 4 MB or smaller because our hosting provider limits upload size. Try a smaller or compressed version.`;
  }
  return null;
}
