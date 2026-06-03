-- =====================================================================
-- Migration 0007: admin_users — multi-user login for the admin panel
--
-- The voltairtech-admin app authenticates against this table. Per the owner's
-- preference (matching kauntech-admin), passwords are stored as PLAIN TEXT in
-- the `password` column — add a row with a username + password (here or via the
-- Users page) and that's the login. RLS ON, NO policies: only the service-role
-- key (used by the admin server) can read/write; the anon key gets zero access.
--
-- NOTE: plaintext means anyone with DB access can read these passwords.
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists admin_users (
    id            uuid        primary key default gen_random_uuid(),
    username      text        not null unique,
    password      text        not null,        -- plaintext (intentional, per owner)
    is_active     boolean     not null default true,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

-- case-insensitive uniqueness on username (so "Admin" == "admin")
create unique index if not exists admin_users_username_lower_idx
    on admin_users (lower(username));

drop trigger if exists trg_admin_users_updated_at on admin_users;
create trigger trg_admin_users_updated_at
    before update on admin_users
    for each row execute function set_updated_at();

alter table admin_users enable row level security;

-- Seed the first admin. CHANGE this password (or add your own user + delete
-- this one) from the panel's Users page after first login.
insert into admin_users (username, password)
values ('admin', 'vt-7bd360025301')
on conflict (username) do nothing;
