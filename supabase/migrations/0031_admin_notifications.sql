-- =====================================================================
-- Migration 0031: admin email notifications (lead replies + enquiries).
--
-- One settings row drives the notifier that runs inside the 10-minute
-- lead-gen tick: when a lead replies or a new contact-form enquiry lands,
-- every address in `recipients` gets an email (sent from the default
-- lead-gen sending account). Configured from the admin → Admins page.
--
-- Watermarks (`last_inquiry_id`, `last_reply_at`) track what has already
-- been notified so each event is emailed exactly once. They start NULL and
-- are baselined to "now" on the notifier's first run, so enabling the
-- feature never floods the inbox with history.
--
-- Run in the Supabase SQL editor (like 0019–0030). Safe to re-run.
-- =====================================================================

create table if not exists notification_settings (
    id               text        primary key default 'default',
    notify_replies   boolean     not null default true,
    notify_inquiries boolean     not null default true,
    recipients       text[]      not null default '{}',
    last_inquiry_id  bigint,
    last_reply_at    timestamptz,
    updated_at       timestamptz not null default now()
);

insert into notification_settings (id) values ('default') on conflict (id) do nothing;

alter table notification_settings enable row level security;

drop trigger if exists trg_notification_settings_updated_at on notification_settings;
create trigger trg_notification_settings_updated_at
    before update on notification_settings
    for each row execute function set_updated_at();
