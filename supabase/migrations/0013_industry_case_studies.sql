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
