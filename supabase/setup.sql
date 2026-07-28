-- =====================================================================
-- Voltair Tech — full Supabase setup (all migrations, in order).
-- Paste this whole file into the Supabase SQL editor of the NEW project,
-- or apply migrations/ individually. Safe to re-run (idempotent).
-- =====================================================================


-- >>> migrations/0001_init.sql
-- =====================================================================
-- Voltair Tech — core schema (RAG + conversation logging + analytics)
--
-- Run in the Supabase SQL editor (or via setup.sql). Embedding dimension is
-- 768 — if you swap the embedding model, change vector(768) everywhere below
-- and re-ingest (EMBEDDING_DIM must match).
-- =====================================================================

-- --- Extensions --------------------------------------------------------
create extension if not exists vector;
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- =====================================================================
-- RAG knowledge base
-- =====================================================================
-- One table holds every kind of knowledge (services, FAQs, pricing, blog
-- posts, …). `doc_type` lets the retriever filter by category; `metadata`
-- keeps original structured fields (e.g. the source URL).
create table if not exists documents (
    id          bigint generated always as identity primary key,
    doc_type    text        not null,            -- service | faq | pricing | blog | <your own>
    external_id text,                            -- stable id from source data
    title       text,
    content     text        not null,            -- text that gets embedded
    metadata    jsonb       not null default '{}'::jsonb,
    embedding   vector(768),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),
    -- Non-partial unique constraint so it can be the ON CONFLICT arbiter for
    -- the ingestion upsert (PostgREST upsert can't target a partial index).
    constraint documents_type_external_key unique (doc_type, external_id)
);

create index if not exists documents_doc_type_idx on documents (doc_type);

-- Approximate-nearest-neighbour index for cosine similarity.
create index if not exists documents_embedding_idx
    on documents using hnsw (embedding vector_cosine_ops);

-- =====================================================================
-- Conversation logging (one row per chat session = latest snapshot)
-- =====================================================================
create table if not exists conversations (
    id                 uuid        primary key default gen_random_uuid(),
    session_id         text        not null,        -- generated client-side, stable per browser session
    location           text,
    topics             text[]      not null default '{}',
    mentioned_products text[]      not null default '{}',   -- (reused for service mentions)
    asked_for_location boolean     not null default false,
    intent             text,
    sentiment          text,
    lead_score         int         not null default 0,
    metadata           jsonb       not null default '{}'::jsonb,
    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now()
);

create index if not exists conversations_session_idx  on conversations (session_id);
create index if not exists conversations_created_idx  on conversations (created_at desc);

-- =====================================================================
-- Messages (full transcript)
-- =====================================================================
create table if not exists messages (
    id              bigint generated always as identity primary key,
    conversation_id uuid        not null references conversations (id) on delete cascade,
    role            text        not null check (role in ('user', 'assistant', 'system')),
    content         text        not null,
    metadata        jsonb       not null default '{}'::jsonb,
    created_at      timestamptz not null default now()
);

create index if not exists messages_conversation_idx on messages (conversation_id, created_at);

-- =====================================================================
-- Insights (append-only analytics events, one per analysed turn)
-- =====================================================================
create table if not exists conversation_insights (
    id                 bigint generated always as identity primary key,
    conversation_id    uuid        not null references conversations (id) on delete cascade,
    location           text,
    topics             text[]      not null default '{}',
    mentioned_products text[]      not null default '{}',
    asked_for_location boolean     not null default false,
    intent             text,
    sentiment          text,
    raw                jsonb       not null default '{}'::jsonb,
    created_at         timestamptz not null default now()
);

create index if not exists insights_conversation_idx on conversation_insights (conversation_id);

-- =====================================================================
-- Helpers
-- =====================================================================

-- keep updated_at fresh
create or replace function set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_documents_updated_at on documents;
create trigger trg_documents_updated_at
    before update on documents
    for each row execute function set_updated_at();

drop trigger if exists trg_conversations_updated_at on conversations;
create trigger trg_conversations_updated_at
    before update on conversations
    for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- match_documents: cosine-similarity retrieval for RAG.
-- ---------------------------------------------------------------------
create or replace function match_documents(
    query_embedding vector(768),
    match_count     int     default 6,
    filter_type     text    default null,
    min_similarity  float   default 0.0
)
returns table (
    id          bigint,
    doc_type    text,
    external_id text,
    title       text,
    content     text,
    metadata    jsonb,
    similarity  float
)
language sql stable
set search_path = public, pg_temp
as $$
    select
        d.id,
        d.doc_type,
        d.external_id,
        d.title,
        d.content,
        d.metadata,
        1 - (d.embedding <=> query_embedding) as similarity
    from documents d
    where d.embedding is not null
      and (filter_type is null or d.doc_type = filter_type)
      and (1 - (d.embedding <=> query_embedding)) >= min_similarity
    order by d.embedding <=> query_embedding
    limit match_count;
$$;


-- >>> migrations/0002_rls.sql
-- =====================================================================
-- Migration 0002: Row Level Security
--
-- The Next.js server connects with the Supabase *service role* key, which
-- bypasses RLS. Enabling RLS with NO public policies means the anon/public key
-- (if it ever leaks to the browser) cannot read or write any of these tables.
-- The widget never talks to Supabase directly — only our /api routes do.
-- =====================================================================

alter table documents              enable row level security;
alter table conversations          enable row level security;
alter table messages               enable row level security;
alter table conversation_insights  enable row level security;

-- No policies for anon/authenticated → those roles get zero access.
-- service_role bypasses RLS entirely.


-- >>> migrations/0003_contact.sql
-- =====================================================================
-- Migration 0003: contact form submissions (inquiries)
--
-- Backs the /contact BigInput -> POST /api/contact. The server inserts with
-- the service-role key; RLS is enabled with no policies so the anon/public key
-- gets zero access. Read in the admin panel's Inquiries page.
-- =====================================================================

create table if not exists contact_submissions (
    id          bigint generated always as identity primary key,
    name        text        not null,
    company     text,
    phone       text,
    email       text        not null,
    message     text        not null,
    page_url    text,
    user_agent  text,
    -- new | handled | spam — triage in the admin Inquiries page.
    status      text        not null default 'new',
    metadata    jsonb       not null default '{}'::jsonb,   -- e.g. { reply_channel: "whatsapp" }
    created_at  timestamptz not null default now()
);

create index if not exists contact_submissions_created_idx
    on contact_submissions (created_at desc);
create index if not exists contact_submissions_status_idx
    on contact_submissions (status);

alter table contact_submissions enable row level security;
-- No policies → anon/authenticated get zero access; service_role bypasses RLS.


-- >>> migrations/0004_blog.sql
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
    -- Manual /blog order: 1 = first card, NULL = unpinned (date order).
    pin_position    int,
    published_at    timestamptz,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

create index if not exists blog_posts_published_idx
    on blog_posts (pin_position asc nulls last, published_at desc)
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


-- >>> migrations/0008_blog_cover_nullable.sql
-- =====================================================================
-- Migration 0008: make blog_posts.cover_image nullable
--
-- Posts without a cover image insert NULL (the API normalises a missing cover
-- to null). The original column was NOT NULL with a '{}' default, which the
-- explicit null violated. Relax the constraint; the default '{}' stays for the
-- column-omitted case, and the renderer already treats null/{} as "no cover".
-- =====================================================================

alter table blog_posts alter column cover_image drop not null;


-- >>> migrations/0005_rate_limits.sql
-- =====================================================================
-- Migration 0005: IP / quota rate limiting (/api/chat, /api/contact)
--
-- One atomic upsert per check via rl_hit(). RLS ON, no policies; only the
-- server's service-role client can read/write counters or call the function.
-- =====================================================================

create table if not exists public.rate_limit_counters (
  key         text primary key,
  count       integer not null default 0,
  expires_at  timestamptz not null,
  updated_at  timestamptz not null default now()
);

create index if not exists rate_limit_counters_expires_idx
  on public.rate_limit_counters (expires_at);

alter table public.rate_limit_counters enable row level security;

-- Atomic fixed-window counter. A fresh window (count -> 1) starts once the
-- previous one expired. Returns whether THIS hit is allowed, how many remain,
-- and when the window resets.
create or replace function public.rl_hit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql
set search_path = ''
as $$
declare
  v_count   integer;
  v_expires timestamptz;
begin
  insert into public.rate_limit_counters as r (key, count, expires_at, updated_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds), now())
  on conflict (key) do update
    set count = case when r.expires_at <= now() then 1 else r.count + 1 end,
        expires_at = case when r.expires_at <= now()
                          then now() + make_interval(secs => p_window_seconds)
                          else r.expires_at end,
        updated_at = now()
  returning r.count, r.expires_at into v_count, v_expires;

  -- Opportunistic cleanup (~1% of calls) so expired buckets don't accumulate.
  if random() < 0.01 then
    delete from public.rate_limit_counters
    where expires_at < now() - interval '1 hour';
  end if;

  return query
    select (v_count <= p_limit),
           greatest(p_limit - v_count, 0),
           v_expires;
end;
$$;

revoke all on function public.rl_hit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.rl_hit(text, integer, integer) to service_role;


-- >>> migrations/0006_chat_cache.sql
-- =====================================================================
-- Migration 0006: chatbot response cache
--
-- Skips BOTH the Gemini embedding + generation calls when the SAME question
-- (normalized) is asked again — e.g. the widget's preset chips. Keyed on a
-- sha256 of the normalized question. Invalidated wholesale whenever the RAG
-- store changes (see lib/rag/ingest.ts + db.ts). RLS on, no policies.
-- =====================================================================

create table if not exists chat_cache (
    q_hash      text        primary key,  -- sha256 of normalized question
    question    text        not null,     -- the normalized question (for debugging)
    reply       text        not null,
    sources     jsonb       not null default '[]'::jsonb,
    hits        integer     not null default 0,
    created_at  timestamptz not null default now(),
    expires_at  timestamptz not null
);

create index if not exists chat_cache_expires_idx on chat_cache (expires_at);
create index if not exists chat_cache_hits_idx on chat_cache (hits desc);

alter table chat_cache enable row level security;
-- No policies → anon/authenticated get zero access; service_role bypasses RLS.

-- Atomic hit-counter bump (best-effort; called on a cache hit).
create or replace function public.chat_cache_bump(p_hash text)
returns void
language sql
set search_path = ''
as $$
  update public.chat_cache set hits = hits + 1 where q_hash = p_hash;
$$;

revoke all on function public.chat_cache_bump(text)
  from public, anon, authenticated;
grant execute on function public.chat_cache_bump(text) to service_role;


-- >>> migrations/0007_admin_users.sql
-- =====================================================================
-- Migration 0007: admin_users — multi-user login for the admin panel
--
-- The voltairtech-admin app authenticates against this table. Per the owner's
-- preference (matching kauntech-admin), passwords are stored as PLAIN TEXT in
-- the `password` column — add a row with a username + password (here or via the
-- Users page) and that's the login. RLS ON, NO policies: only the service-role
-- key (used by the admin server) can read/write; the anon key gets zero access.
--
-- NOTE: plaintext means anyone with DB access can read these passwords.
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists admin_users (
    id            uuid        primary key default gen_random_uuid(),
    username      text        not null unique,
    password      text        not null,        -- plaintext (intentional, per owner)
    is_active     boolean     not null default true,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

-- case-insensitive uniqueness on username (so "Admin" == "admin")
create unique index if not exists admin_users_username_lower_idx
    on admin_users (lower(username));

drop trigger if exists trg_admin_users_updated_at on admin_users;
create trigger trg_admin_users_updated_at
    before update on admin_users
    for each row execute function set_updated_at();

alter table admin_users enable row level security;

-- Seed the first admin. CHANGE this password (or add your own user + delete
-- this one) from the panel's Users page after first login.
insert into admin_users (username, password)
values ('admin', 'vt-7bd360025301')
on conflict (username) do nothing;


-- >>> migrations/0009_services.sql
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


-- >>> migrations/0010_service_headline.sql
-- =====================================================================
-- Migration 0010: optional service detail-page headline
--
-- The card + breadcrumb use the short `title`; the detail page can show a
-- punchier `headline` as its H1. Nullable — falls back to `title` when unset.
-- =====================================================================

alter table services add column if not exists headline text;


-- >>> migrations/0011_service_cover_image.sql
-- Services can carry a cover image (same shape as blog_posts.cover_image:
-- { "url": "...", "alt": "..." }). Rendered on the /services grid + detail page.
alter table public.services add column if not exists cover_image jsonb;


-- >>> migrations/0012_industries.sql
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


-- >>> migrations/0013_industry_case_studies.sql
-- =====================================================================
-- Migration 0013: per-industry case studies
--
-- Adds a `case_studies` JSONB array to `industries`. Each entry captures one
-- real (or anonymised) engagement for the sector: the challenge, HOW we applied
-- AI (the insight), the outcome, the TECH STACK used, headline metrics, and an
-- optional deep-link. Rendered as a "Case studies" section on
-- /industries/<slug>, edited in voltairtech-admin, and folded into the RAG
-- embedding (doc_type "industry") so the chatbot can answer
-- "how have you used AI in <sector>?" / "what stack do you use for <sector>?".
--
-- Shape of each element (all optional except title):
--   {
--     "title":      "WhatsApp triage bot for a 12-clinic chain",
--     "client":     "Anonymised · multi-clinic group",
--     "challenge":  "Front desk drowning in repetitive booking calls.",
--     "approach":   "RAG over their protocols + WhatsApp flow that books slots.",
--     "outcome":    "Deflected most first-line queries; staff focus on care.",
--     "tech_stack": ["WhatsApp Cloud API", "Supabase pgvector", "Gemini"],
--     "metrics":    [{ "label": "calls deflected", "value": "60%" }],
--     "link":       "https://voltairtech.com/work"
--   }
-- =====================================================================

alter table industries
    add column if not exists case_studies jsonb not null default '[]'::jsonb;


-- >>> migrations/0014_industry_custom_services.sql
-- =====================================================================
-- Migration 0014: per-industry custom (inline) services
--
-- /industries/<slug> already renders a curated subset of the catalogue via
-- `service_slugs` (a sector lens over /services). But some sectors need an
-- offering that isn't a standalone catalogue service — a bespoke, sector-only
-- package. This adds a `custom_services` JSONB array so the admin can define
-- those inline, per industry, without polluting the global /services catalogue.
--
-- They render in the SAME "Services for <sector>" grid as the linked services
-- (appended after them), are folded into the RAG embedding (doc_type
-- "industry") so the chatbot can cite them, and are edited in voltairtech-admin.
--
-- Shape of each element (all optional except title):
--   {
--     "title":   "Clinic intake automation",
--     "summary": "A one-line teaser shown on the card.",
--     "bullets": ["Insurance pre-check", "EMR sync", "No-show win-back"],
--     "eta":     "2–3 weeks",
--     "icon":    "auto",                 -- ServiceGlyph key (web/auto/chat/…)
--     "link":    "/contact"              -- optional CTA (internal path or URL)
--   }
-- =====================================================================

alter table industries
    add column if not exists custom_services jsonb not null default '[]'::jsonb;


-- >>> migrations/0015_blog_faq.sql
-- =====================================================================
-- Migration 0015: per-post FAQ
--
-- Adds a `faq` JSONB array to `blog_posts`. Each entry is a question/answer
-- pair authored alongside the article. Rendered as an accordion + FAQPage
-- JSON-LD on /blog/<slug> (answer-engine / GEO friendly), edited in
-- voltairtech-admin's PostEditor, and folded into the post's RAG embedding
-- (doc_type "blog") so the chatbot can answer the same questions directly.
--
-- Shape of each element (both fields required to survive normalisation):
--   { "q": "How long does a RAG build take?",
--     "a": "Most ship in 48 hours once we have your data sources." }
-- =====================================================================

alter table blog_posts
    add column if not exists faq jsonb not null default '[]'::jsonb;


-- >>> migrations/0016_industry_homepage_featured.sql
-- =====================================================================
-- Migration 0016: homepage-featured flag for industries
--
-- The homepage "Proof · shipped work" section surfaces one case study per
-- featured sector. The selection + order were previously HARDCODED in
-- lib/industries/db.ts (getFeaturedCaseStudies pinned three slugs and even
-- inlined a fallback case study). This column makes it admin-controlled: tick
-- "Feature on homepage" in voltairtech-admin's IndustryEditor and the sector's
-- first case study appears on the homepage, ordered by `position` (asc).
--
-- A featured industry only renders if it has at least one case study; the
-- homepage card image is the industry's `cover_image` (falls back to the bundled
-- /public/images/cases/<slug>.png illustration when no cover is uploaded).
-- =====================================================================

alter table industries
    add column if not exists homepage_featured boolean not null default false;

-- Fast lookup for the homepage query (published + featured, ordered by position).
create index if not exists industries_homepage_featured_idx
    on industries (position asc) where status = 'published' and homepage_featured;


-- >>> migrations/0017_industry_icon_image.sql
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


-- >>> migrations/0018_contact_status_changed_at.sql
-- =====================================================================
-- Migration 0018: track when an inquiry's status last changed.
--
-- The admin panel auto-deletes spam 30 days after it is marked spam (cron:
-- admin /api/cron/purge-spam). `created_at` can't drive that — a submission
-- from six months ago that you flag today would be purged on the next run.
-- This column starts the retention clock at the moment of the flag.
--
-- One statement on purpose. The earlier shape — add nullable, backfill, then
-- SET NOT NULL — races the live contact form: an INSERT landing between the
-- backfill and SET NOT NULL writes a NULL (no default yet) and aborts the
-- migration. Folding the default into ADD COLUMN holds one ACCESS EXCLUSIVE
-- lock for the whole change, so no row can slip through nullable. Postgres 11+
-- evaluates now() once and stores it as the missing value, so existing rows are
-- filled without a table rewrite.
--
-- Every existing row therefore starts its clock at migration time. For spam
-- that is exactly what we want — a fresh 30 days, never an immediate mass
-- delete. For new/handled rows the value is unread (the purge only ever looks
-- at spam) and is corrected the moment their status actually changes.
-- =====================================================================

alter table contact_submissions
    add column if not exists status_changed_at timestamptz not null default now();

-- Partial index: the purge only ever scans spam rows by their retention clock.
create index if not exists contact_submissions_spam_purge_idx
    on contact_submissions (status_changed_at)
 where status = 'spam';



-- >>> migrations/0019_leads.sql
-- =====================================================================
-- Migration 0019: Lead Generation module (admin panel /leads)
--
-- Outbound prospecting: the admin discovers companies that fit Voltair's
-- services (AI web search), enriches them from their public website, scores
-- fit against the RAG knowledge base, and runs personalised cold-email
-- outreach. All reads/writes come from the admin's service-role key; RLS is
-- ON with no policies so the anon/public key gets zero access (same model
-- as contact_submissions / admin_users).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ── Prospect companies ────────────────────────────────────────────────
create table if not exists leads (
    id                uuid        primary key default gen_random_uuid(),
    company           text        not null,
    -- bare hostname ("acme.com") — the dedupe key for discovery/CSV imports
    domain            text,
    website           text,
    industry          text,
    location          text,
    size_hint         text,                    -- e.g. "11-50", "startup", "enterprise"
    summary           text,                    -- what the company does (AI-enriched)
    contact_name      text,
    contact_role      text,
    emails            text[]      not null default '{}',
    phone             text,
    linkedin          text,
    -- manual | discovery | csv | inquiry
    source            text        not null default 'manual',
    -- new | enriched | qualified | contacted | replied | won | lost | unfit
    status            text        not null default 'new',
    score             int,                     -- 0–100 fit vs our services
    fit_reason        text,                    -- why they're a fit (AI-scored)
    pitch_service     text,                    -- our service slug/title to lead with
    hooks             jsonb       not null default '[]'::jsonb,  -- personalisation hooks (string[])
    tags              text[]      not null default '{}',
    notes             text,
    enriched_at       timestamptz,
    last_contacted_at timestamptz,
    metadata          jsonb       not null default '{}'::jsonb,
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now()
);

-- One row per company domain — the app normalises domains to bare lowercase
-- hostnames before writing, and PostgREST upserts target this index via
-- `on_conflict=domain` (so it must be a plain column index, not an expression).
-- NULL domains don't collide (Postgres treats NULLs as distinct).
create unique index if not exists leads_domain_idx
    on leads (domain);
create index if not exists leads_status_idx  on leads (status);
create index if not exists leads_score_idx   on leads (score desc nulls last);
create index if not exists leads_created_idx on leads (created_at desc);

drop trigger if exists trg_leads_updated_at on leads;
create trigger trg_leads_updated_at
    before update on leads
    for each row execute function set_updated_at();

alter table leads enable row level security;

-- ── Per-lead timeline (notes, status flips, enrichment, emails, replies) ──
create table if not exists lead_activities (
    id          bigint      generated always as identity primary key,
    lead_id     uuid        not null references leads (id) on delete cascade,
    -- note | status | enriched | scored | email_drafted | email_sent | reply | import
    kind        text        not null,
    title       text        not null,
    body        text,
    meta        jsonb       not null default '{}'::jsonb,
    created_at  timestamptz not null default now()
);

create index if not exists lead_activities_lead_idx
    on lead_activities (lead_id, created_at desc);

alter table lead_activities enable row level security;

-- ── Outreach campaigns (sequence template + guardrails) ───────────────
create table if not exists lead_campaigns (
    id               uuid        primary key default gen_random_uuid(),
    name             text        not null,
    description      text,
    service_slug     text,                    -- which of our services this pitches
    -- active | paused | archived
    status           text        not null default 'active',
    daily_cap        int         not null default 20,
    followup_days    int[]       not null default '{3,7}',
    template_subject text,
    template_body    text,                    -- merge fields: {{company}} {{contact_name}} {{hook}} {{service}}
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

drop trigger if exists trg_lead_campaigns_updated_at on lead_campaigns;
create trigger trg_lead_campaigns_updated_at
    before update on lead_campaigns
    for each row execute function set_updated_at();

alter table lead_campaigns enable row level security;

-- ── Individual outreach emails (drafts → sends, incl. follow-ups) ─────
create table if not exists lead_emails (
    id           uuid        primary key default gen_random_uuid(),
    lead_id      uuid        not null references leads (id) on delete cascade,
    campaign_id  uuid        references lead_campaigns (id) on delete set null,
    to_email     text        not null,
    subject      text        not null,
    body         text        not null,       -- plain text (deliverability)
    -- draft | queued | sent | failed
    status       text        not null default 'draft',
    step         int         not null default 0,   -- 0 = opener, 1+ = follow-up #
    scheduled_at timestamptz,
    sent_at      timestamptz,
    error        text,
    meta         jsonb       not null default '{}'::jsonb,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

create index if not exists lead_emails_lead_idx     on lead_emails (lead_id, created_at desc);
create index if not exists lead_emails_campaign_idx on lead_emails (campaign_id);
-- Sent-today counting for the daily cap + the follow-up queue scan.
create index if not exists lead_emails_sent_idx     on lead_emails (status, sent_at desc);
create index if not exists lead_emails_sched_idx    on lead_emails (status, scheduled_at);

drop trigger if exists trg_lead_emails_updated_at on lead_emails;
create trigger trg_lead_emails_updated_at
    before update on lead_emails
    for each row execute function set_updated_at();

alter table lead_emails enable row level security;

-- ── Discovery run log (the AI prospecting console's history) ──────────
create table if not exists lead_searches (
    id          bigint      generated always as identity primary key,
    query       text        not null,        -- the ICP brief the admin typed
    found       int         not null default 0,
    imported    int         not null default 0,
    meta        jsonb       not null default '{}'::jsonb,   -- model params, sources
    created_at  timestamptz not null default now()
);

create index if not exists lead_searches_created_idx on lead_searches (created_at desc);

alter table lead_searches enable row level security;
