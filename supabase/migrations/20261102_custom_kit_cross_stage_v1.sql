-- Prepared only. Apply after CPC approval in project ysaxagxortpxyifyaydx.
begin;

do $$
begin
  if not exists (
    select 1 from public.early_learning_kit_rules
    where stage_code = 'playgroup'
      and enabled is true
      and minimum_distinct_titles = 8
  ) then
    raise exception 'Expected Playgroup Custom Kit rule is not present.';
  end if;
end $$;

update public.early_learning_kit_rules
set completion_enabled = true,
    minimum_distinct_titles = 8
where stage_code = 'playgroup';

grant select on public.early_learning_kit_rules to anon;
drop policy if exists "catalogue reads enabled Early Learning kit rules" on public.early_learning_kit_rules;
create policy "catalogue reads enabled Early Learning kit rules"
  on public.early_learning_kit_rules
  for select to anon
  using (enabled);

do $$
declare
  definition text;
  match_count integer;
  old_clause text := $old$if v_item_type='custom-kit' and (v_publication.custom_kit_eligible is false or not exists(select 1 from unnest(v_publication.class_stage) as s(stage_code) where lower(s.stage_code)=v_level)) then raise exception 'Ineligible Custom Kit publication'; end if;$old$;
  new_clause text := $new$if v_item_type='custom-kit' and v_publication.custom_kit_eligible is false then raise exception 'Ineligible Custom Kit publication'; end if;$new$;
begin
  select pg_get_functiondef('public.submit_catalogue_request(jsonb)'::regprocedure)
    into definition;
  match_count := (length(definition) - length(replace(definition, old_clause, ''))) / length(old_clause);
  if definition is null or match_count <> 1 then
    raise exception 'submit_catalogue_request(jsonb) must have exactly one audited Custom Kit stage restriction (found %).', coalesce(match_count, 0);
  end if;
  execute replace(definition, old_clause, new_clause);
end $$;

commit;
