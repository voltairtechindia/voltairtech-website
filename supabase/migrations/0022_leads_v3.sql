-- =====================================================================
-- Migration 0022: Lead Gen v3 — simpler funnel + archived bucket.
--
-- Statuses collapse 6 → 5: drop `won`, rename `lost` → `archived`.
-- The forward funnel is now found → verified → contacted → replied;
-- `archived` parks dead ends off to the side. No CHECK constraints exist on
-- status (app-layer enforced), so this is a pure data remap.
--
-- Run in the Supabase SQL editor (like 0019–0021). Safe to re-run.
-- =====================================================================

-- A closed-won lead had, by definition, replied — keep it in the funnel and
-- preserve "became a customer" as a tag rather than a bespoke stage.
update leads
   set tags = array_append(tags, 'customer')
 where status = 'won' and not ('customer' = any(tags));
update leads set status = 'replied'  where status = 'won';

-- Dead ends: lost (and any legacy `unfit`) park under the neutral `archived`.
update leads set status = 'archived' where status in ('lost', 'unfit');

comment on column leads.status is 'found | verified | contacted | replied | archived';
