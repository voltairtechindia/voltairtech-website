-- =====================================================================
-- Migration 0029: ONE lead-gen tick, every 10 minutes (replaces 0027).
--
-- What 0027 left us with (both live in cron.job right now):
--   · leadgen-outbox  @ :00 — sends on the hourly grid, so an 11:19 send
--     time actually fires at 12:00 (up to 59 min late).
--   · leadgen-replies @ :15 — polls AFTER sending (backwards: someone who
--     replied overnight still gets the morning bump), and its pg_net call
--     times out (status_code null) because IMAP scans outlast the ~5s default.
--
-- The new /api/cron/leadgen-tick endpoint fixes all three: it runs reply
-- detection FIRST, then the outbox, in one pass — and a 10-minute cadence
-- lands each email within minutes of its campaign's chosen send time.
--
-- No placeholder needed: this reuses the CRON_SECRET already stored inside
-- the old leadgen-outbox job, without it ever leaving Postgres. (Only if no
-- old job exists will it ask you to paste the secret by hand.)
--
-- ⚠️ Run this AFTER deploying the admin build that has /api/cron/leadgen-tick
--    — the old jobs are unscheduled here, so running it early would pause
--    auto-sending until the deploy lands.
--
-- Run in the Supabase SQL editor. Safe to re-run.
-- =====================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
declare
  old_cmd text;
  secret  text;
begin
  -- Pull the bearer secret out of whichever leadgen job already carries it.
  select command into old_cmd
  from cron.job
  where jobname in ('leadgen-outbox', 'leadgen-replies', 'leadgen-tick')
    and command like '%Bearer %'
  limit 1;
  secret := substring(old_cmd from 'Bearer ([^'']+)');

  if secret is null or secret = '' or secret = 'YOUR_CRON_SECRET' then
    raise exception using message =
      'No existing leadgen cron job to copy the secret from. Edit this migration: '
      || 'replace the secret lookup with your CRON_SECRET value (Vercel → voltairtech-admin → env vars) and re-run.';
  end if;

  -- Retire the 0027 jobs and any previous copy of the tick.
  perform cron.unschedule(jobname)
  from cron.job
  where jobname in ('leadgen-outbox', 'leadgen-replies', 'leadgen-tick');

  -- The tick: reply detection → outbox send, every 10 minutes.
  -- (Per-email progress commits as it goes, so a response timeout on a long
  -- run loses nothing — the next tick resumes where it left off.)
  perform cron.schedule('leadgen-tick', '*/10 * * * *', format($job$
  select net.http_get(
    url                  := 'https://voltairtech-admin.vercel.app/api/cron/leadgen-tick',
    headers              := jsonb_build_object('Authorization', 'Bearer %s'),
    timeout_milliseconds := 60000
  );
$job$, secret));
end $$;

-- Check it's scheduled:  select jobname, schedule, active from cron.job;
-- Watch it work:         select status_code, content, created
--                        from net._http_response order by created desc limit 5;
