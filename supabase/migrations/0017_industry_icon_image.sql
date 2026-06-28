-- =====================================================================
-- Migration 0017: per-industry sector-badge image override
--
-- The /industries grid + detail render a sector "badge" icon. It was served from
-- a hardcoded /public/images/industries/<key>.png (a curated registry keyed by
-- `icon`). This optional column lets the admin upload a custom badge image per
-- industry (stored in the blog-media bucket). When set it overrides the registry
-- PNG; when null the code falls back to the bundled registry image for `icon`.
-- Shape mirrors cover_image: { "url": "...", "alt": "..."? }.
-- =====================================================================

alter table industries
    add column if not exists icon_image jsonb;
