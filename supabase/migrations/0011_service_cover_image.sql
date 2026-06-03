-- Services can carry a cover image (same shape as blog_posts.cover_image:
-- { "url": "...", "alt": "..." }). Rendered on the /services grid + detail page.
alter table public.services add column if not exists cover_image jsonb;
