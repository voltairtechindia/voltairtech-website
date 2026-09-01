/** Shared types for DB-backed, admin-managed services. */

import type { FaqItem } from "@/lib/faq/types";
import type { MediaItem } from "@/lib/blog/types";

export type { FaqItem, MediaItem };

export interface ServiceCover {
  url: string;
  alt?: string;
}

export interface ServiceSeo {
  title?: string;
  description?: string;
  og_image?: string;
}

export type ServiceStatus = "draft" | "published" | "archived";

/** A full service row as stored in / returned from Supabase. */
export interface Service {
  id: string;
  slug: string;
  title: string;
  headline: string | null;
  summary: string | null;
  bullets: string[];
  eta: string | null;
  icon: string;
  cover_image: ServiceCover | null;
  /** Photo/video gallery shown on /services/<slug>. Same shape as a post's media. */
  media: MediaItem[];
  lead: string | null;
  meta: string | null;
  body_md: string;
  price: string | null;
  tags: string[];
  seo: ServiceSeo;
  /** Q&A shown as an accordion + FAQPage JSON-LD on /services/<slug>. */
  faq: FaqItem[];
  position: number;
  status: ServiceStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Lightweight shape for the grid cards (no body). */
export type ServiceCard = Pick<
  Service,
  | "slug"
  | "title"
  | "summary"
  | "bullets"
  | "eta"
  | "icon"
  | "cover_image"
  | "media"
  | "tags"
  | "position"
>;

/** One page of services + pagination metadata. */
export interface ServicePage {
  items: ServiceCard[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

/** Payload accepted by POST /api/services (admin panel / n8n). */
export interface ServiceUpsert {
  slug: string;
  title: string;
  headline?: string | null;
  summary?: string | null;
  bullets?: string[];
  eta?: string | null;
  icon?: string | null;
  cover_image?: ServiceCover | null;
  media?: MediaItem[];
  lead?: string | null;
  meta?: string | null;
  body_md?: string;
  price?: string | null;
  tags?: string[];
  seo?: ServiceSeo;
  faq?: FaqItem[];
  position?: number;
  status?: ServiceStatus;
  published_at?: string | null;
}
