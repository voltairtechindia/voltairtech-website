/**
 * Generate a 3D-rendered icon PNG per industry via OpenRouter's image API
 * and save into public/images/industries/<key>.png. Used on /industries
 * cards (bottom-right badge) in place of the flat IndustryColorGlyph SVGs.
 *
 * Usage:
 *   node scripts/generate-industry-icons.mjs            # all industries
 *   node scripts/generate-industry-icons.mjs d2c fintech # just these keys
 *
 * Reads OPENROUTER_API_KEY from .env.local (or the environment).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function loadEnvLocal() {
  const file = path.join(ROOT, ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnvLocal();

const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) {
  console.error("Set OPENROUTER_API_KEY in .env.local or the environment.");
  process.exit(1);
}

const MODEL = process.env.ICON_MODEL || "openai/gpt-image-1";

/** key -> { subject, color } — mirrors components/atoms/IndustryColorGlyph.tsx */
const INDUSTRIES = {
  d2c: { subject: "a glossy 3D shopping bag with a small AI sparkle above it", color: "vibrant coral-orange" },
  healthcare: { subject: "a rounded 3D medical cross with a subtle heartbeat pulse line", color: "bright blue" },
  fintech: { subject: "a 3D stack of credit/debit cards with a rupee currency symbol", color: "emerald green" },
  realestate: { subject: "a modern 3D building with a peaked roof and a glowing window", color: "indigo blue" },
  education: { subject: "a 3D graduation cap resting on an open book", color: "amber yellow" },
  logistics: { subject: "a 3D delivery van with a shipping box beside it", color: "sky blue" },
  proservices: { subject: "a 3D briefcase with a document and pen", color: "violet purple" },
  hospitality: { subject: "a 3D hotel reception bell on a small stand", color: "rose pink" },
  manufacturing: { subject: "a 3D factory building with a gear and a smokestack", color: "burnt orange" },
  automotive: { subject: "a sleek 3D car silhouette with glowing headlights", color: "cyan teal" },
  insurance: { subject: "a 3D shield with a checkmark on its face", color: "teal green" },
  media: { subject: "a 3D film clapperboard with a play button", color: "purple" },
  agriculture: { subject: "a 3D sprouting plant inside a circular leaf badge", color: "lime green" },
  saas: { subject: "a 3D cloud connected to small gear and network nodes", color: "royal blue" },
  beauty: { subject: "a 3D cosmetic bottle beside a blooming flower", color: "pink magenta" },
  events: { subject: "a 3D event ticket with a calendar star and confetti", color: "fuchsia" },
  nonprofit: { subject: "two 3D hands cupped together forming a small heart", color: "emerald green" },
  energy: { subject: "a 3D lightning bolt inside a solar panel circle", color: "golden yellow" },
  default: { subject: "an abstract glossy 3D sphere with a soft neural-network glow", color: "crimson red" },
};

function buildPrompt({ subject, color }) {
  return (
    `A small clean 3D-rendered app icon of ${subject}, isolated on a transparent background ` +
    `(no background, no backdrop, no surface, alpha cutout). ` +
    `Isometric-friendly 3/4 perspective, smooth rounded glossy plastic/clay material, ` +
    `${color} color palette with soft gradient shading, soft contained shadow directly under ` +
    `the object only, centered composition with generous padding, no text, no watermark, ` +
    `no logo, high quality 3D render, consistent with a modern SaaS icon set.`
  );
}

async function generateOne(key) {
  const def = INDUSTRIES[key];
  if (!def) {
    console.error(`Unknown industry key: ${key}`);
    return false;
  }
  const prompt = buildPrompt(def);
  console.log(`→ ${key}: requesting...`);

  const res = await fetch("https://openrouter.ai/api/v1/images", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      aspect_ratio: "1:1",
      resolution: "2K",
      background: "transparent",
      output_format: "png",
    }),
  });

  if (!res.ok) {
    console.error(`✗ ${key}: HTTP ${res.status} — ${await res.text()}`);
    return false;
  }

  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) {
    console.error(`✗ ${key}: no image data in response`, JSON.stringify(json).slice(0, 500));
    return false;
  }

  const outDir = path.join(ROOT, "public", "images", "industries");
  mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${key}.png`);
  writeFileSync(outFile, Buffer.from(b64, "base64"));
  console.log(`✓ ${key}: saved ${path.relative(ROOT, outFile)} (cost: ${json?.usage?.cost ?? "?"})`);
  return true;
}

const requested = process.argv.slice(2);
const keys = requested.length ? requested : Object.keys(INDUSTRIES);

let ok = 0;
for (const key of keys) {
  // eslint-disable-next-line no-await-in-loop
  if (await generateOne(key)) ok++;
}
console.log(`\nDone: ${ok}/${keys.length} succeeded.`);
process.exit(ok === keys.length ? 0 : 1);
