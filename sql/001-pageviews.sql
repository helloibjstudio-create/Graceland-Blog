-- Run this once in Supabase → SQL Editor.
-- Creates the pageviews table used by the admin performance dashboard.

create table if not exists public.pageviews (
  id bigserial primary key,
  kind text not null check (kind in ('post', 'episode')),
  slug text not null,
  session_id text,
  event text not null default 'view' check (event in ('view', 'read', 'share')),
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists pageviews_kind_slug_created_idx
  on public.pageviews (kind, slug, created_at desc);

create index if not exists pageviews_created_idx
  on public.pageviews (created_at desc);

-- Only the server (service role) reads/writes this table. Client never touches it.
alter table public.pageviews enable row level security;
