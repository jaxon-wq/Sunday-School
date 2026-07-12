create table if not exists ward_spaces (
  space_id text primary key,
  envelope jsonb not null,
  updated_at timestamptz not null default now()
);

alter table ward_spaces enable row level security;

create policy "ciphertext read" on ward_spaces for select using (true);
create policy "ciphertext insert" on ward_spaces for insert with check (true);
create policy "ciphertext update" on ward_spaces for update using (true) with check (true);

-- After running this migration, enable Realtime for ward_spaces in the
-- Supabase dashboard: Database → Replication → supabase_realtime → ward_spaces.
