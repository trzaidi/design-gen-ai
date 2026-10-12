-- Integration test: all mutations roll back. Existing accounts are never modified.
begin;
create temporary table test_ids as select (select id from public.profiles limit 1) as a, gen_random_uuid() as b, (select min(id) from public.captions) as caption;
grant select on test_ids to authenticated, anon;

set local role anon;
do $$ begin
  if (select count(id) from public.captions) < 6 then raise exception 'Public archive unavailable'; end if;
  perform 1 from public.caption_stats;
  begin perform 1 from public.votes; raise exception 'Anonymous votes exposed'; exception when insufficient_privilege then null; end;
  begin insert into public.votes(caption_id,value) select caption,1 from test_ids; raise exception 'Anonymous vote allowed'; exception when insufficient_privilege then null; end;
  begin insert into public.generation_requests(prompt,model) values ('test prompt','test/model'); raise exception 'Anonymous generation allowed'; exception when insufficient_privilege then null; end;
  begin perform public.generation_daily_limit(); raise exception 'Anonymous allowance read allowed'; exception when insufficient_privilege then null; end;
  begin update public.caption_stats set upvotes=999; raise exception 'Score tampering allowed'; exception when insufficient_privilege then null; end;
end $$;

reset role;
select set_config('request.jwt.claims',json_build_object('sub',a,'role','authenticated','is_anonymous',false)::text,true) from test_ids;
set local role authenticated;
insert into public.votes(caption_id,value) select caption,1 from test_ids;
do $$ begin
  if (select score from public.caption_stats where caption_id=(select caption from test_ids)) <> 1 then raise exception 'Upvote tally wrong'; end if;
  if public.generation_daily_limit() <> 10 then raise exception 'Default generation allowance wrong'; end if;
  begin insert into private.generation_allowances(user_id,daily_limit) select a,null from test_ids; raise exception 'Allowance escalation allowed'; exception when insufficient_privilege then null; end;
  begin insert into public.votes(caption_id,value) select caption,1 from test_ids; raise exception 'Duplicate vote allowed'; exception when unique_violation then null; end;
  begin insert into public.votes(user_id,caption_id,value) select b,caption,1 from test_ids; raise exception 'Owner spoof allowed'; exception when insufficient_privilege then null; end;
  begin update public.caption_stats set upvotes=999; raise exception 'Score tampering allowed'; exception when insufficient_privilege then null; end;
  begin insert into public.generation_requests(prompt,model,created_at) values ('test prompt','test/model',now()-interval '2 days'); raise exception 'Quota timestamp spoof allowed'; exception when insufficient_privilege then null; end;
end $$;
update public.votes set value=-1;
do $$ begin
  if (select score from public.caption_stats where caption_id=(select caption from test_ids)) <> -1 then raise exception 'Vote switch tally wrong'; end if;
end $$;
insert into public.generation_requests(prompt,model) values ('test prompt','test/model');
insert into public.captions(caption_text,image_description,prompt,model,tone,generation_id)
select 'RLS test caption', 'A student on a subway platform.', 'test prompt','test/model','Deadpan', id from public.generation_requests limit 1;
do $$ begin
  begin insert into public.captions(caption_text,image_description,prompt,model,tone,generation_id)
    select 'Duplicate generation', 'A student on a subway platform.', 'test prompt','test/model','Deadpan', id from public.generation_requests limit 1;
    raise exception 'Generation reuse allowed'; exception when unique_violation then null; end;
end $$;
insert into public.generation_requests(prompt,model) select 'another test prompt','test/model' from generate_series(1,9);
do $$ begin
  begin insert into public.generation_requests(prompt,model) values ('11th test prompt','test/model'); raise exception '11th generation allowed';
    exception when sqlstate 'P0001' then if sqlerrm <> 'generation_limit' then raise; end if; end;
end $$;

reset role;
select set_config('request.jwt.claims',json_build_object('sub',b,'role','authenticated','is_anonymous',false)::text,true) from test_ids;
set local role authenticated;
do $$ begin
  if (select count(*) from public.votes) <> 0 then raise exception 'Other users votes exposed'; end if;
  if (select count(*) from public.generation_requests) <> 0 then raise exception 'Other users requests exposed'; end if;
end $$;
update public.votes set value=1;
delete from public.votes;
do $$ begin
  if (select score from public.caption_stats where caption_id=(select caption from test_ids)) <> -1 then raise exception 'Other users vote mutated'; end if;
end $$;

reset role;
select set_config('request.jwt.claims',json_build_object('sub',a,'role','authenticated','is_anonymous',false)::text,true) from test_ids;
set local role authenticated;
delete from public.votes;
do $$ begin
  if (select score from public.caption_stats where caption_id=(select caption from test_ids)) <> 0 then raise exception 'Vote removal tally wrong'; end if;
end $$;
reset role;
insert into private.generation_allowances(user_id,daily_limit) select a,null from test_ids;
set local role authenticated;
do $$ begin
  if public.generation_daily_limit() is not null then raise exception 'Unlimited allowance wrong'; end if;
end $$;
insert into public.generation_requests(prompt,model) select 'unlimited test prompt','test/model' from generate_series(1,60);
reset role;
rollback;
select 'PASS: public reads, anonymous denial, owned mutations, duplicate prevention, private records, aggregate integrity, generation quota, rollback' as result;
