/**
 * Industry (sector) icon logic (pure — no JSX), shared by the API route and the
 * admin. Each key maps to a 3D-rendered PNG badge served from Supabase storage
 * (see industryIconSrc below), not a hardcoded SVG.
 *
 * An industry stores an `icon` key (`industries.icon`). The admin picks one from
 * INDUSTRY_ICONS, or leaves it on "Auto" (empty) and the API derives one via
 * pickIndustryIcon(). Unknown keys fall back to DEFAULT_INDUSTRY_ICON.
 */
export const DEFAULT_INDUSTRY_ICON = "default";

/** Sector icon keys that have a PNG badge (+ human labels for the admin dropdown). */
export const INDUSTRY_ICONS: { key: string; label: string }[] = [
  { key: "d2c", label: "D2C / E-commerce / Retail" },
  { key: "healthcare", label: "Healthcare / Clinics" },
  { key: "fintech", label: "Fintech / Payments" },
  { key: "realestate", label: "Real Estate" },
  { key: "education", label: "Education / EdTech" },
  { key: "logistics", label: "Logistics / Supply Chain" },
  { key: "proservices", label: "Professional Services" },
  { key: "hospitality", label: "Hospitality / Travel" },
  { key: "manufacturing", label: "Manufacturing / Industrial" },
  { key: "automotive", label: "Automotive / Mobility" },
  { key: "insurance", label: "Insurance / InsurTech" },
  { key: "media", label: "Media / Entertainment" },
  { key: "agriculture", label: "Agriculture / AgriTech" },
  { key: "saas", label: "SaaS / B2B Tech" },
  { key: "beauty", label: "Beauty / Salons / Wellness" },
  { key: "events", label: "Events / Experiences" },
  { key: "nonprofit", label: "Non-profit / NGO" },
  { key: "energy", label: "Energy / Utilities" },
  { key: "default", label: "Default (sector)" },
];

const VALID = new Set(INDUSTRY_ICONS.map((i) => i.key));

/** Whether a key maps to a real glyph. */
export function isValidIcon(key: string): boolean {
  return VALID.has(key);
}

/**
 * Public URL of the 3D-rendered PNG badge for a sector icon key — served from
 * the Supabase `blog-media` bucket (uploaded via scripts/upload-industry-images
 * -to-storage.mjs), so nothing is hardcoded under /public. This is the default
 * badge; an industry can override it per-row with `icon_image` (admin upload).
 */
export function industryIconSrc(key?: string | null): string {
  const k = key && isValidIcon(key) ? key : DEFAULT_INDUSTRY_ICON;
  const base = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/blog-media/industries/icons/${k}.png`;
}

/**
 * Derive a sensible sector icon key from an industry's title/tags by keyword
 * match. Used when the admin leaves the icon on "Auto". Falls back to `default`.
 */
export function pickIndustryIcon(title: string, tags: string[] = []): string {
  const hay = `${title} ${tags.join(" ")}`.toLowerCase();
  const rules: [RegExp, string][] = [
    [/health|clinic|hospital|medic|patient|pharma|dental/, "healthcare"],
    [/insur|insurtech|underwrit|claims|policyholder/, "insurance"],
    [/fintech|finance|bank|payment|lending|wealth|trading|kyc/, "fintech"],
    [/real\s?estate|property|realty|housing|broker|listing/, "realestate"],
    [/educat|edtech|school|college|tutor|course|learning|student/, "education"],
    [/logistic|supply\s?chain|freight|shipping|warehouse|delivery|fleet/, "logistics"],
    [/manufactur|industrial|factory|production|machin|assembly/, "manufacturing"],
    [/automotive|vehicle|\bcar\b|mobility|\bauto\b|dealership|ev\b/, "automotive"],
    [/media|entertainment|film|streaming|publish|broadcast|content\s?studio|ott/, "media"],
    [/agri|agric|farm|crop|agtech|agritech|plantation/, "agriculture"],
    [/saas|b2b\s?tech|software\s?company|developer\s?tool|platform|api\s?company/, "saas"],
    [/beauty|salon|spa|cosmet|wellness|grooming|aesthet/, "beauty"],
    [/event|experienc|conference|wedding|exhibition|ticketing/, "events"],
    [/non-?profit|ngo|charit|foundation|social\s?impact|fundrais/, "nonprofit"],
    [/energy|utilit|power|solar|electric|renewable|oil\s?&?\s?gas/, "energy"],
    [/legal|law|accounting|\bca\b|consult|agency|professional\s?services|advisory/, "proservices"],
    [/hospitality|travel|hotel|restaurant|tourism|booking|concierge|food/, "hospitality"],
    [/d2c|e-?commerce|retail|shop|store|brand|fashion|fmcg|consumer/, "d2c"],
  ];
  for (const [re, key] of rules) if (re.test(hay)) return key;
  return DEFAULT_INDUSTRY_ICON;
}

/**
 * Resolve the icon to store: an explicit valid glyph key, else auto-derive.
 * The "derive from title" sentinel is an EMPTY string (the admin's "Auto"
 * option).
 */
export function resolveIndustryIcon(
  explicit: string | null | undefined,
  title: string,
  tags: string[] = [],
): string {
  const e = (explicit ?? "").trim().toLowerCase();
  if (e && isValidIcon(e)) return e;
  return pickIndustryIcon(title, tags);
}
