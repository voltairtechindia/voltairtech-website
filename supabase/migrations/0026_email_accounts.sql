-- =====================================================================
-- Migration 0026: multiple sending accounts (pick per campaign + default).
--
-- Turns the single lead_settings mailbox into a list of email_accounts. A
-- campaign can pick which account sends (lead_campaigns.email_account_id);
-- unset = the default account. Reply detection polls every account's inbox.
-- Global bits (public_url, daily_cap) stay on lead_settings.
--
-- The existing single mailbox is seeded in as the first (default) account.
-- Passwords stay service-key-only; RLS is enabled (deny anon/authenticated).
--
-- Run in the Supabase SQL editor (like 0019–0025). Safe to re-run.
-- =====================================================================

create table if not exists email_accounts (
    id          uuid        primary key default gen_random_uuid(),
    from_name   text,
    from_email  text        not null,
    smtp_host   text,
    smtp_port   int,
    smtp_user   text,
    smtp_pass   text,
    imap_host   text,
    imap_user   text,
    imap_pass   text,
    reply_to    text,
    is_default  boolean     not null default false,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- At most one default account.
create unique index if not exists email_accounts_one_default
    on email_accounts (is_default) where is_default;

alter table email_accounts enable row level security;

-- Seed the first account from the existing single-row settings, if configured.
insert into email_accounts (from_name, from_email, smtp_host, smtp_port, smtp_user, smtp_pass, imap_host, imap_user, imap_pass, reply_to, is_default)
select from_name, coalesce(from_email, smtp_user), smtp_host, smtp_port, smtp_user, smtp_pass, imap_host, imap_user, imap_pass, reply_to, true
  from lead_settings
 where id = 'default'
   and coalesce(from_email, smtp_user, '') <> ''
   and not exists (select 1 from email_accounts);

-- Campaigns can pick which account sends (null = default).
alter table lead_campaigns
    add column if not exists email_account_id uuid references email_accounts(id) on delete set null;

drop trigger if exists trg_email_accounts_updated_at on email_accounts;
create trigger trg_email_accounts_updated_at
    before update on email_accounts
    for each row execute function set_updated_at();
