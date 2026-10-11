-- Evaluate immutable JWT claims once per statement instead of per row.
alter policy "Members reserve their own generations" on public.generation_requests with check (
  (select auth.uid()) = user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false)
);
alter policy "Members cast their own votes" on public.votes with check (
  (select auth.uid()) = user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false)
);
alter policy "Members publish their generated captions" on public.captions with check (
  user_id = (select auth.uid())
  and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false)
  and char_length(caption_text) between 1 and 500
  and char_length(image_description) between 10 and 600
  and tone in ('Deadpan', 'Unhinged', 'Wholesome')
  and exists (select 1 from public.generation_requests r where r.id = generation_id and r.user_id = (select auth.uid()) and r.prompt = captions.prompt and r.model = captions.model)
);
