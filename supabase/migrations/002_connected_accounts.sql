-- Create connected_accounts table
create table if not exists connected_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  platform text not null, -- 'youtube', 'instagram', 'facebook', 'twitter', 'linkedin'
  access_token text not null,
  refresh_token text,
  expires_at timestamp with time zone,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Prevent multiple connections of same platform per user
  unique(user_id, platform)
);

-- Enable RLS
alter table connected_accounts enable row level security;

-- Policies
create policy "Users can view their own connected accounts"
  on connected_accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own connected accounts"
  on connected_accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own connected accounts"
  on connected_accounts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own connected accounts"
  on connected_accounts for delete
  using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_connected_accounts_updated_at
    before update on connected_accounts
    for each row
    execute procedure update_updated_at_column();
