-- Repository preparation only. No Edge Function calls these controls until trusted client identity is established.
create schema if not exists private;

create table if not exists private.catalogue_request_rate_limit_attempts (
  id bigint generated always as identity primary key,
  fingerprint text not null check (fingerprint ~ '^[0-9a-f]{64}$'),
  idempotency_key uuid not null unique,
  payload_digest text not null check (payload_digest ~ '^[0-9a-f]{64}$'),
  attempted_at timestamptz not null default current_timestamp,
  expires_at timestamptz not null,
  check (expires_at = attempted_at + interval '24 hours')
);

alter table private.catalogue_request_rate_limit_attempts enable row level security;
revoke all on table private.catalogue_request_rate_limit_attempts from public, anon, authenticated, service_role;

create index if not exists catalogue_request_rate_limit_window_idx
  on private.catalogue_request_rate_limit_attempts (fingerprint, attempted_at);
create index if not exists catalogue_request_rate_limit_expiry_idx
  on private.catalogue_request_rate_limit_attempts (expires_at, id);

create or replace function public.claim_catalogue_request_rate_limit(
  p_fingerprint text,
  p_idempotency_key uuid,
  p_payload_digest text
) returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_now timestamptz := current_timestamp;
  v_existing_digest text;
  v_attempt_count integer;
begin
  if p_fingerprint is null or p_fingerprint !~ '^[0-9a-f]{64}$'
    or p_idempotency_key is null
    or p_payload_digest is null or p_payload_digest !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid rate-limit claim';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_idempotency_key::text, 0));
  delete from private.catalogue_request_rate_limit_attempts
  where idempotency_key = p_idempotency_key
    and expires_at <= v_now;

  select a.payload_digest into v_existing_digest
  from private.catalogue_request_rate_limit_attempts as a
  where a.idempotency_key = p_idempotency_key;
  if found then
    if v_existing_digest = p_payload_digest then
      return pg_catalog.jsonb_build_object('decision', 'retry');
    end if;
    return pg_catalog.jsonb_build_object('decision', 'idempotency_payload_mismatch');
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_fingerprint, 0));
  select count(*)::integer into v_attempt_count
  from private.catalogue_request_rate_limit_attempts as a
  where a.fingerprint = p_fingerprint
    and a.attempted_at >= v_now - interval '10 minutes'
    and a.expires_at > v_now;
  if v_attempt_count >= 8 then
    return pg_catalog.jsonb_build_object('decision', 'limited');
  end if;

  insert into private.catalogue_request_rate_limit_attempts (
    fingerprint,
    idempotency_key,
    payload_digest,
    attempted_at,
    expires_at
  ) values (
    p_fingerprint,
    p_idempotency_key,
    p_payload_digest,
    v_now,
    v_now + interval '24 hours'
  );

  return pg_catalog.jsonb_build_object('decision', 'allowed');
end $$;

create or replace function public.cleanup_catalogue_request_rate_limit_attempts(
  p_batch_limit integer default 1000
) returns integer
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_deleted integer := 0;
begin
  if p_batch_limit not between 1 and 1000 then
    raise exception 'Invalid cleanup batch limit';
  end if;

  with candidates as materialized (
    select a.id
    from private.catalogue_request_rate_limit_attempts as a
    where a.expires_at <= current_timestamp
    order by a.expires_at asc, a.id asc
    limit p_batch_limit
    for update skip locked
  ), deleted as (
    delete from private.catalogue_request_rate_limit_attempts as a
    using candidates as c
    where a.id = c.id
    returning a.id
  )
  select count(*)::integer into v_deleted from deleted;

  return v_deleted;
end $$;

revoke all on function public.claim_catalogue_request_rate_limit(text, uuid, text) from public, anon, authenticated;
revoke all on function public.cleanup_catalogue_request_rate_limit_attempts(integer) from public, anon, authenticated;
grant execute on function public.claim_catalogue_request_rate_limit(text, uuid, text) to service_role;
grant execute on function public.cleanup_catalogue_request_rate_limit_attempts(integer) to service_role;
