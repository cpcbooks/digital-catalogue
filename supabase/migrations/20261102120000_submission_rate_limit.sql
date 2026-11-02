-- Prepared only. Apply after CPC approval, before deploying the matching Edge Function.
begin;

alter table private.catalogue_request_attempts drop column if exists ip;
alter table private.catalogue_request_attempts add column if not exists client_hash text;
alter table private.catalogue_request_attempts alter column client_hash set not null;
drop index if exists private.catalogue_request_attempts_ip_time_idx;
create index if not exists catalogue_request_attempts_hash_time_idx on private.catalogue_request_attempts(client_hash, attempted_at desc);
create index if not exists catalogue_request_attempts_time_idx on private.catalogue_request_attempts(attempted_at);

create or replace function public.submit_catalogue_request_with_rate_limit(payload jsonb, p_client_hash text, p_short_limit integer, p_long_limit integer)
returns jsonb
language plpgsql
security definer
set search_path to public, private, pg_temp
as $$
declare
  key_text text := payload->>'idempotencyKey';
  short_count integer;
  long_count integer;
  retry_after integer;
begin
  if p_client_hash !~ '^[A-Za-z0-9_-]{43}$' or p_short_limit not between 1 and 1000 or p_long_limit not between p_short_limit and 1000 or key_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    raise exception 'Invalid submission rate-limit request';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(key_text, 0));
  if exists(select 1 from public.requests where idempotency_key=key_text::uuid) then
    return public.submit_catalogue_request(payload);
  end if;

  perform pg_advisory_xact_lock(hashtextextended('catalogue-request-rate:'||p_client_hash, 0));
  delete from private.catalogue_request_attempts where attempted_at < now()-interval '24 hours';
  select count(*) into short_count from private.catalogue_request_attempts where client_hash=p_client_hash and attempted_at >= now()-interval '10 minutes';
  select count(*) into long_count from private.catalogue_request_attempts where client_hash=p_client_hash and attempted_at >= now()-interval '24 hours';
  if short_count >= p_short_limit then
    select greatest(1,ceil(extract(epoch from min(attempted_at)+interval '10 minutes'-now()))::integer) into retry_after from private.catalogue_request_attempts where client_hash=p_client_hash and attempted_at >= now()-interval '10 minutes';
    return jsonb_build_object('ok',false,'rateLimited',true,'retryAfter',retry_after);
  end if;
  if long_count >= p_long_limit then
    select greatest(1,ceil(extract(epoch from min(attempted_at)+interval '24 hours'-now()))::integer) into retry_after from private.catalogue_request_attempts where client_hash=p_client_hash and attempted_at >= now()-interval '24 hours';
    return jsonb_build_object('ok',false,'rateLimited',true,'retryAfter',retry_after);
  end if;

  insert into private.catalogue_request_attempts(client_hash) values(p_client_hash);
  return public.submit_catalogue_request(payload);
end;
$$;

revoke all on table private.catalogue_request_attempts from public, anon, authenticated;
revoke all on function public.submit_catalogue_request_with_rate_limit(jsonb,text,integer,integer) from public, anon, authenticated;
grant execute on function public.submit_catalogue_request_with_rate_limit(jsonb,text,integer,integer) to service_role;

commit;
