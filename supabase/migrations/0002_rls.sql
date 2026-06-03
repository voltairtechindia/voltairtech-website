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
