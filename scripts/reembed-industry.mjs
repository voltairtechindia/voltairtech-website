/**
 * Re-embed a single industry into the RAG store by re-POSTing its current DB row
 * through the admin-gated /api/industries endpoint (which re-runs syncRag). Use
 * after editing an industry's case studies / copy directly in the DB so the
 * chatbot can cite the new content. Sends the FULL row, so nothing is nulled.
 *
 * Reads SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_API_KEY from .env.local / env.
 * Usage:
 *   node scripts/reembed-industry.mjs <slug>                 # -> https://voltairtech.com
 *   SITE=http://localhost:3000 node scripts/reembed-industry.mjs <slug>
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function loadEnvLocal() {
  const file = path.join(ROOT, ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnvLocal();

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/reembed-industry.mjs <slug>");
  process.exit(1);
}

const URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_KEY = process.env.ADMIN_API_KEY;
const SITE = process.env.SITE || "https://voltairtech.com";
if (!URL || !SERVICE_KEY || !ADMIN_KEY) {
  console.error("Need SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_API_KEY.");
  process.exit(1);
}

// Read the full current row via PostgREST.
const getRes = await fetch(
  `${URL.replace(/\/$/, "")}/rest/v1/industries?slug=eq.${encodeURIComponent(slug)}&select=*`,
  { headers: { apikey: SERVICE_KEY, authorization: `Bearer ${SERVICE_KEY}` } },
);
const rows = await getRes.json();
if (!getRes.ok || !Array.isArray(rows) || !rows.length) {
  console.error(`Could not read industry "${slug}":`, JSON.stringify(rows).slice(0, 300));
  process.exit(1);
}
const r = rows[0];

// Re-POST the full editable payload (the API re-embeds published rows).
const payload = {
  slug: r.slug,
  title: r.title,
  headline: r.headline,
  summary: r.summary,
  bullets: r.bullets,
  icon: r.icon,
  cover_image: r.cover_image,
  icon_image: r.icon_image,
  homepage_featured: r.homepage_featured,
  lead: r.lead,
  meta: r.meta,
  body_md: r.body_md,
  tags: r.tags,
  service_slugs: r.service_slugs,
  custom_services: r.custom_services,
  case_studies: r.case_studies,
  seo: r.seo,
  position: r.position,
  status: r.status,
  published_at: r.published_at,
};

const res = await fetch(`${SITE}/api/industries`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-admin-key": ADMIN_KEY },
  body: JSON.stringify(payload),
});
const out = await res.text();
console.log(`POST ${SITE}/api/industries (${slug}) -> ${res.status}`);
console.log(out.slice(0, 500));
process.exit(res.ok ? 0 : 1);
