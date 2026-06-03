/** Shared types for DB-backed, admin-managed services. */

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
  lead: string | null;
  meta: string | null;
  body_md: string;
  price: string | null;
  tags: string[];
  seo: ServiceSeo;
  position: number;
  status: ServiceStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Lightweight shape for the grid cards (no body). */
export type ServiceCard = Pick<
  Service,
  "slug" | "title" | "summary" | "bullets" | "eta" | "icon" | "cover_image" | "tags" | "position"
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
  lead?: string | null;
  meta?: string | null;
  body_md?: string;
  price?: string | null;
  tags?: string[];
  seo?: ServiceSeo;
  position?: number;
  status?: ServiceStatus;
  published_at?: string | null;
}
