/**
 * KB drift guard — closes the "edited knowledge-base.ts but forgot to re-seed"
 * gap that makes the chatbot serve old facts.
 *
 * The hardcoded core docs (company/pricing/process/rag/faq) only reach the bot
 * via POST /api/ingest {seed:true}; unlike services/industries/blog they do NOT
 * auto-sync. This script compares lib/rag/data/knowledge-base.ts against the
 * live `documents` table and flags any difference.
 *
 *   node scripts/check-kb-drift.mjs           # report drift, exit 1 if any (CI gate)
 *   node scripts/check-kb-drift.mjs --seed    # re-seed via /api/ingest, then re-check
 *   node scripts/check-kb-drift.mjs --seed --flush-cache
 *
 * Targets production by default; override with --target=http://localhost:3000
 * or SEED_TARGET. Reads SUPABASE_URL / SUPABASE_SERVICE_KEY / ADMIN_API_KEY
 * from .env.local (or the environment).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const KB_PATH = resolve(ROOT, "lib/rag/data/knowledge-base.ts");
const KB_DOC_TYPES = ["company", "pricing", "process", "rag", "faq"];

const args = process.argv.slice(2);
const SEED = args.includes("--seed");
const FLUSH = args.includes("--flush-cache");
const target =
  (args.find((a) => a.startsWith("--target="))?.split("=")[1] ||
    process.env.SEED_TARGET ||
    "https://voltairtech.com").replace(/\/$/, "");

// --- env (prefer .env.local, fall back to process.env) ---------------------
function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(resolve(ROOT, ".env.local"), "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#") || !t.includes("=")) continue;
      const i = t.indexOf("=");
      const k = t.slice(0, i).trim();
      if (env[k] === undefined) env[k] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    /* no .env.local — rely on process.env */
  }
  return env;
}
const env = loadEnv();

function require_(name) {
  if (!env[name]) {
    console.error(`Missing ${name} (set it in .env.local or the environment).`);
    process.exit(2);
  }
  return env[name];
}

// --- load KNOWLEDGE_BASE from the TS source (type import is erasable) -------
async function loadKnowledgeBase() {
  // Erase the two TS-isms (type-only import + the array type annotation); the
  // rest of the file is plain ESM data we can import directly.
  const src = readFileSync(KB_PATH, "utf8")
    .replace(/^\s*import\s+type[^\n]*\n/m, "")
    .replace(/export\s+const\s+KNOWLEDGE_BASE\s*:[^=]*=/, "export const KNOWLEDGE_BASE =");
  const mod = await import(
    "data:text/javascript;base64," + Buffer.from(src).toString("base64")
  );
  return mod.KNOWLEDGE_BASE;
}

const key = (d) => `${d.doc_type}::${d.external_id}`;

async function fetchLiveDocs() {
  const url = require_("SUPABASE_URL");
  const k = require_("SUPABASE_SERVICE_KEY");
  const inList = `(${KB_DOC_TYPES.join(",")})`;
  const res = await fetch(
    `${url}/rest/v1/documents?select=doc_type,external_id,title,content&doc_type=in.${inList}`,
    { headers: { apikey: k, Authorization: `Bearer ${k}` } },
  );
  if (!res.ok) {
    console.error(`Supabase query failed: ${res.status} ${await res.text()}`);
    process.exit(2);
  }
  return res.json();
}

async function reseed() {
  const adminKey = require_("ADMIN_API_KEY");
  console.log(`\n→ Re-seeding via POST ${target}/api/ingest {seed:true} …`);
  const res = await fetch(`${target}/api/ingest`, {
    method: "POST",
    headers: { "content-type": "application/json", "X-Admin-Key": adminKey },
    body: JSON.stringify({ seed: true }),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`Re-seed failed: ${res.status} ${body}`);
    process.exit(2);
  }
  console.log(`  ${body}`);
  if (FLUSH) {
    const f = await fetch(`${target}/api/ingest`, {
      method: "POST",
      headers: { "content-type": "application/json", "X-Admin-Key": adminKey },
      body: JSON.stringify({ flushCache: true }),
    });
    console.log(`  flushCache: ${f.status} ${await f.text()}`);
  }
}

async function diff() {
  const kb = await loadKnowledgeBase();
  const live = await fetchLiveDocs();
  const liveMap = new Map(live.map((d) => [key(d), d]));
  const kbKeys = new Set(kb.map(key));

  const missing = []; // in file, not in DB
  const changed = []; // content differs
  for (const doc of kb) {
    const live = liveMap.get(key(doc));
    if (!live) missing.push(key(doc));
    else if ((live.content ?? "") !== doc.content) changed.push(key(doc));
  }
  const orphan = live.filter((d) => !kbKeys.has(key(d))).map(key); // in DB, not in file

  return { kbCount: kb.length, liveCount: live.length, missing, changed, orphan };
}

// --- run -------------------------------------------------------------------
if (SEED) await reseed();

const r = await diff();
const drift = r.missing.length + r.changed.length + r.orphan.length;

console.log(`\nKB drift check  (file: ${r.kbCount} docs, live DB: ${r.liveCount} docs)`);
if (!drift) {
  console.log("✓ In sync — the chatbot's core facts match knowledge-base.ts.");
  process.exit(0);
}
console.log(`✗ DRIFT: ${drift} discrepancy(ies). The bot is serving stale/divergent core facts.`);
if (r.missing.length) console.log(`  missing from DB (need re-seed): ${r.missing.join(", ")}`);
if (r.changed.length) console.log(`  content differs (file edited, not re-seeded): ${r.changed.join(", ")}`);
if (r.orphan.length) console.log(`  in DB but not in file (stale rows): ${r.orphan.join(", ")}`);
if (!SEED) console.log(`\nFix: node scripts/check-kb-drift.mjs --seed --flush-cache`);
process.exit(1);
