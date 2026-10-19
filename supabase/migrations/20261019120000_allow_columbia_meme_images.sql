-- Week 5: allow captions on the new Columbia campus photos.
-- Accept any bundled /memes/*.webp path so future pictures don't need a migration;
-- the app still only offers pictures listed in lib/meme-images.ts.
alter table public.captions drop constraint captions_image_path_check;
alter table public.captions add constraint captions_image_path_check
  check (image_path is null or image_path ~ '^/memes/[a-z0-9-]+\.webp$');
