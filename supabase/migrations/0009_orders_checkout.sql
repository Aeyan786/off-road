-- Checkout, orders and customers (Stripe)
-- Run this once in the Supabase SQL Editor (Database > SQL Editor > New query).
--
-- Flow:
--   1. /checkout validates the form, re-reads the cart and prices from the
--      database and saves a `checkouts` row (customer details + a price
--      snapshot) BEFORE sending the customer to Stripe. Stripe only gets the
--      checkout id in its metadata; nothing from the browser is trusted.
--   2. Stripe's webhook calls complete_checkout(), which turns that checkout
--      into a paid order in ONE transaction: customer upsert, order, order
--      items (product snapshot), stock decrement, and removal of the bought
--      lines from the guest cart. orders.stripe_checkout_session_id is
--      unique, so Stripe retrying the webhook can never create a second order.
--   3. Abandoned/failed checkouts never reach step 2, so they create nothing.

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Customers — one per email (guest checkout, no accounts). Name, phone and
-- addresses are the latest ones used; each order keeps its own copy.
-- Addresses are jsonb: { line1, city, county, postcode, country }.
-- ---------------------------------------------------------------------------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  full_name text not null,
  phone text not null,
  shipping_address jsonb not null,
  billing_address jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists customers_set_updated_at on customers;
create trigger customers_set_updated_at
  before update on customers for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Checkouts — a validated, server-priced cart waiting for payment.
-- items: [{ product_id, product_name, sku, image, manufacturer, model, year,
--           unit_price, quantity, line_total }]
-- ---------------------------------------------------------------------------
create table if not exists checkouts (
  id uuid primary key default gen_random_uuid(),
  guest_cart_id uuid,
  full_name text not null,
  email text not null,
  phone text not null,
  shipping_address jsonb not null,
  billing_address jsonb not null,
  items jsonb not null,
  subtotal numeric(12, 2) not null,
  shipping_cost numeric(12, 2) not null default 0,
  shipping_service text,
  total numeric(12, 2) not null,
  currency text not null default 'gbp',
  stripe_checkout_session_id text unique,
  status text not null default 'open'
    check (status in ('open', 'completed', 'expired')),
  order_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists checkouts_set_updated_at on checkouts;
create trigger checkouts_set_updated_at
  before update on checkouts for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Orders — only ever created by complete_checkout() after Stripe confirms
-- payment. Customer details and addresses are copied onto the order so it
-- stays accurate even if the customer's details change later.
-- ---------------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity (start with 100001) unique,
  customer_id uuid not null references customers(id) on delete restrict,
  checkout_id uuid references checkouts(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  shipping_address jsonb not null,
  billing_address jsonb not null,
  subtotal numeric(12, 2) not null,
  shipping_cost numeric(12, 2) not null default 0,
  shipping_service text,
  total numeric(12, 2) not null,
  amount_paid numeric(12, 2) not null,
  currency text not null default 'gbp',
  status text not null default 'pending'
    check (status in ('pending', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'paid'
    check (payment_status in ('paid', 'refunded')),
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  tracking_number text,
  paid_at timestamptz not null default now(),
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_tracking_required check (
    status not in ('shipped', 'delivered')
    or (tracking_number is not null and btrim(tracking_number) <> '')
  )
);

create index if not exists orders_customer_idx on orders (customer_id);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_created_idx on orders (created_at desc);

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders for each row execute function set_updated_at();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'checkouts_order_fk') then
    alter table checkouts
      add constraint checkouts_order_fk foreign key (order_id)
      references orders(id) on delete set null;
  end if;
end $$;

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  sku text,
  image text,
  manufacturer text,
  model text,
  year text,
  unit_price numeric(12, 2) not null,
  quantity integer not null check (quantity > 0),
  line_total numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_idx on order_items (order_id);

create or replace function orders_guard_status()
returns trigger
language plpgsql
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if old.status in ('delivered', 'cancelled') then
    raise exception 'Order % is %; its status can no longer be changed.',
      old.order_number, old.status using errcode = 'P0001';
  end if;

  if not (
    (old.status = 'pending' and new.status in ('shipped', 'cancelled'))
    or (old.status = 'shipped' and new.status = 'delivered')
  ) then
    raise exception 'An order can''t go from % to %.', old.status, new.status
      using errcode = 'P0001';
  end if;

  if new.status = 'shipped' then new.shipped_at := coalesce(new.shipped_at, now()); end if;
  if new.status = 'delivered' then new.delivered_at := coalesce(new.delivered_at, now()); end if;
  if new.status = 'cancelled' then new.cancelled_at := coalesce(new.cancelled_at, now()); end if;
  return new;
end;
$$;

drop trigger if exists orders_guard_status on orders;
create trigger orders_guard_status
  before update of status on orders
  for each row execute function orders_guard_status();

-- Cancelling puts the ordered quantities back in stock (products that have
-- since been deleted are skipped).
create or replace function orders_restock_on_cancel()
returns trigger
language plpgsql
as $$
begin
  update products p
  set quantity = p.quantity + i.quantity
  from order_items i
  where i.order_id = new.id and i.product_id = p.id;
  return new;
end;
$$;

drop trigger if exists orders_restock_on_cancel on orders;
create trigger orders_restock_on_cancel
  after update of status on orders
  for each row
  when (old.status is distinct from 'cancelled' and new.status = 'cancelled')
  execute function orders_restock_on_cancel();

-- ---------------------------------------------------------------------------
-- complete_checkout — called by the Stripe webhook (service role only).
-- Idempotent: a retried webhook returns the existing order instead of
-- creating another. Returns { order_id, order_number, created }.
-- ---------------------------------------------------------------------------
create or replace function complete_checkout(
  p_session_id text,
  p_payment_intent_id text,
  p_amount_total_pence bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c checkouts%rowtype;
  o orders%rowtype;
  v_customer_id uuid;
begin
  select * into o from orders where stripe_checkout_session_id = p_session_id;
  if found then
    return jsonb_build_object('order_id', o.id, 'order_number', o.order_number, 'created', false);
  end if;


  select * into c from checkouts where stripe_checkout_session_id = p_session_id for update;
  if not found then
    raise exception 'No checkout found for Stripe session %', p_session_id;
  end if;

  select * into o from orders where stripe_checkout_session_id = p_session_id;
  if found then
    return jsonb_build_object('order_id', o.id, 'order_number', o.order_number, 'created', false);
  end if;

  insert into customers (email, full_name, phone, shipping_address, billing_address)
  values (lower(c.email), c.full_name, c.phone, c.shipping_address, c.billing_address)
  on conflict (email) do update
    set full_name = excluded.full_name,
        phone = excluded.phone,
        shipping_address = excluded.shipping_address,
        billing_address = excluded.billing_address
  returning id into v_customer_id;

  insert into orders (
    customer_id, checkout_id, full_name, email, phone,
    shipping_address, billing_address,
    subtotal, shipping_cost, shipping_service, total, amount_paid, currency,
    stripe_checkout_session_id, stripe_payment_intent_id
  ) values (
    v_customer_id, c.id, c.full_name, lower(c.email), c.phone,
    c.shipping_address, c.billing_address,
    c.subtotal, c.shipping_cost, c.shipping_service, c.total,
    coalesce(p_amount_total_pence / 100.0, c.total), c.currency,
    p_session_id, p_payment_intent_id
  )
  returning * into o;


  insert into order_items (
    order_id, product_id, product_name, sku, image, manufacturer, model, year,
    unit_price, quantity, line_total
  )
  select
    o.id,
    (select p.id from products p where p.id = (i->>'product_id')::uuid),
    i->>'product_name', i->>'sku', i->>'image', i->>'manufacturer', i->>'model', i->>'year',
    (i->>'unit_price')::numeric, (i->>'quantity')::integer, (i->>'line_total')::numeric
  from jsonb_array_elements(c.items) as i;


  update products p
  set quantity = greatest(p.quantity - (i->>'quantity')::integer, 0)
  from jsonb_array_elements(c.items) as i
  where p.id = (i->>'product_id')::uuid;


  if c.guest_cart_id is not null then
    delete from cart_items ci
    where ci.guest_cart_id = c.guest_cart_id
      and ci.product_id in (
        select (i->>'product_id')::uuid from jsonb_array_elements(c.items) as i
      );
  end if;

  update checkouts set status = 'completed', order_id = o.id where id = c.id;

  return jsonb_build_object('order_id', o.id, 'order_number', o.order_number, 'created', true);
end;
$$;

revoke all on function complete_checkout(text, text, bigint) from public, anon, authenticated;
grant execute on function complete_checkout(text, text, bigint) to service_role;

revoke all on table customers, checkouts, orders, order_items from anon, authenticated;

commit;
