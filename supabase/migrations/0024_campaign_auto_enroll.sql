-- =====================================================================
-- Migration 0024: campaign auto-enroll.
--
-- Adds `auto_enroll` to lead_campaigns. When true, a lead that becomes
-- `verified` (real business + deliverable email) is automatically added to
-- that campaign — the opener queues itself, no manual "add to campaign" step.
-- Only ONE campaign should be auto_enroll at a time (enforced app-side).
--
-- Run in the Supabase SQL editor (like 0019–0023). Safe to re-run.
-- =====================================================================

alter table lead_campaigns
    add column if not exists auto_enroll boolean not null default false;

comment on column lead_campaigns.auto_enroll is
  'When true, newly verified leads are auto-enrolled into this campaign (only one should be true).';
