-- Increase the application allowance while preserving ownership and serialized reservations.
create or replace function private.limit_generations() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or auth.uid() <> new.user_id then raise exception 'not_authenticated' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
  if (select count(*) from public.generation_requests where user_id = new.user_id and created_at > now() - interval '24 hours') >= 50 then
    raise exception 'generation_limit' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function private.limit_generations() from public, anon, authenticated;
