-- Prepared only. Use only to reverse 20261102_enforce_custom_kit_publication_eligibility.sql after CPC approval.
-- This restores the prior validation and therefore reopens the eligibility gap.
begin;

do $$
declare
  definition text;
  match_count integer;
  old_clause text := $old$if v_item_type='custom-kit' and (v_publication.catalogue_category is distinct from 'Early Learning' or v_publication.custom_kit_eligible is not true) then raise exception 'Ineligible Custom Kit publication'; end if;$old$;
  new_clause text := $new$if v_item_type='custom-kit' and v_publication.custom_kit_eligible is false then raise exception 'Ineligible Custom Kit publication'; end if;$new$;
begin
  select pg_get_functiondef('public.submit_catalogue_request(jsonb)'::regprocedure)
    into definition;
  match_count := (length(definition) - length(replace(definition, old_clause, ''))) / length(old_clause);
  if definition is null or match_count <> 1 then
    raise exception 'submit_catalogue_request(jsonb) must have exactly one strict Custom Kit eligibility validation (found %).', coalesce(match_count, 0);
  end if;
  execute replace(definition, old_clause, new_clause);
end $$;

commit;
