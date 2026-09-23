-- Order email tracking + supplier name/id sync
-- Run this once in the Supabase SQL Editor (Database > SQL Editor > New query).

begin;

-- ---------------------------------------------------------------------------
-- 1. Order emails
-- ---------------------------------------------------------------------------
-- When each transactional email was sent. The app "claims" an email by
-- setting its column only while it's still null, so an email can never be
-- sent twice (webhook retries, double clicks, two admins at once).

alter table orders
  add column if not exists placed_email_sent_at timestamptz,
  add column if not exists shipped_email_sent_at timestamptz,
  add column if not exists delivered_email_sent_at timestamptz;

create or replace function products_sync_supplier()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_id uuid;
  v_from_name boolean;
begin
  v_from_name :=
    new.supplier_id is null
    or (tg_op = 'UPDATE'
        and new.supplier is distinct from old.supplier
        and new.supplier_id is not distinct from old.supplier_id);

  if not v_from_name then
    select name into v_name from suppliers where id = new.supplier_id;
    new.supplier := v_name;
    return new;
  end if;

  v_name := regexp_replace(btrim(coalesce(new.supplier, '')), '\s+', ' ', 'g');
  if v_name = '' then
    new.supplier := null;
    new.supplier_id := null;
    return new;
  end if;

  insert into suppliers (name) values (v_name)
  on conflict ((lower(btrim(name)))) do nothing;

  select id, name into v_id, v_name
  from suppliers
  where lower(btrim(name)) = lower(v_name);

  new.supplier_id := v_id;
  new.supplier := v_name;
  return new;
end;
$$;

drop trigger if exists products_sync_supplier on products;
create trigger products_sync_supplier
  before insert or update of supplier, supplier_id on products
  for each row execute function products_sync_supplier();
create or replace function suppliers_propagate_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update products set supplier = new.name
  where supplier_id = new.id and supplier is distinct from new.name;
  return new;
end;
$$;

drop trigger if exists suppliers_propagate_name on suppliers;
create trigger suppliers_propagate_name
  after update of name on suppliers
  for each row
  when (old.name is distinct from new.name)
  execute function suppliers_propagate_name();
update products set supplier = supplier
where supplier_id is null and supplier is not null and btrim(supplier) <> '';

update products p set supplier = s.name
from suppliers s
where p.supplier_id = s.id and p.supplier is distinct from s.name;

do $$
begin
  if exists (
    select 1 from products
    where supplier_id is null and supplier is not null and btrim(supplier) <> ''
  ) then
    raise exception 'Supplier backfill incomplete — nothing has been changed.';
  end if;
end $$;

commit;
