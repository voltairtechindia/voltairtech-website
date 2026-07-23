-- =====================================================================
-- Migration 0032: instant enquiry notifications.
--
-- 0031 added admin email notifications, checked every 10 minutes by the
-- lead-gen tick. This makes the enquiry half INSTANT: an AFTER INSERT
-- trigger on contact_submissions fires a pg_net call to the admin's
-- /api/cron/notify endpoint, which runs just the notifier pass — so the
-- "someone enquired" email lands seconds after the form is submitted.
-- (Lead replies stay on the 10-minute tick: they're found by polling the
-- inbox over IMAP, which has no push.)
--
-- The watermark CAS inside the notifier makes the trigger racing the tick
-- harmless, and the tick remains the safety net if a trigger call is lost.
--
-- No placeholder needed: the CRON_SECRET is copied out of the existing
-- leadgen-tick cron job, without ever leaving Postgres (same as 0029).
--
-- Safe to run BEFORE the admin deploy that adds /api/cron/notify — until
-- then the trigger's calls just 404 and the 10-minute tick keeps covering.
--
-- Run in the Supabase SQL editor. Safe to re-run.
-- =====================================================================

create extension if not exists pg_net;

do $$
declare
  old_cmd text;
  secret  text;
begin
  -- Lift the bearer secret from the tick job (0029 put it there).
  select command into old_cmd
  from cron.job
  where jobname in ('leadgen-tick', 'leadgen-outbox', 'leadgen-replies')
    and command like '%Bearer %'
  limit 1;
  secret := substring(old_cmd from 'Bearer ([^'']+)');

  if secret is null or secret = '' or secret = 'YOUR_CRON_SECRET' then
    raise exception using message =
      'No existing leadgen cron job to copy the secret from. Edit this migration: '
      || 'replace the secret lookup with your CRON_SECRET value (Vercel → voltairtech-admin → env vars) and re-run.';
  end if;

  -- The trigger function carries the secret in its body — same exposure as
  -- the cron.job command text, i.e. visible only inside Postgres.
  execute format($fn$
    create or replace function notify_admins_of_inquiry() returns trigger
    language plpgsql security definer as $body$
    begin
      perform net.http_get(
        url                  := 'https://voltairtech-admin.vercel.app/api/cron/notify',
        headers              := jsonb_build_object('Authorization', 'Bearer %s'),
        timeout_milliseconds := 15000
      );
      return null;
    end;
    $body$;
  $fn$, secret);
end $$;

drop trigger if exists trg_contact_submissions_notify on contact_submissions;
create trigger trg_contact_submissions_notify
    after insert on contact_submissions
    for each row
    when (new.status is distinct from 'spam')
    execute function notify_admins_of_inquiry();

-- Watch it work:  select status_code, content, created
--                 from net._http_response order by created desc limit 5;
