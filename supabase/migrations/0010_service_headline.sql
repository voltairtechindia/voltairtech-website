-- =====================================================================
-- Migration 0010: optional service detail-page headline
--
-- The card + breadcrumb use the short `title`; the detail page can show a
-- punchier `headline` as its H1. Nullable — falls back to `title` when unset.
-- =====================================================================

alter table services add column if not exists headline text;
