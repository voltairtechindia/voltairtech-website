-- =====================================================================
-- Migration 0018: track when an inquiry's status last changed.
--
-- The admin panel auto-deletes spam 30 days after it is marked spam (cron:
-- admin /api/cron/purge-spam). `created_at` can't drive that — a submission
-- from six months ago that you flag today would be purged on the next run.
-- This column starts the retention clock at the moment of the flag.
--
-- Backfill: existing spam gets a fresh clock (now()) so applying this migration
-- never causes an immediate mass delete. Everything else falls back to created_at.
-- =====================================================================

alter table contact_submissions
    add column if not exists status_changed_at timestamptz;

update contact_submissions
   set status_changed_at = case when status = 'spam' then now() else created_at end
 where status_changed_at is null;

alter table contact_submissions
    alter column status_changed_at set default now();
alter table contact_submissions
    alter column status_changed_at set not null;

-- Partial index: the purge only ever scans spam rows by their retention clock.
create index if not exists contact_submissions_spam_purge_idx
    on contact_submissions (status_changed_at)
 where status = 'spam';
