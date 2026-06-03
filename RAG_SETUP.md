# Voltair Tech — RAG chatbot + blog + inquiries setup

The site now ships a real RAG assistant (grounded in Voltair facts), a DB-backed
blog, and contact-form inquiry capture — all built into this Next.js app. A
separate **voltairtech-admin** app manages posts and reads inquiries.

```
ChatWidget ─POST /api/chat─▶ embed query (Gemini) ─▶ match_documents (pgvector)
                            ─▶ Gemini grounded reply ─▶ log + unstable_after() analytics
                            (chat_cache short-circuits repeat questions, no Gemini call)

BigInput   ─POST /api/contact─▶ contact_submissions   (read in admin → Inquiries)
admin      ─POST /api/blog────▶ blog_posts + RAG embed (doc_type:"blog")
```

## 1. Supabase (the NEW Voltair project)
Create a brand-new Supabase project (do NOT reuse Kauntech's). In the **SQL
editor**, run **`supabase/setup.sql`** (all migrations in order). It creates:
pgvector + `documents` + `match_documents`, conversation logging,
`contact_submissions`, `blog_posts` + the public `blog-media` bucket,
`rate_limit_counters` + `rl_hit`, `chat_cache` + `chat_cache_bump`, and
`admin_users` (seeded `admin` / the bootstrap password — change it after login).

Grab `Project Settings → API`: the **Project URL** and the **service_role / secret key**.

## 2. Environment variables
Copy `.env.local.example` → `.env.local` (and set the same on Vercel):

| Var | Where to get it |
| --- | --- |
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | Supabase → Project Settings → API → service_role / secret key |
| `GOOGLE_API_KEY` | https://aistudio.google.com/apikey (new Voltair key) |
| `ADMIN_API_KEY` | `openssl rand -hex 32` — must equal the admin's `VOLTAIR_ADMIN_KEY` |

## 3. Seed the knowledge base
With the app running (`npm run dev`, or after deploy):

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "X-Admin-Key: $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"seed": true}'
# -> { "ingested": N, "doc_types": { "service": 6, "faq": 10, ... } }
```

Check counts any time: `curl -H "X-Admin-Key: $ADMIN_API_KEY" http://localhost:3000/api/ingest`

## Editing what the bot knows
Edit `lib/rag/data/knowledge-base.ts`, then re-run the seed call (it upserts on
`doc_type + external_id`, so edits update in place). Tune the persona in
`lib/rag/prompts.ts`; retrieval depth/threshold via `RAG_TOP_K` / `RAG_MIN_SIMILARITY`.
Published blog posts are embedded automatically by `POST /api/blog`.

## Notes
- These features require the **Vercel (server) deployment** — the chatbot, blog,
  and contact APIs can't run on a static-export / GitHub-Pages fallback.
- `unstable_after()` (analytics) is enabled via `experimental.after` in
  `next.config.mjs` (Next 14.2). It becomes stable `after()` on Next 15.
