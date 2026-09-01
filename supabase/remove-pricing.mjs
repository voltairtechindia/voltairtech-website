/**
 * Take every rupee figure off the public site.
 *
 * Nothing a visitor reads quotes a price any more, and neither does the
 * chatbot: builds are scoped and quoted on a call. This rewrites the pricing
 * paragraphs and Q&A that carried figures, and re-posts each WHOLE row through
 * the admin API so the rest of the row survives and the chatbot re-embeds from
 * the same text the page shows.
 *
 * What deliberately SURVIVES: `services.price`. It is never rendered and never
 * embedded — it exists only to fill the schema.org Offer node, which is how
 * Google can still show a figure in search results.
 *
 * Timelines stay everywhere; a delivery date is not a price.
 *
 * Usage:
 *   node supabase/remove-pricing.mjs --target=http://localhost:3000 [--dry]
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const GAP_MS = Number(args.find((a) => a.startsWith("--gap="))?.split("=")[1] ?? 14_000);
const SITE = (
  args.find((a) => a.startsWith("--target="))?.split("=")[1] || "https://www.voltairtech.com"
).replace(/\/$/, "");

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
  } catch { /* rely on process.env */ }
  return env;
}
const env = loadEnv();
const need = (n) => { if (!env[n]) { console.error(`Missing ${n}.`); process.exit(2); } return env[n]; };
const SUPABASE_URL = need("SUPABASE_URL").replace(/\/$/, "");
const SERVICE_KEY = need("SUPABASE_SERVICE_KEY");
const ADMIN_KEY = env.ADMIN_API_KEY || env.VOLTAIR_ADMIN_KEY;
if (!ADMIN_KEY) { console.error("Missing ADMIN_API_KEY."); process.exit(2); }

const sbHeaders = { apikey: SERVICE_KEY, authorization: `Bearer ${SERVICE_KEY}` };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function sbSelect(table, query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers: sbHeaders });
  if (!res.ok) throw new Error(`Read ${table} failed (${res.status}): ${await res.text()}`);
  return res.json();
}

async function postAdmin(path, body, { attempt = 1 } = {}) {
  if (DRY) return "(dry run)";
  const res = await fetch(`${SITE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-key": ADMIN_KEY },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (res.ok) return text;
  const quota = res.status === 429 || res.status === 500 || /RESOURCE_EXHAUSTED|quota/i.test(text);
  if (quota && attempt <= 6) {
    const wait = Math.min(60_000, 8_000 * attempt);
    console.log(`    quota hit, waiting ${wait / 1000}s (attempt ${attempt + 1})`);
    await sleep(wait);
    return postAdmin(path, body, { attempt: attempt + 1 });
  }
  throw new Error(`POST ${path} failed (${res.status}): ${text}`);
}

/** The one paragraph every "What it costs" section becomes. */
const HOW_PRICING_WORKS =
  "Every build is quoted on its own, so there is no price list here. You get one fixed " +
  "price for the whole thing, agreed in writing before any work starts, and it does not " +
  "move unless you ask for something that was not agreed. Thirty days of support after " +
  "it goes live is included.\n\n" +
  "Tell us what you need and we come back within the hour with the scope, the price and " +
  "a start date.";

/** Replace a "## What it costs" section, keeping any timeline sentence it opened with. */
function stripCostSection(md, keepLine) {
  if (!md) return md;
  const re = /## What it costs\n\n[\s\S]*?(?=\n## |\s*$)/;
  if (!re.test(md)) return md;
  const body = (keepLine ? `${keepLine}\n\n` : "") + HOW_PRICING_WORKS;
  return md.replace(re, `## What it costs\n\n${body}\n`);
}

// Timeline sentences worth keeping when the figure comes out of each section.
const KEEP = {
  "ai-websites": "Live on your own domain in 48 hours, including the domain setup and the payment connection.",
  "ai-automation": "One automation is ready in one to two weeks; a full set covering several parts of the business takes longer.",
  "rag-systems": "Ready in two to three weeks for one set of documents. Larger setups covering several teams, languages or clients take longer.",
  "mobile-apps": "Ready in four to eight weeks, depending on how much the app does.",
  "custom-ai-software": "This one genuinely depends on what it is, which is why the call is free and there is no obligation.",
  "voice-agents-ivr-automation": "Ready in two to three weeks, covering the conversation design, the languages you need, and connecting it to your booking or order system.",
  "custom-self-improving-ai-agents": "Ready in three to five weeks, covering the assistant, the things it is allowed to do, the way we measure whether it is working, and the limits above.",
  "ai-compliance-regtech-gst-dpdp-act": "Ready in two to three weeks. Built for Indian small and mid sized businesses, not adapted from something American.",
};

// Q&A that quoted a figure. Keyed by slug then question.
const FAQ = {
  "custom-self-improving-ai-agents": {
    "What does it cost and how long does it take?":
      "Ready in three to five weeks. That covers the assistant, the things it is allowed to do, the way we measure whether it is working, and the limits above. The price is one fixed figure for the whole build, quoted after a short call and agreed in writing before anything starts, with 30 days of support included.",
  },
  "ai-automation": {
    "How much does AI automation cost?":
      "One workflow is ready in one to two weeks; automations spanning several systems take longer. Either way you get a single fixed price, quoted after a short call and agreed before work starts, rather than a charge per task or per hour.",
  },
  "rag-systems": {
    "What does it cost and how long does it take?":
      "Ready in two to three weeks. The price depends on how much material you have and how many teams or languages it serves, so we quote it after a short call: one fixed figure covering loading your documents, the search, the testing and putting it live, plus 30 days of support.",
  },
  "voice-agents-ivr-automation": {
    "How much does it cost and how fast can it go live?":
      "Live in two to three weeks. The build is one fixed price, quoted after a short call. Telephony and speech-provider usage is billed by those vendors directly, and we size that running cost with you before you commit.",
  },
  "ai-compliance-regtech-gst-dpdp-act": {
    "What do you actually build here?":
      "Consent and audit-trail infrastructure, data retention and deletion workflows, GST reconciliation and filing automation, and monitoring that flags exceptions before a deadline does. Delivered in two to three weeks, at one fixed price agreed before we start.",
  },
};

// Sector pages that closed on a figure.
const INDUSTRY_LINES = {
  "d2c-ecommerce": [
    "A WhatsApp ordering bot starts at ₹1.5L. A full site with payments is ₹75,000 and live in 48 hours. Most brands start with one and add the other later.",
    "A full site with payments is live in 48 hours. Most brands start with either that or a WhatsApp ordering bot, and add the other once the first is earning. Both are quoted as one fixed price after a short call.",
  ],
  "logistics-supply-chain": [
    "Automation starts at ₹25,000 for one workflow, and one to two weeks. Most operations start with tracking or documents and add the rest once they see it working.",
    "One workflow takes one to two weeks. Most operations start with tracking or paperwork and add the rest once they see it working. Fixed price, agreed after a short call.",
  ],
  "hospitality-travel": [
    "A proper site with photos, menus, rooms and a working booking button, live in 48 hours from ₹75,000.",
    "A proper site with photos, menus, rooms and a working booking button, live in 48 hours.",
  ],
};

const SERVICE_COLUMNS =
  "slug,title,headline,summary,bullets,eta,icon,cover_image,media,lead,meta,body_md,price,tags,seo,faq,position,status,published_at";
const INDUSTRY_COLUMNS =
  "slug,title,headline,summary,bullets,icon,cover_image,media,icon_image,lead,meta,body_md,tags,service_slugs,custom_services,case_studies,faq,seo,position,homepage_featured,status,published_at";

const hasRupee = (v) => JSON.stringify(v ?? "").includes("₹");

async function run() {
  console.log(`Removing pricing -> ${SITE}${DRY ? "   [DRY RUN]" : ""}\n`);

  // ── services ──
  console.log("Services");
  const services = await sbSelect("services", `select=${SERVICE_COLUMNS}&order=position`);
  const svcPayload = [];
  for (const row of services) {
    const next = {
      ...row,
      body_md: stripCostSection(row.body_md, KEEP[row.slug]),
      faq: (row.faq ?? []).map((f) => {
        const replacement = FAQ[row.slug]?.[f.q];
        return replacement ? { q: f.q, a: replacement } : f;
      }),
    };
    if (JSON.stringify(row) === JSON.stringify(next)) {
      console.log(`  · ${row.slug}: no figures, left alone`);
      continue;
    }
    if (hasRupee(next.body_md) || hasRupee(next.faq)) {
      console.log(`  ! ${row.slug}: STILL has a figure after rewrite — check it`);
    }
    console.log(`  ✓ ${row.slug}`);
    svcPayload.push(next);
  }
  for (let i = 0; i < svcPayload.length; i++) {
    await postAdmin("/api/services", { services: [svcPayload[i]] });
    if (!DRY && i < svcPayload.length - 1) await sleep(GAP_MS);
  }
  console.log(`  wrote ${svcPayload.length}\n`);

  // ── industries ──
  console.log("Industries");
  const industries = await sbSelect("industries", `select=${INDUSTRY_COLUMNS}&order=position`);
  const indPayload = [];
  for (const row of industries) {
    const pair = INDUSTRY_LINES[row.slug];
    if (!pair || !row.body_md?.includes(pair[0])) {
      console.log(`  · ${row.slug}: no figures, left alone`);
      continue;
    }
    const next = { ...row, body_md: row.body_md.replace(pair[0], pair[1]) };
    if (hasRupee(next.body_md)) console.log(`  ! ${row.slug}: STILL has a figure`);
    console.log(`  ✓ ${row.slug}`);
    indPayload.push(next);
  }
  for (let i = 0; i < indPayload.length; i++) {
    await postAdmin("/api/industries", { industries: [indPayload[i]] });
    if (!DRY && i < indPayload.length - 1) await sleep(GAP_MS);
  }
  console.log(`  wrote ${indPayload.length}\n`);

  // ── the /faq page ──
  console.log("The /faq page");
  const faqs = await sbSelect("site_faqs", "select=*&order=position");
  const target = faqs.find((f) => f.answer.includes("₹"));
  if (!target) {
    console.log("  · no figures, left alone\n");
  } else {
    await postAdmin("/api/faqs", {
      faqs: [{
        ...target,
        answer:
          "Every build is quoted on its own, so we do not publish a price list. You get one " +
          "fixed price for the whole thing, agreed in writing before any work starts. Never an " +
          "hourly rate, and never a different number halfway through. Tell us what you need and " +
          "we come back within the hour with the scope, the price and a start date. Thirty days " +
          "of support after it goes live is included.",
      }],
    });
    console.log(`  ✓ ${target.slug}\n`);
  }

  console.log("Done.");
}

await run();
