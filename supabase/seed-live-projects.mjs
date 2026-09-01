/**
 * Seed the /live-projects portfolio into Supabase — media first, then rows.
 *
 * Two steps, because a project row is mostly a pointer to two files:
 *   1. Upload each project's brochure cover (WebP) and brochure (PDF) from
 *      /public into the public `project-media` Storage bucket, so the admin
 *      can replace them later without a deploy. Uploads are content-hashed and
 *      idempotent — re-running does not duplicate bytes.
 *   2. POST the rows to the admin-gated /api/live-projects, which normalises
 *      them, writes `live_projects`, and embeds each published one into the
 *      RAG store (doc_type "live_project") so the chatbot can cite it.
 *
 * The copy itself comes from lib/live-projects/fallback.ts — the same literal
 * the page falls back to — so there is exactly one place the seed text lives.
 *
 * Usage (env loaded from .env.local):
 *   node supabase/seed-live-projects.mjs                 # -> http://localhost:3000
 *   SITE=https://www.voltairtech.com node supabase/seed-live-projects.mjs
 *
 * Flags:
 *   --skip-upload   reuse whatever URLs are already in the bucket
 *   --dry-run       print what would be sent, write nothing
 */

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const PUBLIC = path.join(ROOT, "public");

const SITE = process.env.SITE || process.env.VOLTAIR_API_URL || "http://localhost:3000";
const KEY = process.env.ADMIN_API_KEY || process.env.VOLTAIR_ADMIN_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const SKIP_UPLOAD = process.argv.includes("--skip-upload");
const DRY_RUN = process.argv.includes("--dry-run");

const BUCKET = "project-media";
const MIME = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
};

if (!KEY) {
  console.error("Set ADMIN_API_KEY (the site's admin key) in the environment.");
  process.exit(1);
}
if (!SKIP_UPLOAD && !DRY_RUN && !(SUPABASE_URL && SUPABASE_SERVICE_KEY)) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_KEY, or pass --skip-upload.");
  process.exit(1);
}

/**
 * Read the seed literal out of the TS module without a build step: the file is
 * data, not logic, so the array between the two markers parses as JSON5-ish TS.
 * Importing it would need a transpiler; a regex would be brittle. Instead we
 * shell out to Node's own parser via a dynamic import of a stripped copy.
 */
async function loadSeed() {
  const src = await readFile(path.join(ROOT, "lib/live-projects/fallback.ts"), "utf8");
  const start = src.indexOf("export const SEED: SeedProject[] = [");
  if (start === -1) throw new Error("Could not find SEED in lib/live-projects/fallback.ts");
  const open = src.indexOf("[", start);
  const end = src.indexOf("\n];", open);
  if (end === -1) throw new Error("Could not find the end of SEED");
  const literal = src.slice(open, end + 2);
  // The literal is plain TS object syntax with no expressions — evaluating it
  // as a JS array is safe here (our own file, read at build/seed time only).
  return Function(`"use strict"; return (${literal});`)();
}

const sb =
  !SKIP_UPLOAD && !DRY_RUN
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

/**
 * Upload a file from /public into the bucket and return its public URL.
 *
 * The object path carries a short content hash, so re-running the seed after
 * editing an asset uploads a NEW object (and a fresh URL) rather than serving
 * a stale CDN copy — and re-running with the file unchanged is a no-op.
 */
async function push(publicPath) {
  const abs = path.join(PUBLIC, publicPath.replace(/^\//, ""));
  const bytes = await readFile(abs);
  const ext = path.extname(abs).toLowerCase();
  const contentType = MIME[ext];
  if (!contentType) throw new Error(`No MIME type mapped for ${ext}`);

  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 10);
  const base = path.basename(abs, ext);
  const kind = contentType === "application/pdf" ? "brochures" : "covers";
  const key = `${kind}/${base}-${hash}${ext}`;

  const { error } = await sb.storage
    .from(BUCKET)
    .upload(key, bytes, { contentType, upsert: true, cacheControl: "31536000" });
  if (error) throw new Error(`upload ${key}: ${error.message}`);

  const { data } = sb.storage.from(BUCKET).getPublicUrl(key);
  return { url: data.publicUrl, bytes: bytes.length };
}

async function main() {
  const seed = await loadSeed();
  console.log(`Seeding ${seed.length} live projects → ${SITE}\n`);

  const rows = [];
  for (const [i, p] of seed.entries()) {
    let coverUrl = p.cover;
    let brochureUrl = p.brochure;
    let brochureBytes;

    if (!SKIP_UPLOAD && !DRY_RUN) {
      const cover = await push(p.cover);
      const doc = await push(p.brochure);
      coverUrl = cover.url;
      brochureUrl = doc.url;
      brochureBytes = doc.bytes;
      console.log(`  ↑ ${p.slug}: cover + brochure uploaded`);
    }

    rows.push({
      slug: p.slug,
      name: p.name,
      kicker: p.kicker,
      tagline: p.tagline,
      summary: p.summary,
      lifecycle: p.lifecycle,
      surfaces: p.surfaces,
      stack: p.stack,
      highlights: p.highlights,
      stats: p.stats,
      links: p.links ?? [],
      media: [],
      cover_image: { url: coverUrl, alt: p.coverAlt },
      brochure: {
        url: brochureUrl,
        label: `${p.name} brochure`,
        ...(brochureBytes ? { size_bytes: brochureBytes } : {}),
      },
      position: i + 1,
      status: "published",
    });
  }

  if (DRY_RUN) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  const res = await fetch(`${SITE}/api/live-projects`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-key": KEY },
    body: JSON.stringify({ projects: rows }),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`\nPOST failed (${res.status}): ${body}`);
    process.exit(1);
  }
  const json = JSON.parse(body);
  console.log(`\n✓ ${json.count} projects saved and embedded.`);
  for (const p of json.projects) console.log(`  ${p.status.padEnd(9)} ${p.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
