/**
 * One-time: push the dev's bundled industry images (sector badge icons +
 * homepage/case-study illustrations) into the public `blog-media` Supabase
 * Storage bucket, so they're managed like every other admin upload and the
 * admin can replace/add more. Idempotent (upsert: true).
 *
 *   public/images/industries/<key>.png  ->  blog-media/industries/icons/<key>.png
 *   public/images/cases/<slug>.png       ->  blog-media/industries/covers/<slug>.png  (skips *_old)
 *
 * Reads SUPABASE_URL + SUPABASE_SERVICE_KEY from .env.local (or the env).
 * Usage:  node scripts/upload-industry-images-to-storage.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
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

const URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!URL || !SERVICE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local or the environment.");
  process.exit(1);
}

const BUCKET = "blog-media";
const base = URL.replace(/\/$/, "");

/** Upload one local file to <bucket>/<destPath> via the Storage REST API. */
async function uploadOne(localPath, destPath) {
  const body = readFileSync(localPath);
  const res = await fetch(`${base}/storage/v1/object/${BUCKET}/${destPath}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      "content-type": "image/png",
      "x-upsert": "true",
      "cache-control": "public, max-age=31536000, immutable",
    },
    body,
  });
  if (!res.ok) {
    console.error(`✗ ${destPath}: HTTP ${res.status} — ${await res.text()}`);
    return null;
  }
  console.log(`✓ ${destPath}`);
  return `${base}/storage/v1/object/public/${BUCKET}/${destPath}`;
}

async function uploadDir(srcDir, destPrefix, filter = () => true) {
  const out = {};
  if (!existsSync(srcDir)) {
    console.warn(`(skip) no dir: ${path.relative(ROOT, srcDir)}`);
    return out;
  }
  for (const file of readdirSync(srcDir)) {
    if (!file.toLowerCase().endsWith(".png") || !filter(file)) continue;
    const key = file.replace(/\.png$/i, "");
    const url = await uploadOne(path.join(srcDir, file), `${destPrefix}/${file}`);
    if (url) out[key] = url;
  }
  return out;
}

const icons = await uploadDir(
  path.join(ROOT, "public", "images", "industries"),
  "industries/icons",
);
const covers = await uploadDir(
  path.join(ROOT, "public", "images", "cases"),
  "industries/covers",
  (f) => !/_old\.png$/i.test(f),
);

console.log("\n=== RESULT JSON (icons keyed by icon key, covers keyed by slug) ===");
console.log(JSON.stringify({ icons, covers }, null, 2));
