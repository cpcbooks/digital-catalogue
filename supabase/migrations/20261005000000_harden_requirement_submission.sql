-- Local preparation only: do not apply without staged Supabase review.
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

alter table public.request_items drop constraint if exists request_items_check;
alter table public.request_items drop constraint if exists request_items_item_type_check;
alter table public.request_items add constraint request_items_item_type_check check (item_type in ('book','custom-kit','standard-kit'));
alter table public.request_items add constraint request_items_check check ((item_type='book' and kit_books is null) or (item_type in ('custom-kit','standard-kit') and kit_books is not null and jsonb_typeof(kit_books)='array'));

create or replace function public.submit_catalogue_request(payload jsonb) returns jsonb language plpgsql security definer set search_path to 'public','pg_temp' as $$
declare
  customer jsonb:=payload->'customer'; item jsonb; component_id text; publication public.publications%rowtype; rule public.early_learning_kit_rules%rowtype;
  request_id uuid; reference text; item_id uuid; position integer:=0; component_position integer; quantity integer; total integer:=0; item_type text; level text; ids text[]; configured_ids text[]; id text; kit_books jsonb;
begin
  if payload is null or jsonb_typeof(payload)<>'object' or (payload - array['customer','notes','items','idempotencyKey'])<>'{}'::jsonb then raise exception 'Invalid request payload'; end if;
  if jsonb_typeof(customer)<>'object' or (customer - array['customerType','contactName','organisationName','mobile','whatsapp','email','preferredContact','location','existingCambridgeCustomer','notes'])<>'{}'::jsonb then raise exception 'Invalid customer details'; end if;
  if jsonb_typeof(customer->'location')<>'object' or (customer->'location' - array['city','district','state','pincode'])<>'{}'::jsonb then raise exception 'Invalid customer location'; end if;
  if nullif(btrim(customer->>'contactName'),'') is null or length(customer->>'contactName')>150 or nullif(btrim(customer->>'mobile'),'') is null or length(customer->>'mobile')>30 or nullif(btrim(customer->'location'->>'city'),'') is null then raise exception 'Invalid customer details'; end if;
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
      if item_type='custom-kit' then select * into rule from public.early_learning_kit_rules where stage_code=level and enabled; if rule.stage_code is null or not rule.completion_enabled or rule.minimum_distinct_titles is null or array_length(ids,1)<rule.minimum_distinct_titles then raise exception 'Custom Kit is incomplete'; end if; end if;
      kit_books:='[]'::jsonb; component_position:=0;
      foreach id in array ids loop select * into publication from public.publications where publications.id=id::uuid and status='Active'; if publication.id is null then raise exception 'Unknown or inactive publication'; end if; if item_type='custom-kit' and (publication.custom_kit_eligible is false or not exists(select 1 from unnest(publication.class_stage) s where lower(s)=level)) then raise exception 'Ineligible Custom Kit publication'; end if; component_position:=component_position+1; kit_books:=kit_books||jsonb_build_array(jsonb_build_object('publicationId',publication.id,'title',publication.title,'sku',publication.sku,'isbn',publication.isbn,'series',publication.series,'classStage',publication.class_stage,'subject',publication.subject,'medium',publication.medium,'mrp',publication.mrp)); end loop;
      if item_type='standard-kit' and exists(select 1 from public.standard_kit_definitions where stage_code=level and enabled) then select array_agg(publication_id::text order by position) into configured_ids from public.standard_kit_publications where stage_code=level; if configured_ids is distinct from ids then raise exception 'Standard Kit composition is invalid'; end if; end if;
      insert into public.request_items(request_id,position,item_type,title,class_code,quantity,kit_books,snapshot,mapping_status) values(request_id,position,item_type,coalesce(nullif(btrim(item->>'kitName'),''),'Cambridge '||initcap(level)||' Standard Kit'),initcap(level),quantity,kit_books,jsonb_build_object('stage',level,'name',item->>'kitName','books',kit_books),'mapped') returning id into item_id;
      component_position:=0; for publication in select * from public.publications where id::text=any(ids) order by array_position(ids,id::text) loop component_position:=component_position+1; insert into public.request_kit_components(request_item_id,position,product_id,title,quantity_per_kit,total_quantity,snapshot,mapping_status) values(item_id,component_position,publication.id::text,publication.title,1,quantity,jsonb_build_object('publicationId',publication.id,'title',publication.title,'sku',publication.sku,'isbn',publication.isbn,'mrp',publication.mrp),'mapped'); end loop;
    else raise exception 'Invalid item type'; end if;
  end loop;
  if total>100000 then raise exception 'Total quantity is too large'; end if; update public.requests set total_quantity=total where id=request_id; return jsonb_build_object('ok',true,'requestId',request_id,'reference',reference,'replayed',false);
end $$;
