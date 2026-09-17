-- Guest cart and wishlist
-- Run this once in the Supabase SQL Editor (Database > SQL Editor > New query).
--
-- Both tables are keyed by the `guest_cart` cookie's uuid (see
-- lib/guest-cart.js), which is httpOnly — every read and write goes through
-- a server action, so the browser never sees another visitor's id.
--
-- No price is stored: line totals are read live from products
-- (discount_price when set, else price), since there is no orders table to
-- freeze a price against yet.
--
-- RLS is left disabled, consistent with the products/categories/media tables.

create extension if not exists pgcrypto;

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  guest_cart_id uuid not null,
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Adding a product that's already in the cart bumps its quantity.
  unique (guest_cart_id, product_id)
);

create index if not exists cart_items_guest_idx on cart_items (guest_cart_id);

create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  guest_cart_id uuid not null,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  -- The heart toggles, so a product can only be on a wishlist once.
  unique (guest_cart_id, product_id)
);

create index if not exists wishlist_items_guest_idx on wishlist_items (guest_cart_id);

drop trigger if exists cart_items_set_updated_at on cart_items;
create trigger cart_items_set_updated_at
  before update on cart_items
  for each row
  execute function set_updated_at();
