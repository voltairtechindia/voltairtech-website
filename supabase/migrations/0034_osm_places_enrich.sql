-- =====================================================================
-- Migration 0034: osm_places enrichment columns (free liveness signals).
--
-- The monthly refresh workflow now runs scripts/osm-enrich.mjs after the
-- import: it HTTP-probes every pool website (dead/parked/placeholder
-- detection) and MX-checks every pool email — all free, on the GitHub
-- runner. Bulk-mode scoring reads these to rank "dead site but phone
-- rings" as a prime rebuild pitch, bury undeliverable emails, and drop
-- site-only ghosts before they're ever surfaced.
--
-- Run in the Supabase SQL editor (like 0019–0033). Safe to re-run.
-- =====================================================================

alter table osm_places add column if not exists website_status text;   -- ok|dead|parked|placeholder|blocked|unknown
alter table osm_places add column if not exists email_status   text;   -- mx_ok|no_mx|bad_format
alter table osm_places add column if not exists enriched_at    timestamptz;

create index if not exists osm_places_website_status_idx on osm_places (website_status);
