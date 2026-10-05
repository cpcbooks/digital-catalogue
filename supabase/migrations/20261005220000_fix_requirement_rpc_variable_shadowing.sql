-- Forward hotfix: eliminate PL/pgSQL variable/column shadowing in requirement submission RPC.
create or replace function public.submit_catalogue_request(payload jsonb) returns jsonb language plpgsql security definer set search_path to 'public','pg_temp' as $$
declare
  v_customer jsonb := payload->'customer';
  v_item jsonb;
  v_publication public.publications%rowtype;
  v_rule public.early_learning_kit_rules%rowtype;
  v_request_id uuid;
  v_request_reference text;
  v_item_id uuid;
  v_item_position integer := 0;
  v_component_position integer;
  v_quantity integer;
  v_total integer := 0;
  v_item_type text;
  v_level text;
  v_publication_ids text[];
  v_configured_publication_ids text[];
  v_publication_id_text text;
  v_kit_books jsonb;
  v_standard_name text;
  v_line_title text;
begin
  if payload is null or jsonb_typeof(payload)<>'object' or (payload - array['customer','notes','items','idempotencyKey'])<>'{}'::jsonb then raise exception 'Invalid request payload'; end if;
  if jsonb_typeof(v_customer)<>'object' or (v_customer - array['customerType','contactName','organisationName','mobile','whatsapp','email','preferredContact','location','existingCambridgeCustomer'])<>'{}'::jsonb then raise exception 'Invalid customer details'; end if;
  if jsonb_typeof(v_customer->'location')<>'object' or ((v_customer->'location') - array['city','district','state','pincode'])<>'{}'::jsonb then raise exception 'Invalid customer location'; end if;
  if v_customer->>'customerType' not in ('school','dealer','individual','other') or nullif(btrim(v_customer->>'contactName'),'') is null or length(v_customer->>'contactName') not between 2 and 80 or v_customer->>'mobile' !~ '^[6-9][0-9]{9}$' or nullif(btrim(v_customer->'location'->>'city'),'') is null or length(v_customer->'location'->>'city') not between 2 and 80 or v_customer->>'preferredContact' not in ('call','whatsapp','email') or v_customer->>'existingCambridgeCustomer' not in ('Yes','No','Not sure') then raise exception 'Invalid customer details'; end if;
  if v_customer->>'customerType' in ('school','dealer','other') and (nullif(btrim(v_customer->>'organisationName'),'') is null or length(v_customer->>'organisationName') not between 2 and 120) then raise exception 'Invalid customer details'; end if;
  if v_customer->>'whatsapp' is not null and (v_customer->>'whatsapp' !~ '^[6-9][0-9]{9}$' or length(v_customer->>'whatsapp')>10) then raise exception 'Invalid customer details'; end if;
  if v_customer->>'email' is not null and (length(v_customer->>'email')>120 or v_customer->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$') then raise exception 'Invalid customer details'; end if;
  if v_customer->>'preferredContact'='email' and v_customer->>'email' is null then raise exception 'Invalid customer details'; end if;
  if v_customer->>'preferredContact'='whatsapp' and v_customer->>'whatsapp' is null then raise exception 'Invalid customer details'; end if;
  if v_customer->'location'->>'pincode' is not null and (v_customer->'location'->>'pincode' !~ '^[0-9]{6}$' or length(v_customer->'location'->>'pincode')>6) then raise exception 'Invalid customer location'; end if;
  if length(v_customer->'location'->>'district')>80 or length(v_customer->'location'->>'state')>80 or length(payload->>'notes')>500 then raise exception 'Invalid customer details'; end if;
  if payload->>'idempotencyKey' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'Invalid submission key'; end if;

  perform pg_advisory_xact_lock(hashtextextended(payload->>'idempotencyKey',0));
  select r.id, r.reference
    into v_request_id, v_request_reference
    from public.requests as r
   where r.idempotency_key=(payload->>'idempotencyKey')::uuid;
  if v_request_id is not null then return jsonb_build_object('ok',true,'requestId',v_request_id,'reference',v_request_reference,'replayed',true); end if;
  if jsonb_typeof(payload->'items')<>'array' or jsonb_array_length(payload->'items') not between 1 and 1000 then raise exception 'Invalid request items'; end if;

  loop
    v_request_reference := 'CPC-'||to_char(current_date,'YYYYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
    exit when not exists(select 1 from public.requests as r where r.reference=v_request_reference);
  end loop;

  insert into public.requests as r(reference,idempotency_key,customer_name,customer_phone,customer_email,customer_organisation,customer_place,notes,item_count,total_quantity,customer_type,whatsapp_phone,district,state,pincode,existing_customer,preferred_contact,customer_snapshot)
  values(v_request_reference,(payload->>'idempotencyKey')::uuid,btrim(v_customer->>'contactName'),btrim(v_customer->>'mobile'),nullif(btrim(v_customer->>'email'),''),nullif(btrim(v_customer->>'organisationName'),''),btrim(v_customer->'location'->>'city'),nullif(btrim(payload->>'notes'),''),jsonb_array_length(payload->'items'),1,nullif(v_customer->>'customerType',''),nullif(v_customer->>'whatsapp',''),nullif(v_customer->'location'->>'district',''),nullif(v_customer->'location'->>'state',''),nullif(v_customer->'location'->>'pincode',''),nullif(v_customer->>'existingCambridgeCustomer',''),nullif(v_customer->>'preferredContact',''),jsonb_build_object('customerType',v_customer->>'customerType','contactName',v_customer->>'contactName','organisationName',v_customer->>'organisationName','mobile',v_customer->>'mobile','whatsapp',v_customer->>'whatsapp','email',v_customer->>'email','preferredContact',v_customer->>'preferredContact','location',v_customer->'location'))
  returning r.id into v_request_id;

  for v_item in select e.value from jsonb_array_elements(payload->'items') as e(value) loop
    v_item_position := v_item_position+1;
    v_item_type := v_item->>'type';
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity not between 1 and 10000 then raise exception 'Invalid quantity'; end if;
    v_total := v_total+v_quantity;

    if v_item_type='book' then
      if (v_item - array['type','publicationId','quantity'])<>'{}'::jsonb then raise exception 'Invalid book item'; end if;
      select p.* into v_publication from public.publications as p where p.id=(v_item->>'publicationId')::uuid and p.status='Active';
      if v_publication.id is null then raise exception 'Unknown or inactive publication'; end if;
      insert into public.request_items(request_id,position,item_type,product_id,sku,isbn,title,series,class_code,subject,medium,quantity,mrp,kit_books,snapshot,mapping_status)
      values(v_request_id,v_item_position,'book',v_publication.id::text,v_publication.sku,v_publication.isbn,v_publication.title,v_publication.series,array_to_string(v_publication.class_stage,', '),v_publication.subject,v_publication.medium,v_quantity,v_publication.mrp,null,jsonb_build_object('publicationId',v_publication.id,'title',v_publication.title,'sku',v_publication.sku,'isbn',v_publication.isbn,'series',v_publication.series,'classStage',v_publication.class_stage,'subject',v_publication.subject,'medium',v_publication.medium,'mrp',v_publication.mrp),'mapped');

    elsif v_item_type in ('custom-kit','standard-kit') then
      if (v_item - array['type','level','kitName','publicationIds','quantity'])<>'{}'::jsonb or jsonb_typeof(v_item->'publicationIds')<>'array' then raise exception 'Invalid kit item'; end if;
      v_level := lower(v_item->>'level');
      if v_level not in ('playgroup','nursery','lkg','ukg') then raise exception 'Invalid Kit stage'; end if;
      select array_agg(e.value #>> '{}') into v_publication_ids from jsonb_array_elements(v_item->'publicationIds') as e(value);
      if array_length(v_publication_ids,1) is null or array_length(v_publication_ids,1)<>array_length(array(select distinct u.id from unnest(v_publication_ids) as u(id)),1) then raise exception 'Invalid Kit publications'; end if;

      if v_item_type='custom-kit' then
        select r.* into v_rule from public.early_learning_kit_rules as r where r.stage_code=v_level and r.enabled;
        if v_rule.stage_code is null or not v_rule.completion_enabled or v_rule.minimum_distinct_titles is null or array_length(v_publication_ids,1)<v_rule.minimum_distinct_titles then raise exception 'Custom Kit is incomplete'; end if;
        v_line_title := coalesce(nullif(btrim(v_item->>'kitName'),''),initcap(v_level)||' Custom Kit');
      else
        if v_item->>'kitName' is not null then raise exception 'Invalid Standard Kit name'; end if;
        select d.display_name into v_standard_name from public.standard_kit_definitions as d where d.stage_code=v_level and d.enabled;
        if not found then raise exception 'Standard Kit is unavailable'; end if;
        select array_agg(skp.publication_id::text order by skp.position) into v_configured_publication_ids from public.standard_kit_publications as skp where skp.stage_code=v_level;
        if v_configured_publication_ids is null or v_configured_publication_ids is distinct from v_publication_ids then raise exception 'Standard Kit composition is invalid'; end if;
        v_line_title := coalesce(nullif(btrim(v_standard_name),''),'Cambridge '||initcap(v_level)||' Standard Kit');
      end if;

      v_kit_books := '[]'::jsonb;
      v_component_position := 0;
      foreach v_publication_id_text in array v_publication_ids loop
        select p.* into v_publication from public.publications as p where p.id=v_publication_id_text::uuid and p.status='Active';
        if v_publication.id is null then raise exception 'Unknown or inactive publication'; end if;
        if v_item_type='custom-kit' and (v_publication.custom_kit_eligible is false or not exists(select 1 from unnest(v_publication.class_stage) as s(stage_code) where lower(s.stage_code)=v_level)) then raise exception 'Ineligible Custom Kit publication'; end if;
        v_component_position := v_component_position+1;
        v_kit_books := v_kit_books||jsonb_build_array(jsonb_build_object('publicationId',v_publication.id,'title',v_publication.title,'sku',v_publication.sku,'isbn',v_publication.isbn,'series',v_publication.series,'classStage',v_publication.class_stage,'subject',v_publication.subject,'medium',v_publication.medium,'mrp',v_publication.mrp));
      end loop;

      insert into public.request_items as ri(request_id,position,item_type,title,class_code,quantity,kit_books,snapshot,mapping_status)
      values(v_request_id,v_item_position,v_item_type,v_line_title,initcap(v_level),v_quantity,v_kit_books,jsonb_build_object('stage',v_level,'name',v_line_title,'books',v_kit_books),'mapped')
      returning ri.id into v_item_id;

      v_component_position := 0;
      for v_publication in select p.* from public.publications as p where p.id::text=any(v_publication_ids) order by array_position(v_publication_ids,p.id::text) loop
        v_component_position := v_component_position+1;
        insert into public.request_kit_components(request_item_id,position,product_id,title,quantity_per_kit,total_quantity,snapshot,mapping_status)
        values(v_item_id,v_component_position,v_publication.id::text,v_publication.title,1,v_quantity,jsonb_build_object('publicationId',v_publication.id,'title',v_publication.title,'sku',v_publication.sku,'isbn',v_publication.isbn,'mrp',v_publication.mrp),'mapped');
      end loop;
    else
      raise exception 'Invalid item type';
    end if;
  end loop;

  if v_total>100000 then raise exception 'Total quantity is too large'; end if;
  update public.requests as r set total_quantity=v_total where r.id=v_request_id;
  return jsonb_build_object('ok',true,'requestId',v_request_id,'reference',v_request_reference,'replayed',false);
end $$;

revoke all on function public.submit_catalogue_request(jsonb) from public, anon, authenticated;
grant execute on function public.submit_catalogue_request(jsonb) to service_role;
