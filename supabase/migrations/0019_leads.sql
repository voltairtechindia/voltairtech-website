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
