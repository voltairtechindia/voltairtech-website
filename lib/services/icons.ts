/**
 * Service icon logic (pure — no JSX), shared by the API route, the admin, and
 * the SVG registry in components/atoms/ServiceGlyph.tsx.
 *
 * A service stores an `icon` key. The admin picks one from SERVICE_ICONS, or
 * leaves it on "Auto" (empty) and the API derives one via pickServiceIcon().
 * Unknown keys fall back to DEFAULT_SERVICE_ICON when rendered.
 */
export const DEFAULT_SERVICE_ICON = "default";

/** Keys that have a real glyph in ServiceGlyph (+ human labels for the dropdown). */
export const SERVICE_ICONS: { key: string; label: string }[] = [
  { key: "web", label: "Website / Web app" },
  { key: "auto", label: "Automation / Workflows" },
  { key: "chat", label: "Chatbot / Messaging" },
  { key: "voice", label: "Voice agent" },
  { key: "rag", label: "RAG / Search / Knowledge" },
  { key: "mobile", label: "Mobile app" },
  { key: "code", label: "Custom software / Dev" },
  { key: "data", label: "Data / Analytics" },
  { key: "ai", label: "AI / Generic" },
  { key: "drone", label: "Drone / UAV" },
  { key: "sim", label: "Simulator / Training" },
  { key: "robot", label: "Robotics" },
  { key: "iot", label: "IoT / Connected devices" },
  { key: "default", label: "Default (bolt)" },
];

const VALID = new Set(SERVICE_ICONS.map((i) => i.key));

/** Whether a key maps to a real glyph. */
export function isValidIcon(key: string): boolean {
  return VALID.has(key);
}

/**
 * Derive a sensible icon key from a service's title/tags by keyword match.
 * Used when the admin leaves the icon on "Auto". Falls back to `default`.
 */
export function pickServiceIcon(title: string, tags: string[] = []): string {
  const hay = `${title} ${tags.join(" ")}`.toLowerCase();
  const rules: [RegExp, string][] = [
    [/voice|speech|eleven\s?labs|\bcall\b/, "voice"],
    [/whatsapp|chat\s?bot|chatbot|messag|conversation/, "chat"],
    [/rag|retriev|search|knowledge|vector|embedding/, "rag"],
    [/mobile|app store|react native|expo|android|ios/, "mobile"],
    [/website|web\s?app|landing|next\.?js|frontend|\bsite\b/, "web"],
    [/automation|workflow|n8n|integration|zapier|pipeline/, "auto"],
    [/data|analytics|dashboard|report|warehouse/, "data"],
    [/custom|software|\bapi\b|agent|integrat|llm/, "code"],
    [/\bai\b|gpt|claude|gemini|model|\bml\b/, "ai"],
  ];
  for (const [re, key] of rules) if (re.test(hay)) return key;
  return DEFAULT_SERVICE_ICON;
}

/**
 * Resolve the icon to store: an explicit valid glyph key, else auto-derive.
 * The "derive from title" sentinel is an EMPTY string (the admin's "Auto"
 * option) — note `auto` itself is a real glyph (the automation icon), so it is
 * treated as an explicit choice, not the derive sentinel.
 */
export function resolveServiceIcon(
  explicit: string | null | undefined,
  title: string,
  tags: string[] = [],
): string {
  const e = (explicit ?? "").trim().toLowerCase();
  if (e && isValidIcon(e)) return e;
  return pickServiceIcon(title, tags);
}
