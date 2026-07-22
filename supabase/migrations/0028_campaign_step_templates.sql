-- 0028_campaign_step_templates.sql
-- Per-step outreach templates for a campaign.
--
-- `step_templates` is an object keyed by step index as a string:
--   "0" = opener, "1" = follow-up #1, "2" = follow-up #2, …
-- Each value is { "subject": string, "body": string } with {{merge_field}}
-- placeholders ({{company}} {{first_name}} {{contact_name}} {{hook}} {{service}}
-- {{industry}} {{location}} {{domain}}).
--
-- When a step has a template it is merge-filled verbatim at send time; when it
-- is absent/empty the campaign falls back to the existing behaviour — an
-- AI-personalised opener for step 0, and the built-in rotating "bump" copy for
-- follow-ups. Additive and safe: existing campaigns keep '{}' and are unchanged.

alter table lead_campaigns
  add column if not exists step_templates jsonb not null default '{}'::jsonb;
