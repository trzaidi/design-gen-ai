export const MEME_IMAGES = [
  { path: "/memes/become-ungovernable.webp", title: "Bowling, but make it basketball", description: "A man throwing a bowling ball overhand like a basketball down a bowling lane.", width: 763, height: 1280, source: "User-provided photo" },
  { path: "/memes/hoa-tornado.webp", title: "Lawn care during a tornado", description: "A man calmly mowing his lawn while a tornado approaches in the distance.", width: 1536, height: 1024, source: "AI-generated image" },
  { path: "/memes/airport-armor.webp", title: "Airport security in armor", description: "A person wearing full medieval armor while standing in an airport security line.", width: 1536, height: 1024, source: "AI-generated image" },
  { path: "/memes/raccoon-credit.webp", title: "Raccoon at self-checkout", description: "A raccoon holding a credit card at a self-checkout machine.", width: 1536, height: 1024, source: "AI-generated image" },
  { path: "/memes/waiting-skeleton.webp", title: "Waiting room skeleton", description: "A skeleton sitting in a medical waiting room while holding a clipboard.", width: 1536, height: 1024, source: "AI-generated image" },
  { path: "/memes/police-goose.webp", title: "Goose on patrol", description: "A goose standing triumphantly on the roof of a police car.", width: 1536, height: 1024, source: "AI-generated image" },
] as const;

export function findMemeImage(path: string | null | undefined) {
  return MEME_IMAGES.find((image) => image.path === path);
}
