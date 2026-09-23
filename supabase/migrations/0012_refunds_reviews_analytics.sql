-- Refunded status + new order emails, product reviews, visitor analytics
-- Run once in the Supabase SQL Editor.

begin;

-- ---------------------------------------------------------------------------
-- 1. Refunded order status + email tracking columns
--    pending/shipped/delivered -> refunded (final, like cancelled)
-- ---------------------------------------------------------------------------
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('pending', 'shipped', 'delivered', 'cancelled', 'refunded'));

alter table orders
  add column if not exists refunded_at timestamptz,
  add column if not exists received_email_sent_at timestamptz,   -- admin notification
  add column if not exists cancelled_email_sent_at timestamptz,
  add column if not exists refunded_email_sent_at timestamptz;

create or replace function orders_guard_status()
returns trigger
language plpgsql
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if old.status in ('delivered', 'cancelled', 'refunded')
     and not (old.status = 'delivered' and new.status = 'refunded') then
    raise exception 'Order % is %; its status can no longer be changed.',
      old.order_number, old.status using errcode = 'P0001';
  end if;

  if not (
    (old.status = 'pending' and new.status in ('shipped', 'cancelled', 'refunded'))
    or (old.status = 'shipped' and new.status in ('delivered', 'refunded'))
    or (old.status = 'delivered' and new.status = 'refunded')
  ) then
    raise exception 'An order can''t go from % to %.', old.status, new.status
      using errcode = 'P0001';
  end if;

  if new.status = 'shipped' then new.shipped_at := coalesce(new.shipped_at, now()); end if;
  if new.status = 'delivered' then new.delivered_at := coalesce(new.delivered_at, now()); end if;
  if new.status = 'cancelled' then new.cancelled_at := coalesce(new.cancelled_at, now()); end if;
  if new.status = 'refunded' then
    new.refunded_at := coalesce(new.refunded_at, now());
    new.payment_status := 'refunded';
  end if;
  return new;
end;
$$;


create table if not exists product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  customer_name text not null check (btrim(customer_name) <> '' and length(customer_name) <= 100),
  customer_email text not null check (customer_email = lower(customer_email)),
  rating smallint not null check (rating between 1 and 5),
  body text not null check (btrim(body) <> '' and length(body) <= 2000),
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists product_reviews_product_idx
  on product_reviews (product_id, created_at desc);


grant select on table product_reviews to anon, authenticated;
revoke insert, update, delete on table product_reviews from anon, authenticated;


create table if not exists visitors (
  id uuid primary key,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  country text,
  device text not null default 'desktop' check (device in ('mobile', 'tablet', 'desktop')),
  page_views integer not null default 0
);

create index if not exists visitors_first_seen_idx on visitors (first_seen_at desc);

create table if not exists page_views (
  id bigint generated always as identity primary key,
  visitor_id uuid not null references visitors(id) on delete cascade,
  path text not null,
  country text,
  device text,
  is_new_visitor boolean not null default false,
  occurred_at timestamptz not null default now()
);

create index if not exists page_views_occurred_idx on page_views (occurred_at desc);
create index if not exists page_views_visitor_idx on page_views (visitor_id);

revoke all on table visitors, page_views from anon, authenticated;

create or replace function track_page_view(
  p_visitor_id uuid,
  p_path text,
  p_country text,
  p_device text,
  p_is_new boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into visitors (id, country, device, page_views, first_seen_at, last_seen_at)
  values (p_visitor_id, p_country, coalesce(p_device, 'desktop'), 1, now(), now())
  on conflict (id) do update
    set last_seen_at = now(),
        page_views = visitors.page_views + 1,
        country = coalesce(excluded.country, visitors.country),
        device = coalesce(excluded.device, visitors.device);

  insert into page_views (visitor_id, path, country, device, is_new_visitor)
  values (p_visitor_id, left(p_path, 300), p_country, p_device, coalesce(p_is_new, false));
end;
$$;

revoke all on function track_page_view(uuid, text, text, text, boolean) from public, anon, authenticated;
grant execute on function track_page_view(uuid, text, text, text, boolean) to service_role;

insert into admin_modules (key, label, sort_order)
values ('analytics', 'Analytics', 15)
on conflict (key) do update set label = excluded.label, sort_order = excluded.sort_order;

commit;
