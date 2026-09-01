-- =====================================================================
-- Migration 0038: photo + video galleries for services and industries
--
-- Service and industry detail pages read as text-only articles: a headline,
-- a lead paragraph, and a wall of Markdown. Blog posts (0015) and live
-- projects (0037) already carry a `media` gallery; this gives the same to the
-- two page types a visitor actually lands on from search.
--
-- `media` is the SAME MediaItem shape used by blog_posts.media and
-- live_projects.media, so the admin's picker, the site's `toEmbedSrc` helper
-- and the CSP frame-src allowlist stay shared rather than re-declared:
--   { "type": "image", "url": "...", "alt": "...", "caption": "..." }
--   { "type": "video", "url": "...", "poster": "...", "caption": "..." }
--   { "type": "embed", "url": "...", "provider": "youtube", "caption": "..." }
--
-- Sector-only sub-services (`industries.custom_services`) get their gallery
-- inside that existing JSONB array — no column needed, same as their `faq`.
-- =====================================================================

alter table services
    add column if not exists media jsonb not null default '[]'::jsonb;

alter table industries
    add column if not exists media jsonb not null default '[]'::jsonb;

comment on column services.media is
    'Photo/video gallery for /services/<slug>. MediaItem[] — same shape as blog_posts.media.';

comment on column industries.media is
    'Photo/video gallery for /industries/<slug>. MediaItem[] — same shape as blog_posts.media.';
