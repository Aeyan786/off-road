-- Suppliers + admin users & module permissions
-- Run this once in the Supabase SQL Editor (Database > SQL Editor > New query).
--
-- Part 1 (suppliers) is non-breaking: products keep their existing text
-- `supplier` column until the app has been switched to `supplier_id`; a
-- follow-up migration then drops the text column.
--
-- RLS stays disabled on the new tables, consistent with the rest of the
-- project. See the OPTIONAL block at the end.

begin;

create extension if not exists pgcrypto;

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One supplier per name, ignoring case and surrounding spaces, so
-- "FMF Racing" and " fmf racing" can never both exist.
create unique index if not exists suppliers_name_unique_idx
  on suppliers (lower(btrim(name)));

drop trigger if exists suppliers_set_updated_at on suppliers;
create trigger suppliers_set_updated_at
  before update on suppliers
  for each row
  execute function set_updated_at();

-- Product -> supplier. RESTRICT: a supplier that still has products cannot
-- be deleted, so no product is ever silently orphaned or removed.
alter table products
  add column if not exists supplier_id uuid
  references suppliers(id) on delete restrict;

create index if not exists products_supplier_id_idx on products (supplier_id);

insert into suppliers (name)
select distinct on (lower(btrim(supplier))) btrim(supplier)
from products
where supplier is not null and btrim(supplier) <> ''
order by lower(btrim(supplier)), btrim(supplier)
on conflict (lower(btrim(name))) do nothing;

-- ...and point every product at it.
update products p
set supplier_id = s.id
from suppliers s
where p.supplier_id is null
  and p.supplier is not null
  and lower(btrim(p.supplier)) = lower(btrim(s.name));

-- ---------------------------------------------------------------------------
-- 2. Admin users
-- ---------------------------------------------------------------------------
-- One row per Supabase Auth user who may use the admin portal. Credentials
-- live only in Supabase Auth (auth.users) — never here. Email is read from
-- Auth too, so it can't drift out of sync.
--
--   super_admin  full access, protected: cannot be edited or deleted from
--                the portal, and is the only role that can manage users.
--   staff        access limited to the modules in admin_user_permissions.
--
-- A signed-in Auth user with NO row here gets no admin access at all.

create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'staff'
    check (role in ('super_admin', 'staff')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists admin_users_set_updated_at on admin_users;
create trigger admin_users_set_updated_at
  before update on admin_users
  for each row
  execute function set_updated_at();

-- Every account that exists today becomes a protected super admin, so the
-- current login keeps full access.
insert into admin_users (id, role)
select id, 'super_admin' from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Modules & permissions
-- ---------------------------------------------------------------------------
-- The assignable admin modules (match the sidebar). User management is
-- super-admin only and personal account settings are open to every admin
-- user, so neither is an assignable module.

create table if not exists admin_modules (
  key text primary key,
  label text not null,
  sort_order integer not null default 0
);

insert into admin_modules (key, label, sort_order) values
  ('dashboard',  'Dashboard',          10),
  ('products',   'Products',           20),
  ('categories', 'Categories',         30),
  ('suppliers',  'Suppliers',          40),
  ('media',      'Media Library',      50),
  ('orders',     'Orders',             60),
  ('customers',  'Customers',          70),
  ('blogs',      'Blogs / Articles',   80),
  ('reports',    'Reports',            90)
on conflict (key) do update
  set label = excluded.label, sort_order = excluded.sort_order;

-- Which modules each staff user may open. Super admins need no rows.
create table if not exists admin_user_permissions (
  user_id uuid not null references admin_users(id) on delete cascade,
  module_key text not null references admin_modules(key) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, module_key)
);

create index if not exists admin_user_permissions_module_idx
  on admin_user_permissions (module_key);

commit;

-- ---------------------------------------------------------------------------
-- OPTIONAL — recommended, but only run it if you want it.
-- ---------------------------------------------------------------------------
-- This is NOT RLS. It simply stops the public anon key (and signed-in
-- browsers) from reading or writing the two permission tables through the
-- Supabase REST API, so nobody can grant themselves super admin from
-- outside the app. The app reads/writes these tables server-side with the
-- service-role key, which is unaffected. Everything else keeps working as
-- it does today.
--
-- revoke all on table admin_users            from anon, authenticated;
-- revoke all on table admin_user_permissions from anon, authenticated;
