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
};
