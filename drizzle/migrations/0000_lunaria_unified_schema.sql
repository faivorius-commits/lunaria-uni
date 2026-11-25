create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'dreamer',
  avatar_emoji text not null default '✿',
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Own profile read" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Own profile insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Own profile update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'display_name',''), split_part(coalesce(new.email,'dreamer'),'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '',
  emoji text not null default '✧',
  created_at timestamptz not null default now()
);
create index collections_user_idx on public.collections(user_id, created_at desc);

create table public.user_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  category text not null default 'Memories',
  mime_type text not null default 'application/octet-stream',
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  storage_path text not null unique,
  collection_id uuid references public.collections(id) on delete set null,
  caption text not null default '',
  created_at timestamptz not null default now()
);
create index user_files_user_created_idx on public.user_files (user_id, created_at desc);

create table public.lunaria_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  title text not null check (char_length(title) between 1 and 240),
  done boolean not null default false,
  due_date date,
  created_at timestamptz not null default now()
);
create index lunaria_tasks_user_created_idx on public.lunaria_tasks(user_id, created_at desc);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  title text not null check (char_length(title) between 1 and 240),
  event_date date not null,
  start_time time,
  note text not null default '',
  created_at timestamptz not null default now()
);
create index calendar_events_user_date_idx on public.calendar_events(user_id, event_date);

create table public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  title text not null default 'A little entry',
  body text not null,
  mood text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index diary_entries_user_created_idx on public.diary_entries(user_id, created_at desc);
create trigger diary_touch before update on public.diary_entries for each row execute function public.touch_updated_at();

create table public.knowledge_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  title text not null check (char_length(title) between 1 and 240),
  body text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index knowledge_notes_user_created_idx on public.knowledge_notes(user_id, created_at desc);
create trigger notes_touch before update on public.knowledge_notes for each row execute function public.touch_updated_at();

create table public.explore_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  title text not null check (char_length(title) between 1 and 240),
  url text not null check (url ~* '^https?://'),
  note text not null default '',
  created_at timestamptz not null default now()
);
create index explore_links_user_idx on public.explore_links(user_id, created_at desc);

create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  day date not null default current_date,
  mood text not null default '',
  intention text not null default '',
  gratitude text not null default '',
  water int not null default 0 check (water between 0 and 30),
  created_at timestamptz not null default now(),
  unique (user_id, day)
);

create table public.garden_habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null check (char_length(name) between 1 and 120),
  emoji text not null default '🌱',
  created_at timestamptz not null default now()
);
create table public.habit_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  habit_id uuid not null references public.garden_habits(id) on delete cascade,
  day date not null default current_date,
  unique (habit_id, day)
);

do $$
declare t text;
begin
  foreach t in array array['collections','user_files','lunaria_tasks','calendar_events','diary_entries','knowledge_notes','explore_links','daily_logs','garden_habits','habit_checkins'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Users manage own rows" on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

create policy "Own storage read" on storage.objects for select to authenticated
  using (bucket_id = 'lunaria-private' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Own storage upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'lunaria-private' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Own storage delete" on storage.objects for delete to authenticated
  using (bucket_id = 'lunaria-private' and (storage.foldername(name))[1] = (select auth.uid())::text);