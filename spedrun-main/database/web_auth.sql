create table if not exists public.web_users (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid unique references auth.users(id) on delete cascade,
    username text unique not null,
    email text unique not null,
    discord_id text unique,
    password_verified boolean not null default false,
    email_verified boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.web_users enable row level security;

create or replace function public.set_web_users_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists set_web_users_updated_at on public.web_users;
create trigger set_web_users_updated_at
before update on public.web_users
for each row execute function public.set_web_users_updated_at();
