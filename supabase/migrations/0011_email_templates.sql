-- Editable email templates (/admin/templates)
-- Run this once in the Supabase SQL Editor, after 0010.
--
-- Admins can change each order email's subject, heading and body text, plus
-- one shared set of colours and the header-bar text. The layout itself (items
-- table, totals, addresses, footer) stays in code.

begin;

create table if not exists email_templates (
  key text primary key
    check (key in ('order_placed', 'order_shipped', 'order_delivered')),
  subject text not null check (btrim(subject) <> '' and length(subject) <= 200),
  heading text not null check (btrim(heading) <> '' and length(heading) <= 200),
  body text not null check (btrim(body) <> '' and length(body) <= 5000),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

drop trigger if exists email_templates_set_updated_at on email_templates;
create trigger email_templates_set_updated_at
  before update on email_templates for each row execute function set_updated_at();

insert into email_templates (key, subject, heading, body) values
  (
    'order_placed',
    'Order {{order_number}} confirmed — Off Road Performance',
    'Order {{order_number}} confirmed',
    E'Hi {{customer_name}}, thanks for your order! We''ve received your payment and are getting your parts ready.\n\nWe''ll email you again with a tracking number as soon as it ships.'
  ),
  (
    'order_shipped',
    'Order {{order_number}} has shipped — Off Road Performance',
    'Your order {{order_number}} is on its way',
    E'Hi {{customer_name}}, good news — your order has been dispatched.\n\nYou can follow its progress with tracking number {{tracking_number}}.'
  ),
  (
    'order_delivered',
    'Order {{order_number}} delivered — Off Road Performance',
    'Order {{order_number}} delivered',
    E'Hi {{customer_name}}, your order was delivered on {{delivered_date}}. We hope you enjoy your new parts!'
  )
on conflict (key) do nothing;

create table if not exists email_theme (
  id smallint primary key default 1 check (id = 1),
  header_title text not null default 'Off Road Performance'
    check (btrim(header_title) <> '' and length(header_title) <= 80),
  header_background text not null default '#1B9DDB' check (header_background ~ '^#[0-9A-Fa-f]{6}$'),
  header_text_color text not null default '#FFFFFF' check (header_text_color ~ '^#[0-9A-Fa-f]{6}$'),
  heading_color text not null default '#111111' check (heading_color ~ '^#[0-9A-Fa-f]{6}$'),
  body_text_color text not null default '#444444' check (body_text_color ~ '^#[0-9A-Fa-f]{6}$'),
  accent_color text not null default '#1B9DDB' check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

drop trigger if exists email_theme_set_updated_at on email_theme;
create trigger email_theme_set_updated_at
  before update on email_theme for each row execute function set_updated_at();

insert into email_theme (id) values (1) on conflict (id) do nothing;

insert into admin_modules (key, label, sort_order)
values ('email_templates', 'Email Templates', 95)
on conflict (key) do update set label = excluded.label, sort_order = excluded.sort_order;
revoke all on table email_templates, email_theme from anon, authenticated;

commit;
