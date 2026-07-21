-- =====================================================================
-- Migration 0020: per-campaign send scheduling (Lead Gen follow-ups)
--
-- Auto follow-ups used to queue exactly N*24h after the opener — so an
-- opener sent at 2am produced a 2am follow-up. These columns let each
-- campaign pick the time-of-day its follow-ups go out (IST) and skip
-- weekends, so bumps land during business hours on working days.
--
-- Additive + idempotent + safe defaults (9:30 IST, weekdays only), so
-- applying it never disturbs existing campaigns.
-- =====================================================================

alter table lead_campaigns
    add column if not exists send_hour     smallint not null default 9
        check (send_hour   between 0 and 23),
    add column if not exists send_minute   smallint not null default 30
        check (send_minute between 0 and 59),
    add column if not exists weekdays_only boolean  not null default true;
