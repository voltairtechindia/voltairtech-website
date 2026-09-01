# Voltairtech Website — CLAUDE.md

## Project overview
Marketing website for **Voltair Tech** (voltairtech.com) — Mumbai's AI build studio. Tagline: "Ship AI in 48 hours."

Originally a static Babel/JSX single-page site; fully migrated to **Next.js 14 App Router with TypeScript**.

## Copy voice (2026-09)
All visible copy is written for a business owner who has never heard of a vector
database. Three rules, applied to `lib/content.ts`, the components, **and** the
DB-backed rows in Supabase:
- **No `—` or `–`.** Commas, full stops, brackets, or "to" for ranges ("1 to 2
  weeks"). A matched *pair* of em dashes is a parenthetical and becomes brackets.
- **Less text.** Say it once.
- **No unexplained jargon.** Lead with what it does for the reader; keep the
  technical term once, labelled as such, so search still matches ("...answers
  from your own documents. The technical name for this is RAG.").
Exceptions, deliberate: `/career` (engineer audience), the `keywords` array and
`knowsAbout` JSON-LD (machine-readable), a case study's `tech_stack` chips and a
project's `stack`/`surfaces` (tool names are the point), and the blog (articles
should use the word the reader searched for).
`supabase/rewrite-copy.mjs` is the tool that applied this to the DB: it reads
every live row, replaces reader-facing fields, and re-posts the WHOLE row
through the admin API so nothing else is lost and the chatbot re-embeds from the
same text the page shows. Re-runnable; `--dry` to preview, `--only=` to scope
(`services|industries|projects|faqs`, plus opt-in `blog` for punctuation only).

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
| `app/contact/page.tsx` | Contact page — doubles as the Google Ads landing page |
| `app/thank-you/page.tsx` | Post-submit confirmation — `noindex`, fires the Ads lead conversion |
| `app/services/page.tsx` | DB-backed services index (paginated) |
| `app/industries/page.tsx` | DB-backed industries index (sector lens over services) |
| `app/industries/[slug]/page.tsx` | Industry detail (ISR) — "what you get" + linked services |
| `app/rag/page.tsx` | RAG showcase page |
| `app/live-projects/page.tsx` | DB-backed product showcase (ISR) — grid + detail dialog |
| `app/faq/page.tsx` | DB-backed FAQ page (ISR) — `site_faqs` + FAQPage JSON-LD |
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
- Canonical domain: `www.voltairtech.com` — Vercel serves www and 308s the apex to
  it, so every canonical/OG/sitemap URL must be www too. Build URLs from
  `SITE_URL` (`lib/seo.ts`), never a hardcoded origin.
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
  `POST /api/ingest {"seed":true}` with `X-Admin-Key: $ADMIN_API_KEY`. These core
  docs (company/pricing/process/faq/rag) do **NOT** auto-sync — unlike
  service/industry/blog docs — so editing the file without re-seeding silently
  leaves the bot on old facts. Guardrail: `npm run kb:check` reports drift between
  the file and the live store (exits non-zero — CI-friendly); `npm run kb:seed`
  re-seeds + flushes the chat cache (`scripts/check-kb-drift.mjs`).
- **Blog (DB-backed):** `app/blog/page.tsx` (index) + `app/blog/[slug]/page.tsx`
  (ISR). Engine `lib/blog/*`; render `components/{Markdown,BlogMedia}.tsx`. Posts
  are written via admin-gated `POST /api/blog` (upserts `blog_posts` AND embeds
  published posts as `doc_type:"blog"` so the bot can cite them). The 3 original
  hardcoded posts were migrated to the DB (`supabase/seed-blog.mjs`). Each post
  Scheduled posts (status `published`, future `published_at`) are embedded into
  the RAG store on save but **time-gated out of retrieval** until their publish
  time (`isNotYetPublished` in `lib/rag/retriever.ts`), so the bot won't cite an
  article visitors can't see yet. The chatbot is also capped to the **20 most
  recently published posts** (`RAG_BLOG_LIMIT`, `isStaleBlog` +
  `getRecentBlogSlugs`): older posts stay embedded — so raising the cap needs no
  re-seed — but are gated out of retrieval, and the pgvector over-fetch widens by
  the number of gated posts so they can't starve the context. Each post
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
- **Photos + video on services & industries (migration `0038`):** `services.media`
  and `industries.media` are `MediaItem[]`, the **same shape** as
  `blog_posts.media` and `live_projects.media`; sector sub-pages keep theirs
  inside `custom_services[].media` (JSONB, no migration). One normaliser
  (`lib/media.ts` `normalizeMedia`, mirrored admin-side by `lib/media-parse.ts`)
  guards every write path. **One player everywhere:**
  `components/MediaFrame.tsx` renders a photo / self-hosted clip / YouTube-Vimeo
  embed, and is used by `MediaGallery` (service + industry + sub-service pages),
  `ProjectShowcase` (/live-projects dialog) and `BlogMedia`. Video mounts only
  when the visitor selects that slide, so a page never boots several players on
  arrival. Admin: one shared `components/MediaFields.tsx` (upload, caption,
  reorder with ↑/↓ — array order IS display order) in the post, service,
  industry, sub-service and live-project editors.
- **Service / industry detail pages are NOT `ProsePage`:** that shell is for
  /privacy and /terms (one narrow column, no visuals) and made a page whose job
  is to sell a build read like a policy document. They now use
  `components/DetailShell.tsx` (full-bleed, alternating paper/ink bands) +
  `DetailHero` (breadcrumb, headline, lead, fact rail, picture beside the words)
  + `PointGrid` ("what you get") + `MediaGallery` + prose + FAQ + lead form.
  Markdown body typography is shared with the blog (`.blog-body,
  .detail-prose__inner` in `globals.css`) rather than duplicated.
- **Card order + page size:** the service, industry, and blog grids all run
  `DEFAULT_PER_PAGE = 8` — a full 4 x 2 on wide desktop (`.svc-grid` /
  `.post-list--grid` step 4 → 3 → 2 → 1 as the viewport narrows). Order is
  admin-controlled: services/industries sort by `position` (asc), the blog leads
  with `blog_posts.pin_position` (asc, nulls last — migration `0035`) then
  `published_at` desc. The admin's list pages carry an `OrderBoard` that POSTs a
  slug list to the admin-gated `POST /api/{services,industries,blog}/reorder` —
  column-only writes, so no RAG re-embedding for a pure reshuffle.
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
- **Thin-content indexing guard (`lib/industries/indexing.ts`):** each industry
  can spin up ~12 custom-service sub-pages (`/industries/<x>/<service>`), so 13
  sectors = 140+ auto-generated pages. Sub-pages with no real body prose are thin
  near-templates that hurt the whole domain's quality signal, so they're **robots
  `noindex, follow` by default** and **excluded from the sitemap** until they carry
  ≥`MIN_CUSTOM_SERVICE_BODY` (600) chars of unique body — or the admin force-indexes
  one via the per-sub-page "Show on Google" toggle (`IndustryCustomService.index`).
  An industry page itself is indexable unless the admin sets `seo.noindex` (hides it
  from Google + sitemap, keeps it live + in the chatbot). The page `robots` tag and
  the sitemap share the same helpers (`customServiceShouldIndex` / `industryShouldIndex`)
  so they can't disagree. No migration — `seo`/`custom_services` are JSONB. NB: the
  homepage `Organization` JSON-LD carries a DB-driven `hasOfferCatalog` of every
  published service (individual `Service` nodes whose `@id` matches each
  `/services/<slug>` page) so answer engines can cite each offering.
- **FAQ (DB-backed, everywhere):** one Q&A shape (`FaqItem` in `lib/faq/types.ts`,
  re-exported by the blog/service/industry type modules), one normaliser +
  FAQPage-JSON-LD builder (`lib/faq/normalize.ts`), one renderer
  (`components/FaqSection.tsx`). Two kinds:
  - **Per-page FAQ** — a `faq` JSONB array on the record itself, edited inside
    that record's admin editor and rendered as an accordion + **FAQPage JSON-LD**
    on its page, then folded into that record's RAG embedding. Lives on
    `blog_posts.faq` (0015), `services.faq` and `industries.faq` (0036), and
    inside `custom_services[].faq` (no migration — already JSONB) for the sector
    sub-pages. Sub-page FAQ prose also counts towards the thin-content indexing
    gate (`customServiceBodyLength`), since hand-written answers are unique copy.
  - **The `/faq` page** — its own table `site_faqs` (0036), because those
    questions belong to the business, not to one service. Rows carry
    `category` (optional group heading), `position` (admin-ordered),
    `homepage_featured` (also shows in the home page's FAQ block), tags, status.
    `app/faq/page.tsx` is ISR (`revalidate=300`) and **falls back to
    `CONTENT.faq`** if the table is empty/unreachable, so the page never renders
    blank; the home page does the same via `loadHomeFaq()`. Written via
    admin-gated `POST /api/faqs` (+ `/api/faqs/reorder`), embedded as doc_type
    **`site_faq`** — NOT `"faq"`, which is owned by `knowledge-base.ts` and
    which `npm run kb:check` treats as drift. The answers are also quoted
    verbatim in `/llms.txt`.
  **Seeding:** `npm run faq:seed` (`supabase/seed-faqs.mjs`) populates all three
  at once — the 10 `/faq` questions plus an authored Q&A set for every published
  service and industry. Services/industries are full-row upserts, so it reads
  each live row and re-posts it with only `faq` added; rows that already have a
  FAQ are skipped unless you pass `--force`. Needs migration `0036` applied.
  Admin: shared editor `components/FaqFields.tsx` (uncontrolled via a hidden
  JSON field, or controlled when nested in a bigger blob), used by the post,
  service, and industry editors; the `/faq` table gets its own admin section
  (`app/faq/*` + `components/SiteFaqEditor.tsx`) with an `OrderBoard`. The AI
  copilot drafts `faq` arrays in all three draft fences.
- **Live projects (DB-backed):** `app/live-projects/page.tsx` (ISR, `revalidate=300`)
  — the studio's own shipped-product portfolio. Engine `lib/live-projects/*`;
  UI `components/ProjectShowcase.tsx` (client). Deliberately **one glance, not a
  scroll**: a grid of cards (cover, kicker, name, tagline, headline figure,
  lifecycle LED), and a card opens a **detail dialog** with that project's media
  gallery, full summary, every figure, highlights, surfaces/stack and the
  brochure. Two earlier cuts — ten stacked editorial spreads (~15 screens) and a
  horizontal snap rail — were rejected for making the reader travel; don't
  reintroduce either.
  - `lifecycle` (`live` / `shipped` / `build`) is the status chip and is
    SEPARATE from `status` (draft/published/archived): one says where the
    product is, the other whether the card is on the site at all.
  - `media` is the **same `MediaItem` shape as `blog_posts.media`** (image /
    self-hosted video / YouTube-Vimeo embed), and both render through the one
    shared `lib/embed.ts` `toEmbedSrc`. Video only mounts inside an OPEN dialog,
    so the page never boots ten players on arrival.
  - Order is admin-controlled `position` (asc) — the admin's `OrderBoard` POSTs
    a slug list to `POST /api/live-projects/reorder` (column-only, no re-embed).
  - Written via admin-gated `POST /api/live-projects`, which upserts
    `live_projects` AND embeds published rows as `doc_type:"live_project"` so
    the chatbot can answer "what have you actually built?".
  - **Media lives in Supabase Storage** (`project-media`, public, 100 MB/file) —
    covers, demo clips and brochure PDFs, all replaceable from the admin.
    `blog-media` deliberately refuses `application/pdf`, hence the second bucket.
  - Falls back to `lib/live-projects/fallback.ts` (the seed literal + the copies
    under `public/assets/live-projects/` and `public/brochures/`) if Supabase is
    empty or unreachable, so the page never renders blank. **Seeding:**
    `npm run projects:seed` uploads the local media to the bucket, then POSTs
    the rows — a one-time bootstrap; after that the admin is the source of truth.
- **Inquiries / lead form:** one component, `components/LeadForm.tsx` → `POST /api/contact`
  → `contact_submissions`. `variant="page"` is the /contact hero (wrapped by
  `components/BigInput.tsx`); `variant="inline"` is the CTA at the foot of every
  service, industry, and sector sub-service page (it replaced the old `ProseCta`).
  The form is **context-prefilled from the DB**: the page passes the services it
  already loaded as picker options (`lib/lead-form.ts` — `LeadOption`/`LeadContext`),
  pre-ticks its own service, and `composeLeadMessage()` writes the opening line —
  which keeps following the picker until the visitor types. Ticked services +
  page context ride in the POST and land in `contact_submissions.metadata`
  (`services`, `service_refs`, `industry_title`, `service_title`, `source`); the
  admin reads them back via `readLeadContext()` (`lib/inquiries.ts`) for the
  Inquiries card and the notification email. `/contact?service=<slug>&industry=<slug>`
  prefills the same way (read from `location.search` after mount, so /contact
  stays prerendered).
- **Rate limiting:** `lib/rate-limit.ts` + `rl_hit` RPC (chat burst/daily/global,
  contact burst/daily). **Admin auth:** `lib/admin-auth.ts` (`X-Admin-Key`).
- **Schema:** `supabase/migrations/*` (+ combined `supabase/setup.sql`).
- **Env (server-only, in `.env.local` / Vercel):** `SUPABASE_URL`,
  `SUPABASE_SERVICE_KEY`, `GOOGLE_API_KEY`, `ADMIN_API_KEY`. See `.env.local.example`.
- **Model rule:** the Gemini key is new-generation — use `gemini-2.5-flash`
  (thinking disabled) + `gemini-embedding-001` @ 768 dims. Don't revert to
  `gemini-2.0-flash` / `text-embedding-004` (404 on new keys).
- **Admin panel:** separate app `../voltairtech-admin` (Next 15) — manages posts,
  services + industries + FAQ + live projects, reads inquiries; writes proxy to
  this site's `/api/blog`, `/api/services`, `/api/industries`, `/api/faqs`,
  `/api/live-projects` + `/api/revalidate`. Its AI copilot
  (`lib/admin-ai.ts`) can draft blog/service/industry artifacts for the editors.
- **Security headers:** `next.config.mjs` `headers()` sets CSP/HSTS/etc. CSP allows
  the Supabase origin (blog media) + YouTube/Vimeo embeds.

## Conventions
- No comments unless the WHY is non-obvious
- TypeScript strict mode — no `any`
- All new components go in `components/`; client components get `"use client"` at top
- CSS: use existing variables from `globals.css` `:root`, don't add inline styles
