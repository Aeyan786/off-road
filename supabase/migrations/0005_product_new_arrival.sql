-- "New Arrival" flag on products
-- Run this once in the Supabase SQL Editor (Database > SQL Editor > New query).
--
-- A plain on/off flag the admin ticks per product in Edit Product. The
-- New Arrivals page (Task 12) lists products where
--   new_arrival = true and status = 'active'
--
-- Defaults to false so the existing catalog stays off until it's ticked.

alter table products
  add column if not exists new_arrival boolean not null default false;

create index if not exists products_new_arrival_idx
  on products (new_arrival)
  where new_arrival;
