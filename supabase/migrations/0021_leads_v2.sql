-- =====================================================================
-- Migration 0021: Lead Gen v2 — combined verify+enrich, 3-step flow.
--
-- Statuses collapse 8 → 6: found → verified → contacted → replied → won,
-- plus lost (parked). No CHECK constraints existed on status (app-layer
-- enforced), so this is a data remap + additive columns only.
--
-- Run in the Supabase SQL editor (like 0019/0020). Safe to re-run.
-- =====================================================================

alter table leads
    add column if not exists phones          text[] not null default '{}',
    add column if not exists address         text,
    add column if not exists service_matches jsonb  not null default '[]'::jsonb;

-- Backfill the new plural phones from the old singular phone.
update leads
   set phones = array[phone]
 where phone is not null and btrim(phone) <> '' and phones = '{}';

-- Status collapse (old → new).
update leads set status = 'found'    where status = 'new';
update leads set status = 'verified' where status in ('enriched', 'qualified');
update leads set status = 'lost'     where status = 'unfit';

alter table leads alter column status set default 'found';

comment on column leads.status          is 'found | verified | contacted | replied | won | lost';
comment on column leads.phone           is 'DEPRECATED — superseded by phones[] (kept for rollback safety)';
comment on column leads.phones          is 'All captured phone numbers, best first';
comment on column leads.address         is 'Physical/registered address scraped or researched';
comment on column leads.service_matches is 'jsonb [{service, reason}] — which of OUR services fit this lead';
