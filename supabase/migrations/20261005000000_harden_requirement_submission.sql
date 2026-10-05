-- Local preparation only. Deploy with the matching Edge Function as one pilot change.
alter table public.publications add column if not exists custom_kit_eligible boolean;
alter table public.requests add column if not exists idempotency_key uuid;
create unique index if not exists requests_idempotency_key_unique on public.requests(idempotency_key) where idempotency_key is not null;

create table if not exists public.early_learning_kit_rules (
  stage_code text primary key check (stage_code in ('playgroup','nursery','lkg','ukg')),
  enabled boolean not null default true,
  completion_enabled boolean not null default false,
  minimum_distinct_titles integer check (minimum_distinct_titles is null or minimum_distinct_titles > 0)
);
insert into public.early_learning_kit_rules(stage_code,enabled,completion_enabled,minimum_distinct_titles) values
 ('playgroup',true,false,null),('nursery',true,true,8),('lkg',true,true,8),('ukg',true,true,8)
on conflict (stage_code) do nothing;

create table if not exists public.standard_kit_definitions (
  stage_code text primary key check (stage_code in ('playgroup','nursery','lkg','ukg')),
  display_name text,
  enabled boolean not null default false
);
create table if not exists public.standard_kit_publications (
  stage_code text not null references public.standard_kit_definitions(stage_code) on delete cascade,
  position integer not null check (position > 0),
  publication_id uuid not null references public.publications(id),
  primary key (stage_code,position), unique (stage_code,publication_id)
);

-- These are internal CPC configuration tables. The SECURITY DEFINER RPC reads them;
-- browsers never need direct access.
alter table public.early_learning_kit_rules enable row level security;
alter table public.standard_kit_definitions enable row level security;
alter table public.standard_kit_publications enable row level security;
revoke all on table public.early_learning_kit_rules, public.standard_kit_definitions, public.standard_kit_publications from public, anon, authenticated;

alter table public.request_items drop constraint if exists request_items_check;
alter table public.request_items drop constraint if exists request_items_item_type_check;
alter table public.request_items add constraint request_items_item_type_check check (item_type in ('book','custom-kit','standard-kit'));
alter table public.request_items add constraint request_items_check check ((item_type='book' and kit_books is null) or (item_type in ('custom-kit','standard-kit') and kit_books is not null and jsonb_typeof(kit_books)='array'));

create or replace function public.submit_catalogue_request(payload jsonb) returns jsonb language plpgsql security definer set search_path to 'public','pg_temp' as $$
declare
  customer jsonb:=payload->'customer'; item jsonb; publication public.publications%rowtype; rule public.early_learning_kit_rules%rowtype;
  request_id uuid; reference text; item_id uuid; position integer:=0; component_position integer; quantity integer; total integer:=0;
  item_type text; level text; ids text[]; configured_ids text[]; id text; kit_books jsonb; standard_name text; line_title text;
begin
  if payload is null or jsonb_typeof(payload)<>'object' or (payload - array['customer','notes','items','idempotencyKey'])<>'{}'::jsonb then raise exception 'Invalid request payload'; end if;
  if jsonb_typeof(customer)<>'object' or (customer - array['customerType','contactName','organisationName','mobile','whatsapp','email','preferredContact','location','existingCambridgeCustomer'])<>'{}'::jsonb then raise exception 'Invalid customer details'; end if;
  if jsonb_typeof(customer->'location')<>'object' or (customer->'location' - array['city','district','state','pincode'])<>'{}'::jsonb then raise exception 'Invalid customer location'; end if;
  if customer->>'customerType' not in ('school','dealer','individual','other') or nullif(btrim(customer->>'contactName'),'') is null or length(customer->>'contactName') not between 2 and 80 or customer->>'mobile' !~ '^[6-9][0-9]{9}$' or nullif(btrim(customer->'location'->>'city'),'') is null or length(customer->'location'->>'city') not between 2 and 80 or customer->>'preferredContact' not in ('call','whatsapp','email') or customer->>'existingCambridgeCustomer' not in ('Yes','No','Not sure') then raise exception 'Invalid customer details'; end if;
  if customer->>'customerType' in ('school','dealer','other') and (nullif(btrim(customer->>'organisationName'),'') is null or length(customer->>'organisationName') not between 2 and 120) then raise exception 'Invalid customer details'; end if;
  if customer->>'whatsapp' is not null and (customer->>'whatsapp' !~ '^[6-9][0-9]{9}$' or length(customer->>'whatsapp')>10) then raise exception 'Invalid customer details'; end if;
  if customer->>'email' is not null and (length(customer->>'email')>120 or customer->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$') then raise exception 'Invalid customer details'; end if;
  if customer->>'preferredContact'='email' and customer->>'email' is null then raise exception 'Invalid customer details'; end if;
  if customer->>'preferredContact'='whatsapp' and customer->>'whatsapp' is null then raise exception 'Invalid customer details'; end if;
  if customer->'location'->>'pincode' is not null and (customer->'location'->>'pincode' !~ '^[0-9]{6}$' or length(customer->'location'->>'pincode')>6) then raise exception 'Invalid customer location'; end if;
  if length(customer->'location'->>'district')>80 or length(customer->'location'->>'state')>80 or length(payload->>'notes')>500 then raise exception 'Invalid customer details'; end if;
  if payload->>'idempotencyKey' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'Invalid submission key'; end if;
  perform pg_advisory_xact_lock(hashtextextended(payload->>'idempotencyKey',0));
  select id,reference into request_id,reference from public.requests where idempotency_key=(payload->>'idempotencyKey')::uuid;
  if request_id is not null then return jsonb_build_object('ok',true,'requestId',request_id,'reference',reference,'replayed',true); end if;
  if jsonb_typeof(payload->'items')<>'array' or jsonb_array_length(payload->'items') not between 1 and 1000 then raise exception 'Invalid request items'; end if;
  loop reference:='CPC-'||to_char(current_date,'YYYYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,6)); exit when not exists(select 1 from public.requests where requests.reference=reference); end loop;
  insert into public.requests(reference,idempotency_key,customer_name,customer_phone,customer_email,customer_organisation,customer_place,notes,item_count,total_quantity,customer_type,whatsapp_phone,district,state,pincode,existing_customer,preferred_contact,customer_snapshot)
  values(reference,(payload->>'idempotencyKey')::uuid,btrim(customer->>'contactName'),btrim(customer->>'mobile'),nullif(btrim(customer->>'email'),''),nullif(btrim(customer->>'organisationName'),''),btrim(customer->'location'->>'city'),nullif(btrim(payload->>'notes'),''),jsonb_array_length(payload->'items'),1,nullif(customer->>'customerType',''),nullif(customer->>'whatsapp',''),nullif(customer->'location'->>'district',''),nullif(customer->'location'->>'state',''),nullif(customer->'location'->>'pincode',''),nullif(customer->>'existingCambridgeCustomer',''),nullif(customer->>'preferredContact',''),jsonb_build_object('customerType',customer->>'customerType','contactName',customer->>'contactName','organisationName',customer->>'organisationName','mobile',customer->>'mobile','whatsapp',customer->>'whatsapp','email',customer->>'email','preferredContact',customer->>'preferredContact','location',customer->'location')) returning id into request_id;
  for item in select value from jsonb_array_elements(payload->'items') loop
    position:=position+1; item_type:=item->>'type'; quantity:=(item->>'quantity')::integer; if quantity not between 1 and 10000 then raise exception 'Invalid quantity'; end if; total:=total+quantity;
    if item_type='book' then
      if (item - array['type','publicationId','quantity'])<>'{}'::jsonb then raise exception 'Invalid book item'; end if;
      select * into publication from public.publications where id=(item->>'publicationId')::uuid and status='Active'; if publication.id is null then raise exception 'Unknown or inactive publication'; end if;
      insert into public.request_items(request_id,position,item_type,product_id,sku,isbn,title,series,class_code,subject,medium,quantity,mrp,kit_books,snapshot,mapping_status) values(request_id,position,'book',publication.id::text,publication.sku,publication.isbn,publication.title,publication.series,array_to_string(publication.class_stage,', '),publication.subject,publication.medium,quantity,publication.mrp,null,jsonb_build_object('publicationId',publication.id,'title',publication.title,'sku',publication.sku,'isbn',publication.isbn,'series',publication.series,'classStage',publication.class_stage,'subject',publication.subject,'medium',publication.medium,'mrp',publication.mrp),'mapped');
    elsif item_type in ('custom-kit','standard-kit') then
      if (item - array['type','level','kitName','publicationIds','quantity'])<>'{}'::jsonb or jsonb_typeof(item->'publicationIds')<>'array' then raise exception 'Invalid kit item'; end if;
      level:=lower(item->>'level'); if level not in ('playgroup','nursery','lkg','ukg') then raise exception 'Invalid Kit stage'; end if;
      select array_agg(value #>> '{}') into ids from jsonb_array_elements(item->'publicationIds'); if array_length(ids,1) is null or array_length(ids,1)<>array_length(array(select distinct unnest(ids)),1) then raise exception 'Invalid Kit publications'; end if;
      if item_type='custom-kit' then
        select * into rule from public.early_learning_kit_rules where stage_code=level and enabled;
        if rule.stage_code is null or not rule.completion_enabled or rule.minimum_distinct_titles is null or array_length(ids,1)<rule.minimum_distinct_titles then raise exception 'Custom Kit is incomplete'; end if;
        line_title:=coalesce(nullif(btrim(item->>'kitName'),''),initcap(level)||' Custom Kit');
      else
        if item->>'kitName' is not null then raise exception 'Invalid Standard Kit name'; end if;
        select display_name into standard_name from public.standard_kit_definitions where stage_code=level and enabled;
        if not found then raise exception 'Standard Kit is unavailable'; end if;
        select array_agg(publication_id::text order by position) into configured_ids from public.standard_kit_publications where stage_code=level;
        if configured_ids is null or configured_ids is distinct from ids then raise exception 'Standard Kit composition is invalid'; end if;
        line_title:=coalesce(nullif(btrim(standard_name),''),'Cambridge '||initcap(level)||' Standard Kit');
      end if;
      kit_books:='[]'::jsonb; component_position:=0;
      foreach id in array ids loop
        select * into publication from public.publications where publications.id=id::uuid and status='Active';
        if publication.id is null then raise exception 'Unknown or inactive publication'; end if;
        if item_type='custom-kit' and (publication.custom_kit_eligible is false or not exists(select 1 from unnest(publication.class_stage) s where lower(s)=level)) then raise exception 'Ineligible Custom Kit publication'; end if;
        component_position:=component_position+1;
        kit_books:=kit_books||jsonb_build_array(jsonb_build_object('publicationId',publication.id,'title',publication.title,'sku',publication.sku,'isbn',publication.isbn,'series',publication.series,'classStage',publication.class_stage,'subject',publication.subject,'medium',publication.medium,'mrp',publication.mrp));
      end loop;
      insert into public.request_items(request_id,position,item_type,title,class_code,quantity,kit_books,snapshot,mapping_status) values(request_id,position,item_type,line_title,initcap(level),quantity,kit_books,jsonb_build_object('stage',level,'name',line_title,'books',kit_books),'mapped') returning id into item_id;
      component_position:=0;
      for publication in select * from public.publications where id::text=any(ids) order by array_position(ids,id::text) loop
        component_position:=component_position+1;
        insert into public.request_kit_components(request_item_id,position,product_id,title,quantity_per_kit,total_quantity,snapshot,mapping_status) values(item_id,component_position,publication.id::text,publication.title,1,quantity,jsonb_build_object('publicationId',publication.id,'title',publication.title,'sku',publication.sku,'isbn',publication.isbn,'mrp',publication.mrp),'mapped');
      end loop;
    else raise exception 'Invalid item type'; end if;
  end loop;
  if total>100000 then raise exception 'Total quantity is too large'; end if;
  update public.requests set total_quantity=total where id=request_id;
  return jsonb_build_object('ok',true,'requestId',request_id,'reference',reference,'replayed',false);
end $$;

revoke all on function public.submit_catalogue_request(jsonb) from public, anon, authenticated;
grant execute on function public.submit_catalogue_request(jsonb) to service_role;
