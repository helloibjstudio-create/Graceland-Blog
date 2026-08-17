-- Run this in the Supabase SQL editor to create the content tables.
-- Supabase Dashboard → SQL Editor → New query → paste & run.

create table if not exists posts (
  id           text        primary key,
  slug         text        not null unique,
  title        text        not null,
  excerpt      text        not null default '',
  body         text        not null default '',
  topic        text        not null default '',
  tag          text        not null default '',
  variant      text        not null default 'blue',
  author       text        not null default 'team',
  date         text        not null,
  read_time    integer     not null default 5,
  image        text        not null default '',
  status       text        not null default 'draft' check (status in ('published', 'draft')),
  featured     boolean     not null default false,
  episode_url  text,
  updated_at   timestamptz not null default now()
);

create table if not exists episodes (
  id           text        primary key,
  slug         text        not null unique,
  title        text        not null,
  summary      text        not null default '',
  tag          text        not null default '',
  variant      text        not null default 'blue',
  date         text        not null,
  image        text        not null default '',
  gradient     text        not null default '',
  youtube_url  text        not null default '',
  listen_url   text,
  note         text,
  article_href text,
  status       text        not null default 'draft' check (status in ('published', 'draft')),
  updated_at   timestamptz not null default now()
);

-- Only one post should be featured at a time.
-- Enforce this via a partial unique index.
create unique index if not exists posts_one_featured
  on posts (featured)
  where featured = true;

-- Disable Row Level Security — access is controlled by the service-role key
-- used server-side. Enable RLS + policies only if you add a public API.
alter table posts    disable row level security;
alter table episodes disable row level security;
