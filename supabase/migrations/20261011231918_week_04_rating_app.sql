-- Week 4: user-owned votes, persisted AI prompts, and public anonymous totals.
-- Preserves every existing caption and profile.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.generation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  prompt text not null check (char_length(prompt) between 10 and 1600),
  model text not null check (char_length(model) between 1 and 120),
  created_at timestamptz not null default now()
);
create index generation_requests_user_created_idx on public.generation_requests (user_id, created_at desc);
alter table public.generation_requests enable row level security;
revoke all on public.generation_requests from anon, authenticated;
grant select on public.generation_requests to authenticated;
grant insert (prompt, model) on public.generation_requests to authenticated;
create policy "Members read their generation requests" on public.generation_requests for select to authenticated using ((select auth.uid()) = user_id);
create policy "Members reserve their own generations" on public.generation_requests for insert to authenticated with check ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false));

-- Definer is necessary to count all reservations, regardless of client filters.
-- Private, not directly callable, and checks the verified subject before counting.
create function private.limit_generations() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or auth.uid() <> new.user_id then raise exception 'not_authenticated' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
  if (select count(*) from public.generation_requests where user_id = new.user_id and created_at > now() - interval '24 hours') >= 5 then
    raise exception 'generation_limit' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function private.limit_generations() from public, anon, authenticated;
create trigger limit_generation_requests before insert on public.generation_requests for each row execute function private.limit_generations();

alter table public.captions add column user_id uuid default auth.uid() references auth.users(id) on delete set null;
alter table public.captions add column generation_id uuid unique references public.generation_requests(id) on delete set null;
alter table public.captions add column prompt text;
alter table public.captions add column model text;
alter table public.captions add column tone text;
create index captions_user_id_idx on public.captions(user_id);
alter table public.captions enable row level security;
revoke all on public.captions from anon, authenticated;
grant select (id, caption_text, image_description, created_at, prompt, model, tone) on public.captions to anon, authenticated;
grant insert (caption_text, image_description, prompt, model, tone, generation_id) on public.captions to authenticated;
grant usage on sequence public.captions_id_seq to authenticated;
create policy "Members publish their generated captions" on public.captions for insert to authenticated with check (
  user_id = (select auth.uid())
  and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false)
  and char_length(caption_text) between 1 and 500
  and char_length(image_description) between 10 and 600
  and tone in ('Deadpan', 'Unhinged', 'Wholesome')
  and exists (select 1 from public.generation_requests r where r.id = generation_id and r.user_id = (select auth.uid()) and r.prompt = captions.prompt and r.model = captions.model)
);

create table public.votes (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  caption_id bigint not null references public.captions(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (user_id, caption_id)
);
create index votes_caption_id_idx on public.votes(caption_id);
alter table public.votes enable row level security;
revoke all on public.votes from anon, authenticated;
grant select, delete on public.votes to authenticated;
grant insert (caption_id, value) on public.votes to authenticated;
grant update (value) on public.votes to authenticated;
create policy "Members read their own votes" on public.votes for select to authenticated using ((select auth.uid()) = user_id);
create policy "Members cast their own votes" on public.votes for insert to authenticated with check ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false));
create policy "Members change their own votes" on public.votes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Members remove their own votes" on public.votes for delete to authenticated using ((select auth.uid()) = user_id);

create table public.caption_stats (
  caption_id bigint primary key references public.captions(id) on delete cascade,
  upvotes bigint not null default 0 check (upvotes >= 0),
  downvotes bigint not null default 0 check (downvotes >= 0),
  score bigint generated always as (upvotes - downvotes) stored
);
alter table public.caption_stats enable row level security;
revoke all on public.caption_stats from anon, authenticated;
grant select on public.caption_stats to anon, authenticated;
create policy "Anyone reads aggregate scores" on public.caption_stats for select to anon, authenticated using (true);
insert into public.caption_stats(caption_id) select id from public.captions;

-- Only triggers can maintain scores; clients never see other people's votes.
create function private.initialize_caption_stats() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.caption_stats(caption_id) values (new.id);
  return new;
end;
$$;
revoke all on function private.initialize_caption_stats() from public, anon, authenticated;
create trigger initialize_caption_stats after insert on public.captions for each row execute function private.initialize_caption_stats();

create function private.update_caption_stats() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.caption_stats set upvotes = upvotes + (new.value = 1)::int, downvotes = downvotes + (new.value = -1)::int where caption_id = new.caption_id;
    return new;
  elsif tg_op = 'UPDATE' then
    update public.caption_stats set upvotes = upvotes + (new.value = 1)::int - (old.value = 1)::int, downvotes = downvotes + (new.value = -1)::int - (old.value = -1)::int where caption_id = new.caption_id;
    return new;
  else
    update public.caption_stats set upvotes = upvotes - (old.value = 1)::int, downvotes = downvotes - (old.value = -1)::int where caption_id = old.caption_id;
    return old;
  end if;
end;
$$;
revoke all on function private.update_caption_stats() from public, anon, authenticated;
create trigger update_caption_stats after insert or update or delete on public.votes for each row execute function private.update_caption_stats();

-- Tighten existing profile grants without disturbing the Week 3 ownership policies.
alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
