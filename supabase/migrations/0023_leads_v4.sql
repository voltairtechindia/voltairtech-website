-- =====================================================================
-- Migration 0023: Lead Gen v4 — rename archived→rejected + email tracking.
--
--   * Lead status: `archived` → `rejected` (single negative terminal:
--     an explicit "no", or silence after the last follow-up).
--   * lead_emails: open/click counters for tracked HTML sends.
--
-- No CHECK constraints on lead status (app-layer enforced). Only the LEADS
-- status is renamed — campaign statuses (lead_campaigns.status) keep `archived`.
-- Run in the Supabase SQL editor (like 0019–0022). Safe to re-run.
-- =====================================================================

update leads set status = 'rejected' where status = 'archived';

alter table lead_emails
    add column if not exists opened_at   timestamptz,
    add column if not exists open_count  int not null default 0,
    add column if not exists clicked_at  timestamptz,
    add column if not exists click_count int not null default 0;

comment on column leads.status            is 'found | verified | contacted | replied | rejected';
comment on column lead_emails.open_count  is 'Tracking-pixel hits (approximate — mail proxies inflate)';
comment on column lead_emails.click_count is 'Tracked-link clicks';
