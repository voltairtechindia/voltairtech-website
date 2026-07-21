-- =====================================================================
-- Migration 0025: lead_settings — email/sending config from the admin.
--
-- Moves the sending address, app password, tracking URL and daily cap out of
-- env vars and into a single editable row, so they can be changed from the
-- Lead Gen → Settings page with no redeploy. Every field still falls back to
-- its env var if left blank (backwards compatible).
--
-- Passwords are stored as-is: the table is reachable only with the service key,
-- behind the admin login, and is never returned to the browser.
--
-- Run in the Supabase SQL editor (like 0019–0024). Safe to re-run.
-- =====================================================================

create table if not exists lead_settings (
    id          text        primary key default 'default',
    from_name   text,
    from_email  text,
    smtp_host   text,
    smtp_port   int,
    smtp_user   text,
    smtp_pass   text,
    imap_host   text,
    imap_user   text,
    imap_pass   text,
    reply_to    text,
    public_url  text,
    daily_cap   int,
    updated_at  timestamptz not null default now()
);

insert into lead_settings (id) values ('default') on conflict (id) do nothing;

drop trigger if exists trg_lead_settings_updated_at on lead_settings;
create trigger trg_lead_settings_updated_at
    before update on lead_settings
    for each row execute function set_updated_at();
