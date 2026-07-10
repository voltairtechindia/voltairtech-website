-- =====================================================================
-- Migration 0018: track when an inquiry's status last changed.
--
-- The admin panel auto-deletes spam 30 days after it is marked spam (cron:
-- admin /api/cron/purge-spam). `created_at` can't drive that — a submission
-- from six months ago that you flag today would be purged on the next run.
-- This column starts the retention clock at the moment of the flag.
--
-- One statement on purpose. The earlier shape — add nullable, backfill, then
-- SET NOT NULL — races the live contact form: an INSERT landing between the
-- backfill and SET NOT NULL writes a NULL (no default yet) and aborts the
-- migration. Folding the default into ADD COLUMN holds one ACCESS EXCLUSIVE
-- lock for the whole change, so no row can slip through nullable. Postgres 11+
-- evaluates now() once and stores it as the missing value, so existing rows are
-- filled without a table rewrite.
--
-- Every existing row therefore starts its clock at migration time. For spam
-- that is exactly what we want — a fresh 30 days, never an immediate mass
-- delete. For new/handled rows the value is unread (the purge only ever looks
-- at spam) and is corrected the moment their status actually changes.
-- =====================================================================

alter table contact_submissions
    add column if not exists status_changed_at timestamptz not null default now();

-- Partial index: the purge only ever scans spam rows by their retention clock.
create index if not exists contact_submissions_spam_purge_idx
    on contact_submissions (status_changed_at)
 where status = 'spam';
