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
