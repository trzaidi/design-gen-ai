-- Only privileged administration can set account-specific allowances. NULL means unlimited.
create table private.generation_allowances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_limit integer check (daily_limit is null or daily_limit > 0)
);
alter table private.generation_allowances enable row level security;
revoke all on private.generation_allowances from public, anon, authenticated;

create or replace function private.limit_generations() returns trigger language plpgsql security definer set search_path = '' as $$
declare
  account_limit integer;
begin
  if auth.uid() is null or auth.uid() <> new.user_id then raise exception 'not_authenticated' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
  select daily_limit into account_limit from private.generation_allowances where user_id = new.user_id;
  if not found then account_limit := 10; end if;
  if account_limit is not null and (select count(*) from public.generation_requests where user_id = new.user_id and created_at > now() - interval '24 hours') >= account_limit then
    raise exception 'generation_limit' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function private.limit_generations() from public, anon, authenticated;

-- Members can read only their own effective limit, never set an allowance.
create function public.generation_daily_limit() returns integer language plpgsql stable security definer set search_path = '' as $$
declare
  account_limit integer;
begin
  if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  select daily_limit into account_limit from private.generation_allowances where user_id = auth.uid();
  if not found then return 10; end if;
  return account_limit;
end;
$$;
revoke all on function public.generation_daily_limit() from public, anon;
grant execute on function public.generation_daily_limit() to authenticated;
