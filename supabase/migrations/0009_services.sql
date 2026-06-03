-- =====================================================================
-- Migration 0009: DB-backed, admin-managed services (mirrors blog_posts)
--
-- The /services index is paginated by `position`; each /services/<slug> detail
-- page renders from `body_md`. Published rows are embedded into the RAG store
-- (doc_type "service") by POST /api/services so the chatbot cites them. RLS ON,
-- no policies (service-role only); the site renders server-side.
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists services (
    id            uuid        primary key default gen_random_uuid(),
    slug          text        not null unique,
    title         text        not null,
    summary       text,                                   -- short teaser / meta description
    bullets       text[]      not null default '{}',       -- card bullet points
    eta           text,                                    -- "48 hrs", "2–3 weeks"
    icon          text        not null default 'default',  -- ServiceGlyph registry key
    lead          text,                                    -- detail-page hero lead
    meta          text,                                    -- detail-page meta line
    body_md       text        not null default '',         -- detail-page body (Markdown)
    price         text,                                    -- INR amount for JSON-LD offer (optional)
    tags          text[]      not null default '{}',
    seo           jsonb       not null default '{}'::jsonb, -- { title, description, og_image }
    position      int         not null default 0,           -- ordering on the grid (asc)
    status        text        not null default 'draft'
                              check (status in ('draft', 'published', 'archived')),
    published_at  timestamptz,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create index if not exists services_position_idx
    on services (position asc, created_at) where status = 'published';
create index if not exists services_status_idx on services (status);

drop trigger if exists trg_services_updated_at on services;
create trigger trg_services_updated_at
    before update on services
    for each row execute function set_updated_at();

alter table services enable row level security;
-- RLS ON, no policies → anon/authenticated get zero access; service_role bypasses.
