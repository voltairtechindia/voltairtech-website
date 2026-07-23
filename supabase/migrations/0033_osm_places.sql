-- =====================================================================
-- Migration 0033: osm_places — local bulk copy of OpenStreetMap India.
--
-- One row per mapped Indian business that has at least one contact path
-- (phone / WhatsApp / email / website), extracted from the free Geofabrik
-- india-latest.osm.pbf with `npm run osm:import` in voltairtech-admin.
-- Powers the zero-cost "Bulk" mode on Leads → Discover: hunts become a
-- local SQL query + rule-based scoring instead of Overpass + AI calls.
--
-- Chains/franchises are pre-flagged via chain_count (rows sharing one
-- normalised name nationally) so the scorer can drop them for free.
-- Refresh by re-downloading the extract and re-running the importer —
-- it upserts on id, so re-runs are safe and incremental.
--
-- Run in the Supabase SQL editor (like 0019–0032). Safe to re-run.
-- =====================================================================

create table if not exists osm_places (
    id            text        primary key,          -- "n<osm-id>" node / "w<osm-id>" way
    name          text        not null,
    category      text,                             -- our planner key (dentist, salon…)
    raw_tag       text,                             -- source tag, e.g. "amenity=dentist"
    city          text,                             -- addr:city, else nearest metro
    state         text,
    address       text,
    lat           double precision,
    lon           double precision,
    phone         text,
    whatsapp      text,
    email         text,
    website       text,
    domain        text,
    instagram     text,
    facebook      text,
    has_hours     boolean     not null default false,
    last_verified date,                             -- OSM check_date / survey:date
    last_edited   timestamptz,                      -- element's last OSM edit
    chain_count   integer     not null default 1,   -- rows nationally with this name
    imported_at   timestamptz not null default now()
);

create index if not exists osm_places_category_idx on osm_places (category);
create index if not exists osm_places_city_idx     on osm_places (city);
create index if not exists osm_places_domain_idx   on osm_places (domain) where domain is not null;
create index if not exists osm_places_name_idx     on osm_places (lower(name));

alter table osm_places enable row level security;
-- No policies on purpose: only the admin's service-role key reads/writes it.
