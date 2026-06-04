/** Shared types for DB-backed, admin-managed industries (a sector lens over services). */

export interface IndustryCover {
  url: string;
  alt?: string;
}

export interface IndustrySeo {
  title?: string;
  description?: string;
  og_image?: string;
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
  lead: string | null;
  meta: string | null;
  body_md: string;
  tags: string[];
  service_slugs: string[];
  seo: IndustrySeo;
  position: number;
  status: IndustryStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Lightweight shape for the grid cards (no body). */
export type IndustryCard = Pick<
  Industry,
  "slug" | "title" | "summary" | "bullets" | "icon" | "cover_image" | "tags" | "service_slugs" | "position"
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
  lead?: string | null;
  meta?: string | null;
  body_md?: string;
  tags?: string[];
  service_slugs?: string[];
  seo?: IndustrySeo;
  position?: number;
  status?: IndustryStatus;
  published_at?: string | null;
}
