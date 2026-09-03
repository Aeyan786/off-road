-- Off Road Performance — initial schema
-- Run this once in the Supabase SQL Editor (Database > SQL Editor > New query).
--
-- RLS is intentionally left disabled on both tables per current project
-- instructions. That means the public anon key can read/write these tables
-- directly (not just through this app) — acceptable for now, but revisit
-- before this goes to real production traffic.

create extension if not exists pgcrypto;

-- Categories are two-level: a top-level category (parent_id is null, e.g.
-- "ATV") and subcategories under it (parent_id set, e.g. "ATV Exhaust").
-- Products attach to a subcategory. Deleting a category cascades to its
-- subcategories (via parent_id) and to any products attached to it (via
-- products.categories) — this is what powers the "deleting a category also
-- deletes its products" requirement without extra application code.
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references categories(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists categories_parent_id_idx on categories (parent_id);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  categories uuid references categories(id) on delete cascade,
  supplier text,
  manufacturer text,
  model text,
  year text,
  product text not null,
  description text,
  images jsonb not null default '[]'::jsonb,
  sku text not null unique,
  width numeric,
  length numeric,
  height numeric,
  weight_grams numeric,
  price numeric not null default 0,
  quantity integer not null default 0,
  small_description text,
  additional_information text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_categories_idx on products (categories);
create index if not exists products_supplier_idx on products (supplier);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
  before update on products
  for each row
  execute function set_updated_at();
