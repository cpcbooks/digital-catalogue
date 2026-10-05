-- DEVELOPMENT ONLY: replace this LKG composition during final item-master cutover.
revoke insert, update, delete on table public.standard_kit_definitions, public.standard_kit_publications from public, anon, authenticated;
grant select (stage_code, display_name, enabled) on table public.standard_kit_definitions to anon;
grant select (stage_code, position, publication_id) on table public.standard_kit_publications to anon;

create policy "catalogue reads enabled Standard Kit definitions"
on public.standard_kit_definitions
for select
to anon
using (enabled);

create policy "catalogue reads enabled Standard Kit publications"
on public.standard_kit_publications
for select
to anon
using (
  exists (
    select 1
    from public.standard_kit_definitions as d
    where d.stage_code = standard_kit_publications.stage_code
      and d.enabled
  )
);

insert into public.standard_kit_definitions (stage_code, display_name, enabled)
values ('lkg', 'Development LKG Standard Kit', true);

insert into public.standard_kit_publications (stage_code, position, publication_id) values
  ('lkg', 1, 'd2f74316-549c-4314-a0ec-30dac203d4c4'),
  ('lkg', 2, '8c14137e-1eb2-46a0-92a4-7c3b84ad49f0'),
  ('lkg', 3, 'd0c24be5-f9fc-405a-a8f5-e68a9a297eed'),
  ('lkg', 4, 'efa6db9b-275e-4858-b58b-02cb32ed62ae'),
  ('lkg', 5, 'b2ab5412-b8e4-4ccc-a1e0-79ec7fb03a76'),
  ('lkg', 6, '1b01fbc2-07ef-410e-b1de-1e163ee3e9eb'),
  ('lkg', 7, 'e9da7784-6611-4682-a3e7-148982c1a37b'),
  ('lkg', 8, '52bf6599-f101-40c6-ac9b-aadd97f8ddeb');
