-- Applied October 25, 2026. Attach existing assets only to the ten missing-image rows.
-- Idempotent; preserves caption text, generation provenance and every existing vote.
WITH matches(id,path) AS (VALUES
 (7,'/memes/cu-butler-library.webp'),(8,'/memes/become-ungovernable.webp'),
 (9,'/memes/cu-butler-library.webp'),(10,'/memes/police-goose.webp'),
 (11,'/memes/police-goose.webp'),(12,'/memes/police-goose.webp'),
 (13,'/memes/police-goose.webp'),(15,'/memes/cu-butler-library.webp'),
 (16,'/memes/cu-butler-library.webp'),(17,'/memes/cu-butler-library.webp'))
UPDATE public.captions c SET image_path=m.path FROM matches m
WHERE c.id=m.id AND c.image_path IS NULL;
