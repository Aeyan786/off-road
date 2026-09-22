-- Step 2 of the supplier migration (step 1: 0007_suppliers_admin_users.sql).
-- Run once in the Supabase SQL Editor.
--
-- The app now reads and writes suppliers only through products.supplier_id
-- -> suppliers, so the old free-text column is no longer used. Dropping it
-- removes the duplicated supplier names. Its index is dropped with it.
--
-- Safety check first: this aborts (and changes nothing) if any product
-- still has a supplier name that isn't linked to a suppliers row.

begin;

do $$
begin
  if exists (
    select 1 from products
    where supplier is not null and btrim(supplier) <> '' and supplier_id is null
  ) then
    raise exception 'Some products have a supplier name but no supplier_id — not dropping products.supplier.';
  end if;
end $$;

alter table products drop column if exists supplier;

commit;
