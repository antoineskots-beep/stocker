-- Stocker initial schema. Run in the Supabase SQL editor or via supabase db push.
-- RLS is enabled on every table. Users may only touch their own rows.
-- quotes_cache and events_cache are readable by signed-in users (server-written).

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- watchlist_items
-- ---------------------------------------------------------------------------
create table public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  symbol text not null,
  company_name text,
  exchange text check (exchange in ('TSX', 'NEO', 'NASDAQ', 'NYSE')),
  currency text check (currency in ('CAD', 'USD')),
  position integer not null default 0,
  reference_price numeric(18, 6),
  added_at timestamptz not null default now(),
  unique (user_id, symbol)
);

create index watchlist_items_user_position_idx
  on public.watchlist_items (user_id, position);

alter table public.watchlist_items enable row level security;

create policy "watchlist_select_own"
  on public.watchlist_items for select
  to authenticated
  using (auth.uid() = user_id);

create policy "watchlist_insert_own"
  on public.watchlist_items for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "watchlist_update_own"
  on public.watchlist_items for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "watchlist_delete_own"
  on public.watchlist_items for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- alerts
-- ---------------------------------------------------------------------------
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  symbol text not null,
  type text not null check (type in (
    'price_above',
    'price_below',
    'buy_zone',
    'earnings',
    'ex_dividend'
  )),
  rule text check (rule in (
    'fixed_price',
    'pct_below_high',
    'pct_below_reference'
  )),
  value numeric(18, 6),
  status text not null default 'active' check (status in ('active', 'triggered', 'paused')),
  triggered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index alerts_user_status_idx on public.alerts (user_id, status);
create index alerts_active_symbol_idx on public.alerts (symbol) where status = 'active';

create trigger alerts_set_updated_at
before update on public.alerts
for each row execute function public.set_updated_at();

alter table public.alerts enable row level security;

create policy "alerts_select_own"
  on public.alerts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "alerts_insert_own"
  on public.alerts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "alerts_update_own"
  on public.alerts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "alerts_delete_own"
  on public.alerts for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- quotes_cache (written by Edge Functions, read by the app)
-- ---------------------------------------------------------------------------
create table public.quotes_cache (
  symbol text primary key,
  name text,
  exchange text,
  currency text,
  price numeric(18, 6),
  prev_close numeric(18, 6),
  high_52w numeric(18, 6),
  sparkline jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.quotes_cache enable row level security;

create policy "quotes_cache_select_authenticated"
  on public.quotes_cache for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- events_cache
-- ---------------------------------------------------------------------------
create table public.events_cache (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  type text not null check (type in ('earnings', 'ex_dividend')),
  date date not null,
  unique (symbol, type, date)
);

create index events_cache_symbol_date_idx on public.events_cache (symbol, date);

alter table public.events_cache enable row level security;

create policy "events_cache_select_authenticated"
  on public.events_cache for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- push_tokens
-- ---------------------------------------------------------------------------
create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('ios', 'android')),
  updated_at timestamptz not null default now()
);

create index push_tokens_user_idx on public.push_tokens (user_id);

create trigger push_tokens_set_updated_at
before update on public.push_tokens
for each row execute function public.set_updated_at();

alter table public.push_tokens enable row level security;

create policy "push_tokens_select_own"
  on public.push_tokens for select
  to authenticated
  using (auth.uid() = user_id);

create policy "push_tokens_insert_own"
  on public.push_tokens for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "push_tokens_update_own"
  on public.push_tokens for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "push_tokens_delete_own"
  on public.push_tokens for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- alert_runs (engine logs — no client access)
-- ---------------------------------------------------------------------------
create table public.alert_runs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('quote_eval', 'events_refresh', 'weekly_digest', 'push_receipts')),
  status text not null check (status in ('ok', 'error')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  symbols_processed integer not null default 0,
  alerts_triggered integer not null default 0,
  error text,
  details jsonb
);

alter table public.alert_runs enable row level security;

revoke all on public.alert_runs from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Cache tables: clients cannot write
-- ---------------------------------------------------------------------------
revoke insert, update, delete on public.quotes_cache from anon, authenticated;
revoke insert, update, delete on public.events_cache from anon, authenticated;
