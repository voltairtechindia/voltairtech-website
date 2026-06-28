-- =====================================================================
-- Migration 0016: homepage-featured flag for industries
--
-- The homepage "Proof · shipped work" section surfaces one case study per
-- featured sector. The selection + order were previously HARDCODED in
-- lib/industries/db.ts (getFeaturedCaseStudies pinned three slugs and even
-- inlined a fallback case study). This column makes it admin-controlled: tick
-- "Feature on homepage" in voltairtech-admin's IndustryEditor and the sector's
-- first case study appears on the homepage, ordered by `position` (asc).
--
-- A featured industry only renders if it has at least one case study; the
-- homepage card image is the industry's `cover_image` (falls back to the bundled
-- /public/images/cases/<slug>.png illustration when no cover is uploaded).
-- =====================================================================

alter table industries
    add column if not exists homepage_featured boolean not null default false;

-- Fast lookup for the homepage query (published + featured, ordered by position).
create index if not exists industries_homepage_featured_idx
    on industries (position asc) where status = 'published' and homepage_featured;
