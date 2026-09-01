-- =====================================================================
-- Migration 0037: DB-backed, admin-managed live projects (mirrors services)
--
-- /live-projects is the studio's shipped-product portfolio. Each row renders
-- one editorial spread: a brochure cover plate, the product's figures, its
-- highlights, the surfaces and stack it runs on, and a downloadable PDF.
--
-- Ordering is `position` (asc), like services and industries, so the admin's
-- OrderBoard can reshuffle the page with a column-only write. Published rows
-- are embedded into the RAG store (doc_type "live_project") by
-- POST /api/live-projects so the chatbot can answer "what have you built?".
--
-- RLS ON, no policies (service-role only); the site renders server-side.
--
-- JSONB shapes:
--   stats        [{ "value": "16", "label": "Manager screens" }]
--   links        [{ "label": "kauntech.com", "href": "https://kauntech.com" }]
--   media        [{ "type": "embed", "url": "https://youtu.be/…" }, … ]
--   cover_image  { "url": "https://…", "alt": "FleetDrop brochure cover" }
--   brochure     { "url": "https://…", "label": "FleetDrop brochure",
--                  "size_bytes": 1136128, "pages": 9 }
--   seo          { "title": "…", "description": "…", "og_image": "…" }
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists live_projects (
    id            uuid        primary key default gen_random_uuid(),
    slug          text        not null unique,
    name          text        not null,
    kicker        text,                                    -- category line above the name
    tagline       text,                                    -- one-line promise (serif italic)
    summary       text,                                    -- paragraph under the tagline
    -- Where the product actually is. Drives the status chip + the index LED,
    -- and is deliberately separate from `status` (draft/published/archived),
    -- which is about whether the ROW is shown at all.
    lifecycle     text        not null default 'build'
                              check (lifecycle in ('live', 'shipped', 'build')),
    surfaces      text[]      not null default '{}',        -- iOS, Android, Web console, …
    stack         text[]      not null default '{}',        -- Next.js, Supabase, …
    highlights    text[]      not null default '{}',        -- hairline-ruled points
    stats         jsonb       not null default '[]'::jsonb, -- [{ value, label }]
    links         jsonb       not null default '[]'::jsonb, -- [{ label, href }]
    -- Gallery shown in the panel's horizontal media scroller. Same MediaItem
    -- shape as blog_posts.media, so the admin's picker and the site's embed
    -- helper are shared rather than re-declared:
    --   { "type": "image", "url", "alt"?, "caption"? }
    --   { "type": "video", "url", "poster"?, "caption"? }   (self-hosted mp4)
    --   { "type": "embed", "url", "provider"? , "caption"? } (YouTube / Vimeo)
    media         jsonb       not null default '[]'::jsonb,
    cover_image   jsonb,                                    -- { url, alt }
    brochure      jsonb,                                    -- { url, label, size_bytes, pages }
    tags          text[]      not null default '{}',
    seo           jsonb       not null default '{}'::jsonb,
    position      int         not null default 0,           -- order on the page (asc)
    status        text        not null default 'draft'
                              check (status in ('draft', 'published', 'archived')),
    published_at  timestamptz,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create index if not exists live_projects_position_idx
    on live_projects (position asc, created_at) where status = 'published';
create index if not exists live_projects_status_idx on live_projects (status);

drop trigger if exists trg_live_projects_updated_at on live_projects;
create trigger trg_live_projects_updated_at
    before update on live_projects
    for each row execute function set_updated_at();

alter table live_projects enable row level security;
-- RLS ON, no policies → anon/authenticated get zero access; service_role bypasses.

-- =====================================================================
-- Storage: public bucket for project covers AND brochure PDFs.
--
-- `blog-media` deliberately refuses application/pdf, and a brochure is a much
-- larger, longer-lived asset than a post's inline image — so projects get
-- their own bucket rather than widening the blog's MIME allow-list. Screen
-- recordings live here too, hence the video types and the 100 MB ceiling;
-- anything longer belongs on YouTube as a { type: "embed" } media item.
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'project-media',
    'project-media',
    true,
    104857600,
    array[
        'image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif',
        'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf'
    ]
)
on conflict (id) do update
    set public             = excluded.public,
        file_size_limit    = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

-- Public READ on objects in project-media. Writes happen via the service-role
-- key (admin /api/upload), which bypasses RLS.
drop policy if exists "project-media public read" on storage.objects;
create policy "project-media public read"
    on storage.objects for select
    to public
    using (bucket_id = 'project-media');
