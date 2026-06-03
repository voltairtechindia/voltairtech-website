-- =====================================================================
-- Migration 0004: dynamic blog (admin / n8n -> Supabase -> site) with media
--
-- blog_posts (one row per article, photos + video media) + a public
-- `blog-media` Storage bucket. RLS ON with NO policies on blog_posts; the
-- Next.js server reads + writes with the service-role key. The admin panel
-- posts to the site's /api/blog (which also embeds published posts into RAG).
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists blog_posts (
    id              uuid        primary key default gen_random_uuid(),
    slug            text        not null unique,            -- URL: /blog/<slug>
    title           text        not null,
    excerpt         text,
    body_md         text        not null default '',         -- article body (Markdown)
    -- { "url": "...", "alt": "..." }  (nullable — posts may have no cover)
    cover_image     jsonb       default '{}'::jsonb,
    -- Ordered media gallery: each item one of
    --   { "type":"image", "url":"...", "alt":"...", "caption":"..." }
    --   { "type":"video", "url":"...mp4", "poster":"...", "caption":"..." }
    --   { "type":"embed", "url":"https://youtube.com/...", "provider":"youtube", "caption":"..." }
    media           jsonb       not null default '[]'::jsonb,
    tags            text[]      not null default '{}',
    author          text        not null default 'Voltair Tech',
    seo             jsonb       not null default '{}'::jsonb, -- { title, description, og_image }
    status          text        not null default 'draft'
                                check (status in ('draft', 'published', 'archived')),
    reading_minutes int,
    published_at    timestamptz,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

create index if not exists blog_posts_published_idx
    on blog_posts (published_at desc)
    where status = 'published';
create index if not exists blog_posts_status_idx on blog_posts (status);
create index if not exists blog_posts_tags_idx   on blog_posts using gin (tags);

drop trigger if exists trg_blog_posts_updated_at on blog_posts;
create trigger trg_blog_posts_updated_at
    before update on blog_posts
    for each row execute function set_updated_at();

alter table blog_posts enable row level security;
-- RLS ON, no policies → anon/authenticated get zero access; service_role bypasses.

-- =====================================================================
-- Storage: public bucket for blog photos + short videos (100 MB/file).
-- Long videos -> YouTube/Vimeo as a { type:"embed" } media item.
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'blog-media',
    'blog-media',
    true,
    104857600,
    array[
        'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif',
        'video/mp4', 'video/webm', 'video/quicktime'
    ]
)
on conflict (id) do update
    set public             = excluded.public,
        file_size_limit    = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

-- Public READ on objects in blog-media. Writes happen via the service-role key
-- (admin /api/upload, or admin -> /api/blog), which bypasses RLS.
drop policy if exists "blog-media public read" on storage.objects;
create policy "blog-media public read"
    on storage.objects for select
    to public
    using (bucket_id = 'blog-media');
