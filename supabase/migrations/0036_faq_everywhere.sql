-- =====================================================================
-- Migration 0036: dynamic FAQ for services, industries, and the /faq page
--
-- Blog posts already carry a per-post `faq` JSONB array (migration 0015) that
-- renders as an accordion + FAQPage JSON-LD and is folded into the post's RAG
-- embedding. This extends the same idea to the rest of the site:
--
--   1. `services.faq`   — per-service Q&A, rendered on /services/<slug>
--   2. `industries.faq` — per-sector Q&A, rendered on /industries/<slug>
--      (sector-only sub-services keep theirs inside the existing
--       `custom_services` JSONB — no column needed)
--   3. `site_faqs`      — the standalone /faq page, previously hardcoded in
--                         lib/content.ts. Admin-managed rows, ordered by
--                         `position`, optionally grouped by `category`, and
--                         embedded into the RAG store as doc_type "site_faq".
--
-- Shape of each element in the JSONB arrays (both fields required to survive
-- normalisation):
--   { "q": "How long does a RAG build take?",
--     "a": "Most ship in 48 hours once we have your data sources." }
-- =====================================================================

alter table services
    add column if not exists faq jsonb not null default '[]'::jsonb;

alter table industries
    add column if not exists faq jsonb not null default '[]'::jsonb;

-- ── The /faq page ─────────────────────────────────────────────────────
-- One row = one question. `slug` is derived from the question and is the
-- stable key for the RAG document, the on-page anchor (#faq-<slug>), and the
-- admin's edit route. RLS ON with no policies (service-role only), matching
-- every other content table.
create table if not exists site_faqs (
    id                 uuid        primary key default gen_random_uuid(),
    slug               text        not null unique,
    question           text        not null,
    answer             text        not null,
    category           text,                                  -- optional group heading on /faq
    tags               text[]      not null default '{}',
    position           int         not null default 0,        -- order on /faq (asc)
    homepage_featured  boolean     not null default false,     -- also show in the home-page FAQ block
    status             text        not null default 'draft'
                                   check (status in ('draft', 'published', 'archived')),
    published_at       timestamptz,
    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now()
);

create index if not exists site_faqs_position_idx
    on site_faqs (position asc, created_at) where status = 'published';
create index if not exists site_faqs_status_idx on site_faqs (status);
create index if not exists site_faqs_homepage_idx
    on site_faqs (position asc) where status = 'published' and homepage_featured;

drop trigger if exists trg_site_faqs_updated_at on site_faqs;
create trigger trg_site_faqs_updated_at
    before update on site_faqs
    for each row execute function set_updated_at();

alter table site_faqs enable row level security;
-- RLS ON, no policies → anon/authenticated get zero access; service_role bypasses.
