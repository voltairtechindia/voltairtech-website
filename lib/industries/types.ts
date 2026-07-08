/** Shared types for DB-backed, admin-managed industries (a sector lens over services). */

export interface IndustryCover {
  url: string;
  alt?: string;
}

export interface IndustrySeo {
  title?: string;
  description?: string;
  og_image?: string;
  /**
   * Force this industry's detail page out of Google's index (robots noindex).
   * Admin-editable. Industry pages are otherwise indexable by default.
   */
  noindex?: boolean;
}

/** One headline figure for a case study (e.g. { label: "calls deflected", value: "60%" }). */
export interface IndustryCaseStudyMetric {
  label: string;
  value: string;
}

/**
 * A single (real or anonymised) engagement for this sector. Shows HOW AI was
 * applied and WHICH tech stack was used, plus the outcome + headline metrics.
 * Rendered as the "Case studies" section on /industries/<slug> and folded into
 * the RAG embedding so the chatbot can cite it.
 */
export interface IndustryCaseStudy {
  title: string;
  client?: string;
  challenge?: string;
  approach?: string;
  outcome?: string;
  tech_stack: string[];
  metrics: IndustryCaseStudyMetric[];
  link?: string;
}

/**
 * A bespoke, sector-only offering defined inline on an industry (NOT a catalogue
 * service). It renders in the same "Services for <sector>" grid as the linked
 * services AND gets its own detail page at /industries/<industry>/<service> —
 * near-parity with a catalogue service. Folded into the industry's RAG embedding
 * too. `slug` is unique within the industry (derived from the title when blank);
 * `icon` is a ServiceGlyph key. Card + detail are always linked to the detail page.
 */
export interface IndustryCustomService {
  slug: string;
  title: string;
  summary?: string;
  bullets: string[];
  eta?: string;
  icon?: string;
  headline?: string;
  lead?: string;
  body_md?: string;
  cover_image?: IndustryCover | null;
  /**
   * Whether this sector-only sub-page (/industries/<industry>/<service>) may be
   * indexed by Google. Undefined → auto: index only once the page carries real,
   * unique body prose (see lib/industries/indexing.ts). `true`/`false` are an
   * explicit admin override. Guards against 100+ thin, near-template sub-pages
   * dragging the whole domain's quality signal down.
   */
  index?: boolean;
}

export type IndustryStatus = "draft" | "published" | "archived";

/** A full industry row as stored in / returned from Supabase. */
export interface Industry {
  id: string;
  slug: string;
  title: string;
  headline: string | null;
  summary: string | null;
  bullets: string[];
  icon: string;
  cover_image: IndustryCover | null;
  /** Optional admin-uploaded sector badge; overrides the bundled icon registry PNG. */
  icon_image: IndustryCover | null;
  lead: string | null;
  meta: string | null;
  body_md: string;
  tags: string[];
  service_slugs: string[];
  custom_services: IndustryCustomService[];
  case_studies: IndustryCaseStudy[];
  seo: IndustrySeo;
  position: number;
  /** Surface this sector's first case study on the homepage "Proof" section. */
  homepage_featured: boolean;
  status: IndustryStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Lightweight shape for the grid cards (no body). */
export type IndustryCard = Pick<
  Industry,
  | "slug"
  | "title"
  | "summary"
  | "bullets"
  | "icon"
  | "cover_image"
  | "icon_image"
  | "tags"
  | "service_slugs"
  | "position"
>;

/** One page of industries + pagination metadata. */
export interface IndustryPage {
  items: IndustryCard[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

/** Payload accepted by POST /api/industries (admin panel / n8n). */
export interface IndustryUpsert {
  slug: string;
  title: string;
  headline?: string | null;
  summary?: string | null;
  bullets?: string[];
  icon?: string | null;
  cover_image?: IndustryCover | null;
  icon_image?: IndustryCover | null;
  lead?: string | null;
  meta?: string | null;
  body_md?: string;
  tags?: string[];
  service_slugs?: string[];
  custom_services?: IndustryCustomService[];
  case_studies?: IndustryCaseStudy[];
  seo?: IndustrySeo;
  position?: number;
  homepage_featured?: boolean;
  status?: IndustryStatus;
  published_at?: string | null;
}
