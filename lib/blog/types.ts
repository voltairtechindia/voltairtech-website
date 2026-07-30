/** Shared types for the dynamic blog (DB rows <-> rendered posts). */

// The Q&A shape is shared with services, industries, and the /faq page — it
// lives in lib/faq/types.ts and is re-exported here for existing importers.
import type { FaqItem } from "@/lib/faq/types";

export type { FaqItem };

export interface CoverImage {
  url: string;
  alt?: string;
}

/** One item in a post's media gallery: a photo, a self-hosted video, or an embed. */
export type MediaItem =
  | { type: "image"; url: string; alt?: string; caption?: string }
  | { type: "video"; url: string; poster?: string; caption?: string }
  | {
      type: "embed";
      url: string;
      provider?: "youtube" | "vimeo" | string;
      caption?: string;
    };

export interface BlogSeo {
  title?: string;
  description?: string;
  og_image?: string;
}

export type BlogStatus = "draft" | "published" | "archived";

/** A full blog post as stored in / returned from Supabase. */
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string;
  cover_image: CoverImage | null;
  media: MediaItem[];
  tags: string[];
  author: string;
  seo: BlogSeo;
  faq: FaqItem[];
  status: BlogStatus;
  /** Manual blog-index order: 1 = first card, null = unpinned (date order). */
  pin_position: number | null;
  reading_minutes: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Lightweight shape used for listing cards (no body). */
export type BlogPostCard = Pick<
  BlogPost,
  | "slug"
  | "title"
  | "excerpt"
  | "cover_image"
  | "tags"
  | "author"
  | "reading_minutes"
  | "published_at"
>;

/** A page of listing cards plus pagination metadata (blog index). */
export interface BlogIndex {
  items: BlogPostCard[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

/** Payload accepted by POST /api/blog (from the admin panel or n8n). */
export interface BlogUpsert {
  slug: string;
  title: string;
  excerpt?: string | null;
  body_md?: string;
  cover_image?: CoverImage | null;
  media?: MediaItem[];
  tags?: string[];
  author?: string;
  seo?: BlogSeo;
  faq?: FaqItem[];
  status?: BlogStatus;
  pin_position?: number | null;
  reading_minutes?: number | null;
  published_at?: string | null;
}
