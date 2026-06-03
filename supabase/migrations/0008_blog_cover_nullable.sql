-- =====================================================================
-- Migration 0008: make blog_posts.cover_image nullable
--
-- Posts without a cover image insert NULL (the API normalises a missing cover
-- to null). The original column was NOT NULL with a '{}' default, which the
-- explicit null violated. Relax the constraint; the default '{}' stays for the
-- column-omitted case, and the renderer already treats null/{} as "no cover".
-- =====================================================================

alter table blog_posts alter column cover_image drop not null;
