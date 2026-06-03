/**
 * Service icons — a small curated registry keyed by name. A DB-managed service
 * stores an `icon` key (`services.icon`); this renders the matching glyph and
 * falls back to `default` for any unknown/empty key, so the UI never breaks.
 * The key list + selection logic live in `@/lib/services/icons` (pure, no JSX).
 */
import type { ReactElement } from "react";

import { DEFAULT_SERVICE_ICON } from "@/lib/services/icons";

const stroke = "#E63946";
const sw = 1.5;

/** Registry of available glyphs. Add a new SVG here + an entry in SERVICE_ICONS. */
const GLYPHS: Record<string, ReactElement> = {
  web: (
    <svg viewBox="0 0 56 56" fill="none">
      <rect x="6" y="10" width="44" height="32" rx="3" stroke={stroke} strokeWidth={sw} />
      <line x1="6" y1="18" x2="50" y2="18" stroke={stroke} strokeWidth={sw} />
      <circle cx="11" cy="14" r="1" fill={stroke} />
      <circle cx="15" cy="14" r="1" fill={stroke} />
      <circle cx="19" cy="14" r="1" fill={stroke} />
      <rect x="12" y="24" width="22" height="3" rx="1" fill="#F5F5F0" opacity="0.5" />
      <rect x="12" y="30" width="14" height="3" rx="1" fill="#F5F5F0" opacity="0.3" />
    </svg>
  ),
  auto: (
    <svg viewBox="0 0 56 56" fill="none">
      <circle cx="10" cy="14" r="4" stroke={stroke} strokeWidth={sw} />
      <circle cx="46" cy="14" r="4" stroke={stroke} strokeWidth={sw} />
      <circle cx="28" cy="42" r="4" stroke={stroke} strokeWidth={sw} />
      <path d="M13 18 L26 38 M43 18 L30 38 M14 14 L42 14" stroke="#F5F5F0" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 56 56" fill="none">
      <rect x="6" y="12" width="44" height="26" rx="6" stroke={stroke} strokeWidth={sw} />
      <path d="M18 38 L22 46 L28 38" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <circle cx="20" cy="25" r="1.8" fill="#F5F5F0" />
      <circle cx="28" cy="25" r="1.8" fill="#F5F5F0" />
      <circle cx="36" cy="25" r="1.8" fill="#F5F5F0" />
    </svg>
  ),
  rag: (
    <svg viewBox="0 0 56 56" fill="none">
      <rect x="8" y="8" width="40" height="40" rx="2" stroke={stroke} strokeWidth={sw} />
      <path d="M8 20 H48 M8 32 H48 M20 8 V48 M32 8 V48" stroke="#F5F5F0" strokeWidth="1" opacity="0.4" />
      <circle cx="14" cy="14" r="2" fill="#D9FF00" />
      <circle cx="26" cy="26" r="2" fill="#D9FF00" />
      <circle cx="38" cy="20" r="2" fill="#D9FF00" />
      <circle cx="42" cy="38" r="2" fill="#D9FF00" />
    </svg>
  ),
  mobile: (
    <svg viewBox="0 0 56 56" fill="none">
      <rect x="18" y="6" width="20" height="44" rx="4" stroke={stroke} strokeWidth={sw} />
      <line x1="18" y1="14" x2="38" y2="14" stroke={stroke} strokeWidth={sw} />
      <line x1="18" y1="42" x2="38" y2="42" stroke={stroke} strokeWidth={sw} />
      <circle cx="28" cy="46" r="1.5" fill={stroke} />
      <rect x="22" y="18" width="12" height="3" rx="1" fill="#F5F5F0" opacity="0.5" />
      <rect x="22" y="24" width="8" height="3" rx="1" fill="#F5F5F0" opacity="0.3" />
    </svg>
  ),
  soft: (
    <svg viewBox="0 0 56 56" fill="none">
      <path d="M18 6 L8 28 L18 50" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
      <path d="M38 6 L48 28 L38 50" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
      <path d="M32 8 L24 48" stroke="#F5F5F0" strokeWidth={sw} strokeLinecap="round" opacity="0.6" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 56 56" fill="none">
      <path d="M28 8 L33 23 L48 28 L33 33 L28 48 L23 33 L8 28 L23 23 Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <circle cx="28" cy="28" r="2" fill="#D9FF00" />
      <circle cx="44" cy="12" r="1.5" fill="#F5F5F0" opacity="0.6" />
      <circle cx="12" cy="44" r="1.5" fill="#F5F5F0" opacity="0.6" />
    </svg>
  ),
  data: (
    <svg viewBox="0 0 56 56" fill="none">
      <ellipse cx="28" cy="14" rx="16" ry="6" stroke={stroke} strokeWidth={sw} />
      <path d="M12 14 V42 C12 45 19 48 28 48 C37 48 44 45 44 42 V14" stroke={stroke} strokeWidth={sw} />
      <path d="M12 28 C12 31 19 34 28 34 C37 34 44 31 44 28" stroke="#F5F5F0" strokeWidth="1" opacity="0.5" />
      <circle cx="28" cy="14" r="1.6" fill="#D9FF00" />
    </svg>
  ),
  voice: (
    <svg viewBox="0 0 56 56" fill="none">
      <rect x="23" y="8" width="10" height="22" rx="5" stroke={stroke} strokeWidth={sw} />
      <path d="M16 26 C16 34 21 38 28 38 C35 38 40 34 40 26" stroke={stroke} strokeWidth={sw} />
      <line x1="28" y1="38" x2="28" y2="46" stroke={stroke} strokeWidth={sw} />
      <line x1="20" y1="46" x2="36" y2="46" stroke={stroke} strokeWidth={sw} />
      <path d="M44 20 V32 M48 24 V28" stroke="#D9FF00" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 56 56" fill="none">
      <rect x="6" y="10" width="44" height="36" rx="3" stroke={stroke} strokeWidth={sw} />
      <path d="M20 24 L14 30 L20 36 M36 24 L42 30 L36 36" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
      <line x1="31" y1="22" x2="25" y2="38" stroke="#D9FF00" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 56 56" fill="none">
      <path d="M28 6 L48 17 V39 L28 50 L8 39 V17 Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M30 18 L20 30 H28 L26 40 L36 26 H28 Z" fill="#D9FF00" stroke="none" />
    </svg>
  ),
};

/** Render a glyph by registry key, falling back to `default`. */
export function ServiceGlyph({ kind }: { kind?: string | null }) {
  return GLYPHS[kind ?? ""] ?? GLYPHS[DEFAULT_SERVICE_ICON];
}
