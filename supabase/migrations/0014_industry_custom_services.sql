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
