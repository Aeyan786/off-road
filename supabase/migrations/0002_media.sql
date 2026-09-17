-- Media library
-- Run this once in the Supabase SQL Editor (Database > SQL Editor > New query).
--
-- Files themselves live in the existing `product_bucket` storage bucket under
-- the `media/` prefix. This table only stores their metadata.
--
-- Products reference media by URL (products.images is a jsonb array of URLs),
-- so there is deliberately no FK between the two. Spreadsheet imports that
-- carry a bare file name (e.g. "xyz.png") are resolved against file_name here
-- and the matching file_url is written into products.images.
--
-- RLS is left disabled, consistent with the products/categories tables.

create extension if not exists pgcrypto;

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text not null unique,
  file_url text not null,
  file_type text,
  file_size bigint,
  created_at timestamptz not null default now()
);

-- Case-insensitive lookup by original file name, used by the spreadsheet
-- importer to turn "xyz.png" into a usable image URL.
create index if not exists media_file_name_lower_idx on media (lower(file_name));
create index if not exists media_created_at_idx on media (created_at desc);
