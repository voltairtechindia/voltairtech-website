/** Shared types for DB-backed, admin-managed live projects. */

import type { MediaItem } from "@/lib/blog/types";

/**
 * A project's gallery item. Deliberately the SAME shape as a blog post's
 * media — an image, a self-hosted clip, or a YouTube/Vimeo embed — so the
 * admin's picker, the site's `toEmbedSrc` helper and the CSP frame-src list
 * are shared rather than re-declared per content type.
 */
export type { MediaItem };

export interface ProjectCover {
  url: string;
  alt?: string;
}

/** The downloadable feature brochure. `label` overrides the button copy. */
export interface ProjectBrochure {
  url: string;
  label?: string;
  size_bytes?: number;
  pages?: number;
}

export interface ProjectStat {
  value: string;
  label: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface ProjectSeo {
  title?: string;
  description?: string;
  og_image?: string;
}

/**
 * Where the product actually is — drives the status chip and the index LED.
 * Deliberately separate from `status`, which is about whether the row is
 * shown on the site at all.
 */
export type ProjectLifecycle = "live" | "shipped" | "build";

export type ProjectStatus = "draft" | "published" | "archived";

/** A full live-project row as stored in / returned from Supabase. */
export interface LiveProject {
  id: string;
  slug: string;
  name: string;
  kicker: string | null;
  tagline: string | null;
  summary: string | null;
  lifecycle: ProjectLifecycle;
  surfaces: string[];
  stack: string[];
  highlights: string[];
  stats: ProjectStat[];
  links: ProjectLink[];
  /** Horizontal media rail on the panel — screenshots, demos, walkthroughs. */
  media: MediaItem[];
  cover_image: ProjectCover | null;
  brochure: ProjectBrochure | null;
  tags: string[];
  seo: ProjectSeo;
  position: number;
  status: ProjectStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Payload accepted by POST /api/live-projects (admin panel / n8n). */
export interface LiveProjectUpsert {
  slug: string;
  name: string;
  kicker?: string | null;
  tagline?: string | null;
  summary?: string | null;
  lifecycle?: ProjectLifecycle;
  surfaces?: string[];
  stack?: string[];
  highlights?: string[];
  stats?: ProjectStat[];
  links?: ProjectLink[];
  media?: MediaItem[];
  cover_image?: ProjectCover | null;
  brochure?: ProjectBrochure | null;
  tags?: string[];
  seo?: ProjectSeo;
  position?: number;
  status?: ProjectStatus;
  published_at?: string | null;
}

export const LIFECYCLE_LABEL: Record<ProjectLifecycle, string> = {
  live: "Live",
  shipped: "Shipped",
  build: "In build",
};
