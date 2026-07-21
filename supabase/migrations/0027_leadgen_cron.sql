-- =====================================================================
-- Migration 0027: hourly lead-gen crons via Supabase pg_cron.
--
-- Vercel Hobby caps cron jobs at once/day, so the hourly outbox + reply
-- detection run from Supabase instead: pg_cron schedules them and pg_net makes
-- the authenticated HTTP call to the admin's cron endpoints. (Vercel still runs
-- them once/day as a fallback — harmless, the endpoints are idempotent.)
--
-- ⚠️ BEFORE RUNNING: replace  YOUR_CRON_SECRET  (BOTH places) with the
-- CRON_SECRET value from Vercel → voltairtech-admin → Settings → Environment
-- Variables (reveal/edit it there). This file ships a PLACEHOLDER only — never
-- commit the real secret.
--
-- Run in the Supabase SQL editor. Safe to re-run (it re-schedules cleanly).
-- If `create extension` errors, enable pg_cron + pg_net from Database → Extensions first.
-- =====================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Idempotent: drop any existing jobs with these names before re-adding.
select cron.unschedule(jobname) from cron.job where jobname in ('leadgen-outbox', 'leadgen-replies');

-- Outbox: send due queued emails, hourly on the hour.
select cron.schedule('leadgen-outbox', '0 * * * *', $$
  select net.http_get(
    url     := 'https://voltairtech-admin.vercel.app/api/cron/leadgen-outbox',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR_CRON_SECRET')
  );
$$);

-- Reply detection: poll every account's inbox, hourly at :15.
select cron.schedule('leadgen-replies', '15 * * * *', $$
  select net.http_get(
    url     := 'https://voltairtech-admin.vercel.app/api/cron/leadgen-replies',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR_CRON_SECRET')
  );
$$);

-- Check they're scheduled:  select jobname, schedule, active from cron.job;
-- See recent runs:          select * from cron.job_run_details order by start_time desc limit 10;
