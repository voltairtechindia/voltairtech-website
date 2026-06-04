-- =====================================================================
-- Migration 0012: DB-backed, admin-managed industries (mirrors `services`)
--
-- /industries is a sector lens over the catalogue: each industry page renders
-- "what you get" copy (body_md) plus a curated subset of services it links to
-- via `service_slugs` (an ordered array of service slugs — admin-controlled
-- order). /services still lists everything; /industries filters it per sector.
--
-- Published rows are embedded into the RAG store (doc_type "industry") by
-- POST /api/industries so the chatbot can answer "do you work with healthcare?"
-- and cite the matching sector + its services. RLS ON, no policies
-- (service-role only); the site renders server-side.
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists industries (
    id            uuid        primary key default gen_random_uuid(),
    slug          text        not null unique,
    title         text        not null,                     -- sector name, e.g. "Healthcare & Clinics"
    headline      text,                                     -- detail-page H1 (falls back to title)
    summary       text,                                     -- short teaser / card + meta description
    bullets       text[]      not null default '{}',         -- card bullet points ("what you get")
    icon          text        not null default 'default',    -- IndustryGlyph registry key (sector glyph)
    cover_image   jsonb,                                     -- { url, alt }
    lead          text,                                      -- detail-page hero lead
    meta          text,                                      -- detail-page meta line
    body_md       text        not null default '',           -- detail-page body (Markdown)
    tags          text[]      not null default '{}',
    service_slugs text[]      not null default '{}',          -- linked service slugs (curated subset, ordered)
    seo           jsonb       not null default '{}'::jsonb,   -- { title, description, og_image }
    position      int         not null default 0,            -- ordering on the grid (asc)
    status        text        not null default 'draft'
                              check (status in ('draft', 'published', 'archived')),
    published_at  timestamptz,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create index if not exists industries_position_idx
    on industries (position asc, created_at) where status = 'published';
create index if not exists industries_status_idx on industries (status);

drop trigger if exists trg_industries_updated_at on industries;
create trigger trg_industries_updated_at
    before update on industries
    for each row execute function set_updated_at();

alter table industries enable row level security;
-- RLS ON, no policies → anon/authenticated get zero access; service_role bypasses.
