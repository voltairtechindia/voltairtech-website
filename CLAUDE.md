# Voltairtech Website — CLAUDE.md

## Project overview
Marketing website for **Voltair Tech** (voltairtech.com) — Mumbai's AI build studio. Tagline: "Ship AI in 48 hours."

Originally a static Babel/JSX single-page site; fully migrated to **Next.js 14 App Router with TypeScript**.

## Stack
- **Next.js** 14.2.29 (App Router). Marketing pages are static (`○`); the blog is
  ISR (`revalidate=300`) and `/api/*` are dynamic — so the site now needs the
  **Vercel server deployment**, not a static-export / GitHub-Pages build.
- **React** 18, **TypeScript** 5
- **next/font** — Inter Tight + JetBrains Mono (no Google Fonts CDN)
- No UI library, no Tailwind — custom CSS only
- **Supabase** (pgvector) + **Gemini** (`@google/genai`) power the RAG chatbot,
  blog store, and inquiry capture. `react-markdown` + `remark-gfm` render posts.

## Key files
| Path | Purpose |
|---|---|
| `app/layout.tsx` | Root layout — fonts, global metadata, viewport |
| `app/page.tsx` | Home page with JSON-LD (Organization, LocalBusiness, FAQPage) |
| `app/privacy/page.tsx` | Privacy policy |
| `app/terms/page.tsx` | Terms of service |
| `app/contact/page.tsx` | Contact page |
| `app/services/page.tsx` | Services detail page |
| `app/industries/page.tsx` | DB-backed industries index (sector lens over services) |
| `app/industries/[slug]/page.tsx` | Industry detail (ISR) — "what you get" + linked services |
| `app/work/page.tsx` | Case studies / portfolio page |
| `app/rag/page.tsx` | RAG showcase page |
| `app/faq/page.tsx` | FAQ page |
| `app/timeline/page.tsx` | Timeline/process page |
| `app/sitemap.ts` | Auto-generated XML sitemap |
| `app/robots.ts` | Auto-generated robots.txt |
| `app/not-found.tsx` | Custom 404 |
| `lib/content.ts` | All site copy as typed TS exports (was `window.VT_CONTENT`) |
| `styles/globals.css` | All styles — CSS variables at top of `:root` block |
| `components/` | Section components; client components: Monogram, RagShowcase, BigInput, Faq |
| `next.config.mjs` | Redirects: /privacy.html → /privacy, /terms.html → /terms |
| `public/` | Static assets (logos, app-ads.txt) |

## Development
```bash
npm run dev      # localhost:3000 (or next available port)
npm run build    # production build (fully static, all ○ routes)
npm run lint     # ESLint
```

## Content edits
- **Copy / text changes** → edit `lib/content.ts`
- **Style / colour changes** → edit `styles/globals.css` (CSS variables in `:root`)
- **New pages** → create `app/<route>/page.tsx`, add to `app/sitemap.ts`

## SEO
- JSON-LD structured data lives in `app/page.tsx`
- Canonical domain: `voltairtech.com`
- `CNAME` file present for GitHub Pages compatibility
- `app-ads.txt` in `public/` for Google AdMob
- `/llms.txt` is a **dynamic route** (`app/llms.txt/route.ts`, hourly ISR) — a
  DB-backed llmstxt.org manifest for GEO/AEO that lists published services,
  industries, and blog posts (replaced the old static `public/llms.txt`).

## Deployment
- **Primary:** Vercel (zero-config, auto-deploys on push to `master`)
- **Fallback:** GitHub Pages (static export)
- `vercel.json` and `netlify.toml` both present

## RAG chatbot + Blog + Inquiries (Supabase + Gemini)
Ported from the kauntech site; re-themed for Voltair. New Supabase project
`asipqnvxmtzllivlyibh` (separate from kauntech). Setup: `RAG_SETUP.md`.
- **Chatbot:** `components/ChatWidget.tsx` (site-wide, mounted in `app/layout.tsx`)
  → `POST /api/chat` → embed (Gemini) → `match_documents` pgvector → grounded reply
  → transcript log + background analytics via `lib/after.ts` (`waitUntil`, since
  Next 14.2 has no `after()`). Engine in `lib/rag/*`; response cache in
  `lib/rag/cache.ts` (`chat_cache` table) short-circuits repeat questions.
- **Knowledge base:** `lib/rag/data/knowledge-base.ts` — edit then re-seed via
  `POST /api/ingest {"seed":true}` with `X-Admin-Key: $ADMIN_API_KEY`.
- **Blog (DB-backed):** `app/blog/page.tsx` (index) + `app/blog/[slug]/page.tsx`
  (ISR). Engine `lib/blog/*`; render `components/{Markdown,BlogMedia}.tsx`. Posts
  are written via admin-gated `POST /api/blog` (upserts `blog_posts` AND embeds
  published posts as `doc_type:"blog"` so the bot can cite them). The 3 original
  hardcoded posts were migrated to the DB (`supabase/seed-blog.mjs`). Each post
  also carries a `faq` JSONB array (migration `0015`) — Q&A pairs that render as a
  "Frequently asked questions" accordion + **FAQPage JSON-LD** on `/blog/<slug>`
  (AEO/GEO), are edited in the admin's `PostEditor`, can be drafted by the copilot
  (`faq` in the `blog-draft` fence), and are folded into the post's RAG embedding
  so the bot can answer the same questions.
- **Services (DB-backed):** `app/services/page.tsx` (paginated index, `?page=`) +
  `app/services/[slug]/page.tsx` (ISR detail). Engine `lib/services/*`; written via
  admin-gated `POST /api/services` (upserts `services` AND embeds published rows as
  `doc_type:"service"` for the bot). Icons: `lib/services/icons.ts` is a curated
  registry keyed by name + `pickServiceIcon()` auto-detect; `components/atoms/ServiceGlyph.tsx`
  renders by key with a `default` fallback. The 6 original hardcoded services were
  migrated to the DB (`supabase/seed-services.mjs`). `lib/content.ts` `services` is now
  legacy/unused. Service docs are NOT in `knowledge-base.ts` — they sync from the DB.
- **Industries (DB-backed):** `app/industries/page.tsx` (index) +
  `app/industries/[slug]/page.tsx` (ISR detail). Engine `lib/industries/*`; glyphs
  `components/atoms/IndustryGlyph.tsx` (sector SVGs) + `lib/industries/icons.ts`.
  An industry is a **sector lens over services**: it links a curated, ordered subset
  via `service_slugs` (array of service slugs) and renders that subset on its detail
  page (shared `components/ServiceCardGrid.tsx`). `/services` still lists everything.
  Written via admin-gated `POST /api/industries` (upserts `industries` AND embeds
  published rows as `doc_type:"industry"` for the bot, enriched with the linked
  service names). Migrated from the old hardcoded array via `supabase/seed-industries.mjs`.
  Each industry also carries a `case_studies` JSONB array (migration `0013`) —
  per-sector proof entries: `{ title, client?, challenge?, approach?, outcome?,
  tech_stack[], metrics[{label,value}], link? }`. They render as a "How we've used
  AI in <sector>" section on the detail page, are folded into the industry's RAG
  embedding (so the bot can answer "how have you used AI in X?" / "what stack for X?"),
  and are edited in the admin's `IndustryEditor` (card list → hidden `case_studies_json`).
  The admin AI copilot can draft them too (`case_studies` in the `industry-draft` fence).
- **Inquiries:** `components/BigInput.tsx` → `POST /api/contact` → `contact_submissions`.
- **Rate limiting:** `lib/rate-limit.ts` + `rl_hit` RPC (chat burst/daily/global,
  contact burst/daily). **Admin auth:** `lib/admin-auth.ts` (`X-Admin-Key`).
- **Schema:** `supabase/migrations/*` (+ combined `supabase/setup.sql`).
- **Env (server-only, in `.env.local` / Vercel):** `SUPABASE_URL`,
  `SUPABASE_SERVICE_KEY`, `GOOGLE_API_KEY`, `ADMIN_API_KEY`. See `.env.local.example`.
- **Model rule:** the Gemini key is new-generation — use `gemini-2.5-flash`
  (thinking disabled) + `gemini-embedding-001` @ 768 dims. Don't revert to
  `gemini-2.0-flash` / `text-embedding-004` (404 on new keys).
- **Admin panel:** separate app `../voltairtech-admin` (Next 15) — manages posts,
  services + industries, reads inquiries; writes proxy to this site's `/api/blog`,
  `/api/services`, `/api/industries` + `/api/revalidate`. Its AI copilot
  (`lib/admin-ai.ts`) can draft blog/service/industry artifacts for the editors.
- **Security headers:** `next.config.mjs` `headers()` sets CSP/HSTS/etc. CSP allows
  the Supabase origin (blog media) + YouTube/Vimeo embeds.

## Conventions
- No comments unless the WHY is non-obvious
- TypeScript strict mode — no `any`
- All new components go in `components/`; client components get `"use client"` at top
- CSS: use existing variables from `globals.css` `:root`, don't add inline styles
