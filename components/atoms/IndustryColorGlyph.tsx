/**
 * Colorful sector icon tile — a rounded, vividly-colored badge (one hue per
 * industry) rendered bottom-left on /industries cards, replacing the faint
 * red/lime outline corner glyph. Reuses the same silhouettes as
 * IndustryGlyph, recolored white-on-color for a "colorful icon set" look.
 */
import type { ReactElement } from "react";

import { DEFAULT_INDUSTRY_ICON } from "@/lib/industries/icons";

const sw = 2;
const fg = "#ffffff";

/** Background tile color per sector — keeps each industry visually distinct. */
const TILE_COLOR: Record<string, string> = {
  d2c: "#FF6B4A",
  healthcare: "#3B82F6",
  fintech: "#10B981",
  realestate: "#6366F1",
  education: "#F59E0B",
  logistics: "#0EA5E9",
  proservices: "#8B5CF6",
  hospitality: "#FB7185",
  manufacturing: "#EA580C",
  automotive: "#06B6D4",
  insurance: "#14B8A6",
  media: "#A855F7",
  agriculture: "#84CC16",
  saas: "#2563EB",
  beauty: "#EC4899",
  events: "#D946EF",
  nonprofit: "#22C55E",
  energy: "#EAB308",
  default: "#E63946",
};

/** Icon silhouettes (no color baked in — colored via `fg` above). */
const PATHS: Record<string, ReactElement> = {
  d2c: (
    <>
      <path d="M14 18 H42 L39 48 H17 Z" stroke={fg} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M21 22 V15 C21 11 24 8 28 8 C32 8 35 11 35 15 V22" stroke={fg} strokeWidth={sw} strokeLinecap="round" />
      <circle cx="28" cy="32" r="3" fill={fg} />
    </>
  ),
  healthcare: (
    <>
      <rect x="8" y="8" width="40" height="40" rx="8" stroke={fg} strokeWidth={sw} />
      <path d="M28 18 V38 M18 28 H38" stroke={fg} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),
  fintech: (
    <>
      <rect x="6" y="14" width="44" height="28" rx="4" stroke={fg} strokeWidth={sw} />
      <line x1="6" y1="22" x2="50" y2="22" stroke={fg} strokeWidth={sw} />
      <path d="M22 30 H32 M22 34 H32 M27 30 C31 30 31 38 25 38 L31 38" stroke={fg} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),
  realestate: (
    <>
      <path d="M10 26 L28 12 L46 26" stroke={fg} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
      <path d="M14 24 V44 H42 V24" stroke={fg} strokeWidth={sw} strokeLinejoin="round" />
      <rect x="24" y="32" width="8" height="12" stroke={fg} strokeWidth={sw} />
    </>
  ),
  education: (
    <>
      <path d="M28 12 L50 22 L28 32 L6 22 Z" stroke={fg} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M16 26 V38 C16 38 21 43 28 43 C35 43 40 38 40 38 V26" stroke={fg} strokeWidth={sw} strokeLinejoin="round" />
    </>
  ),
  logistics: (
    <>
      <path d="M6 16 H32 V38 H6 Z" stroke={fg} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M32 24 H42 L50 30 V38 H32 Z" stroke={fg} strokeWidth={sw} strokeLinejoin="round" />
      <circle cx="16" cy="40" r="4" stroke={fg} strokeWidth={sw} />
      <circle cx="40" cy="40" r="4" stroke={fg} strokeWidth={sw} />
    </>
  ),
  proservices: (
    <>
      <rect x="8" y="18" width="40" height="26" rx="3" stroke={fg} strokeWidth={sw} />
      <path d="M22 18 V14 C22 12 23 11 25 11 H31 C33 11 34 12 34 14 V18" stroke={fg} strokeWidth={sw} strokeLinecap="round" />
      <line x1="8" y1="30" x2="48" y2="30" stroke={fg} strokeWidth={sw} />
    </>
  ),
  hospitality: (
    <>
      <path d="M8 20 V42 M8 30 H40 V42 M40 30 V24 H46 C49 24 50 26 50 30 V42" stroke={fg} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
      <path d="M14 30 V26 C14 24 16 23 19 23 H30 C33 23 34 25 34 27 V30" stroke={fg} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),
  manufacturing: (
    <>
      <path d="M8 46 V24 L20 32 V24 L32 32 V24 L44 32 V46 Z" stroke={fg} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M8 24 L6 12 H12 L10 24" stroke={fg} strokeWidth={sw} strokeLinejoin="round" />
    </>
  ),
  automotive: (
    <>
      <path d="M8 34 L12 22 H38 L46 30 V38 H8 Z" stroke={fg} strokeWidth={sw} strokeLinejoin="round" />
      <line x1="12" y1="22" x2="30" y2="22" stroke={fg} strokeWidth={sw} />
      <circle cx="17" cy="40" r="4" stroke={fg} strokeWidth={sw} />
      <circle cx="38" cy="40" r="4" stroke={fg} strokeWidth={sw} />
    </>
  ),
  insurance: (
    <path d="M28 6 L46 13 V28 C46 39 38 47 28 50 C18 47 10 39 10 28 V13 Z M20 28 L26 34 L37 21" stroke={fg} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
  ),
  media: (
    <>
      <rect x="8" y="12" width="40" height="32" rx="4" stroke={fg} strokeWidth={sw} />
      <path d="M25 27 L34 32 L25 37 Z" fill={fg} stroke="none" />
    </>
  ),
  agriculture: (
    <>
      <path d="M28 50 V26" stroke={fg} strokeWidth={sw} strokeLinecap="round" />
      <path d="M28 30 C20 30 14 24 14 14 C24 14 28 20 28 30 Z" stroke={fg} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M28 24 C36 24 42 18 42 10 C34 10 28 16 28 24 Z" stroke={fg} strokeWidth={sw} strokeLinejoin="round" />
    </>
  ),
  saas: (
    <path d="M18 38 C12 38 8 34 8 28 C8 23 12 19 17 19 C19 13 25 9 32 11 C38 12 42 18 41 24 C46 24 49 28 49 33 C49 37 45 41 40 41 H18 Z" stroke={fg} strokeWidth={sw} strokeLinejoin="round" />
  ),
  beauty: (
    <path d="M28 8 L31 24 L46 28 L31 32 L28 48 L25 32 L10 28 L25 24 Z" stroke={fg} strokeWidth={sw} strokeLinejoin="round" />
  ),
  events: (
    <>
      <path d="M8 18 H48 V25 A3 3 0 0 0 48 31 V38 H8 V31 A3 3 0 0 0 8 25 Z" stroke={fg} strokeWidth={sw} strokeLinejoin="round" />
      <line x1="30" y1="18" x2="30" y2="38" stroke={fg} strokeWidth="1.5" strokeDasharray="2 3" />
    </>
  ),
  nonprofit: (
    <path d="M28 44 C16 36 10 29 10 21 C10 15 14 11 19 11 C23 11 26 13 28 17 C30 13 33 11 37 11 C42 11 46 15 46 21 C46 29 40 36 28 44 Z" stroke={fg} strokeWidth={sw} strokeLinejoin="round" />
  ),
  energy: (
    <path d="M30 14 L19 31 H28 L26 42 L37 25 H28 Z" fill={fg} stroke="none" />
  ),
  default: (
    <path d="M8 48 V22 L22 14 V48 M22 26 L44 14 V48 M8 48 H48" stroke={fg} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
  ),
};

/** Render a colorful sector icon tile by registry key, falling back to `default`. */
export function IndustryColorGlyph({ kind }: { kind?: string | null }) {
  const key = kind && TILE_COLOR[kind] ? kind : DEFAULT_INDUSTRY_ICON;
  return (
    <svg viewBox="0 0 56 56" fill="none">
      <rect x="0" y="0" width="56" height="56" rx="14" fill={TILE_COLOR[key]} />
      {PATHS[key] ?? PATHS[DEFAULT_INDUSTRY_ICON]}
    </svg>
  );
}
