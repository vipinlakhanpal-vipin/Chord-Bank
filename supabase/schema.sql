-- Sur Saathi — Supabase schema
-- Run this in the Supabase SQL editor for your project.

create extension if not exists "uuid-ossp";

create table if not exists songs (
  id text primary key,
  title text not null,
  singers text[] not null,
  movie text,
  year int not null check (year >= 1950),
  language text not null default 'Hindi',
  youtube_id text,
  chart text[] not null, -- lines of "[Chord]lyric text" you paste in yourself via Add Song
  genres text[] not null default '{}', -- from the fixed GENRES list in lib/types.ts, feeds the Genre filter
  tags text[],
  added_via text not null default 'manual' check (added_via in ('seed','manual','ai-workflow')),
  repository text, -- free-text name (e.g. "Vipin") from the Repositories page/Add Song, feeds the Repository filter
  created_at timestamptz not null default now()
);

-- Migrating an existing project that already ran the schema above? Run just these
-- lines in the SQL editor — safe to re-run, each no-ops if already applied:
--   alter table songs add column if not exists genres text[] not null default '{}';
--   alter table songs add column if not exists repository text;

-- A repository is just a name songs get tagged with (songs.repository above) —
-- this table exists so a repository can be created ahead of any song being
-- added to it (shows up as "Vipin · 0 songs" right away). If you're migrating
-- from the old language/year-range repositories table, drop it first:
--   drop table if exists repositories cascade;
create table if not exists repositories (
  name text primary key,
  created_at timestamptz not null default now()
);

create table if not exists recordings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  song_id text references songs(id) on delete set null,
  transpose_shift int not null default 0,
  storage_path text not null, -- path inside the 'recordings' storage bucket
  duration_seconds numeric,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  theme text default 'light' check (theme in ('light','dark')),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table recordings enable row level security;
alter table profiles enable row level security;

create policy "Users manage their own recordings"
  on recordings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Songs and repositories are public read (it's a shared chord library)
alter table songs enable row level security;
alter table repositories enable row level security;

create policy "Anyone can read songs" on songs for select using (true);
create policy "Anyone can read repositories" on repositories for select using (true);
create policy "Logged-in users can add repositories" on repositories for insert
  with check (auth.role() = 'authenticated');
create policy "Logged-in users can delete repositories" on repositories for delete
  using (auth.role() = 'authenticated');

-- This is a personal chord library: once you're logged in (the app's own
-- email/password auth, not a public signup flow anyone stumbles into), you can
-- add, edit, and delete your own songs straight from the Add Song / Edit Song
-- screens — no AI ingestion pipeline, no service-role key involved. Signed-out
-- visitors can still browse and play everything (the select policy above),
-- they just can't change the library.
create policy "Logged-in users can add songs" on songs for insert
  with check (auth.role() = 'authenticated');
create policy "Logged-in users can edit songs" on songs for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "Logged-in users can delete songs" on songs for delete
  using (auth.role() = 'authenticated');

-- Storage bucket for recordings (create via Dashboard > Storage, or:)
-- insert into storage.buckets (id, name, public) values ('recordings', 'recordings', false);
