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
