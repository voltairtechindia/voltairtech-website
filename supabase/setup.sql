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

