/**
 * Supabase data access for the dynamic blog. All calls go through the shared
 * server-side service-role client (RLS-protected; the browser never reads the
 * DB directly — pages render server-side and the admin panel / n8n post to
 * /api/blog).
 */
import { getSupabase } from "@/lib/rag/supabase";

import type { BlogIndex, BlogPost, BlogPostCard, BlogUpsert } from "./types";

const CARD_COLUMNS =
  "slug, title, excerpt, cover_image, tags, author, reading_minutes, published_at";

export const DEFAULT_PER_PAGE = 6;

/** Published posts, newest first, as a paginated page of listing cards. */
export async function listPublishedPosts(
  page = 1,
  perPage = DEFAULT_PER_PAGE,
): Promise<BlogIndex> {
  const sb = getSupabase();
  const p = Math.max(1, Math.floor(page));
  const from = (p - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await sb
    .from("blog_posts")
    .select(CARD_COLUMNS, { count: "exact" })
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  return {
    items: (data ?? []) as BlogPostCard[],
    total,
    page: p,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

/** Slugs of all published posts (for sitemap + static params). */
export async function listPublishedSlugs(): Promise<string[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("blog_posts")
    .select("slug")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString());
  if (error) throw error;
  return ((data ?? []) as { slug: string }[]).map((r) => r.slug);
}

/** A single published post by slug, or null if missing / not yet published. */
export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as BlogPost) ?? null;
}

/** Up to `limit` other published posts (for the "Read next" rail). */
export async function listRelatedPosts(
  excludeSlug: string,
  limit = 3,
): Promise<BlogPostCard[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("blog_posts")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .neq("slug", excludeSlug)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as BlogPostCard[];
}

/**
 * Insert or update a post by slug. Returns the stored row. Used by the
 * admin-gated /api/blog route (the admin panel + n8n target).
 */
export async function upsertPost(
  post: BlogUpsert & { reading_minutes: number | null },
): Promise<BlogPost> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("blog_posts")
    .upsert(post, { onConflict: "slug" })
    .select("*")
    .single();
  if (error) throw error;
  return data as BlogPost;
}
