export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_path: string | null;
  updated_at: string;
};

export type Caption = {
  id: number;
  caption_text: string;
  image_description: string;
  created_at: string;
  prompt: string | null;
  model: string | null;
  tone: string | null;
  image_path: string | null;
};

export type CaptionStats = { caption_id: number; upvotes: number; downvotes: number; score: number };
export type ActionResult = { error?: string; success?: string; captionId?: number };
