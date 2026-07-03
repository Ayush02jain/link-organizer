-- Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run)

create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  url text not null,
  title text,
  image_url text,
  domain text,
  tags text[] default '{}',
  is_image boolean default false,
  created_at timestamptz default now()
);

alter table links enable row level security;

create policy "Users can view their own links"
  on links for select
  using (auth.uid() = user_id);

create policy "Users can insert their own links"
  on links for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own links"
  on links for update
  using (auth.uid() = user_id);

create policy "Users can delete their own links"
  on links for delete
  using (auth.uid() = user_id);

create index if not exists links_user_id_idx on links(user_id);
create index if not exists links_tags_idx on links using gin(tags);
