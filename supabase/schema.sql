-- Run this in the Supabase SQL editor to set up Tripora's storage.

create table if not exists itineraries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  destination text not null,
  start_date date,
  end_date date,
  travelers int not null default 1,
  budget text,
  interests text[] default '{}',
  itinerary jsonb not null
);

alter table itineraries enable row level security;

create policy "Itineraries are insertable by anyone"
  on itineraries for insert
  with check (true);

create policy "Itineraries are readable by anyone"
  on itineraries for select
  using (true);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  guesthouse_id text not null,
  guesthouse_name text not null,
  destination text not null,
  check_in date not null,
  check_out date not null,
  guests int not null default 1,
  guest_name text not null,
  guest_email text not null,
  notes text,
  status text not null default 'pending'
);

alter table bookings enable row level security;

-- No select policy: booking requests contain guest contact details, so they're
-- only readable via the service role key (server-side), not the anon client.
create policy "Bookings are insertable by anyone"
  on bookings for insert
  with check (true);
