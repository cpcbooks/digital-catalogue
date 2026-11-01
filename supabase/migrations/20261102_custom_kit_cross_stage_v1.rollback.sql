-- Prepared only. Use only to reverse 20261102_custom_kit_cross_stage_v1.sql.
begin;

update public.early_learning_kit_rules
set completion_enabled = false,
    minimum_distinct_titles = 8
where stage_code = 'playgroup';

drop policy if exists "catalogue reads enabled Early Learning kit rules" on public.early_learning_kit_rules;
revoke select on public.early_learning_kit_rules from anon;

do $$
declare
  definition text;
  match_count integer;
  old_clause text := $old$if v_item_type='custom-kit' and v_publication.custom_kit_eligible is false then raise exception 'Ineligible Custom Kit publication'; end if;$old$;
  new_clause text := $new$if v_item_type='custom-kit' and (v_publication.custom_kit_eligible is false or not exists(select 1 from unnest(v_publication.class_stage) as s(stage_code) where lower(s.stage_code)=v_level)) then raise exception 'Ineligible Custom Kit publication'; end if;$new$;
begin
  select pg_get_functiondef('public.submit_catalogue_request(jsonb)'::regprocedure)
    into definition;
  match_count := (length(definition) - length(replace(definition, old_clause, ''))) / length(old_clause);
  if definition is null or match_count <> 1 then
    raise exception 'submit_catalogue_request(jsonb) must have exactly one cross-stage Custom Kit validation (found %).', coalesce(match_count, 0);
  end if;
  execute replace(definition, old_clause, new_clause);
end $$;

commit;
