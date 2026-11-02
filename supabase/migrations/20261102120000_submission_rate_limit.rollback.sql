-- Prepared only. Use after CPC approval to remove Fix A's execution path.
begin;
revoke all on function public.submit_catalogue_request_with_rate_limit(jsonb,text,integer,integer) from service_role;
drop function if exists public.submit_catalogue_request_with_rate_limit(jsonb,text,integer,integer);
drop index if exists private.catalogue_request_attempts_hash_time_idx;
drop index if exists private.catalogue_request_attempts_time_idx;
commit;
