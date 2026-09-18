-- Blogs / articles
-- Run this once in the Supabase SQL Editor (Database > SQL Editor > New query).
--
-- `image` holds one public URL from the media library (files live in the
-- existing `product_bucket` under `media/`), the same way products.images
-- holds URLs — so there is deliberately no FK to `media`.
--
-- Word count and excerpts are derived from `content` in the app, not stored.
--
-- RLS is left disabled, consistent with the other tables.

create extension if not exists pgcrypto;

create table if not exists blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  image text,
  content text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blogs_published_idx
  on blogs (published_at desc)
  where status = 'published';

-- Lets media cleanup check whether an image is still used by any blog.
create index if not exists blogs_image_idx on blogs (image);

drop trigger if exists blogs_set_updated_at on blogs;
create trigger blogs_set_updated_at
  before update on blogs
  for each row
  execute function set_updated_at();
