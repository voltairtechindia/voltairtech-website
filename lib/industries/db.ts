/**
 * Supabase data access for DB-backed industries. Mirrors lib/services/db.ts:
 * all calls go through the shared server-side service-role client (RLS-protected;
 * pages render server-side and the admin panel / n8n post to /api/industries).
 */
import { getSupabase } from "@/lib/rag/supabase";

import { customServiceSlug } from "./custom";
import { customServiceShouldIndex, industryShouldIndex } from "./indexing";
import type {
  Industry,
  IndustryCard,
  IndustryCaseStudy,
  IndustryCover,
  IndustryCustomService,
  IndustryPage,
  IndustrySeo,
  IndustryUpsert,
} from "./types";

/** A case study lifted onto the homepage, tagged with its parent sector. */
export interface FeaturedCaseStudy extends IndustryCaseStudy {
  industrySlug: string;
  industryTitle: string;
  /** Industry cover image for the homepage card; null falls back to a bundled illustration. */
  coverImage: IndustryCover | null;
}

const CARD_COLUMNS =
  "slug, title, summary, bullets, icon, cover_image, media, icon_image, tags, service_slugs, position";

/** 8 = a full 4 x 2 grid on wide desktop (the shared `.svc-grid`). */
export const DEFAULT_PER_PAGE = 8;

/** Published industries for the grid, ordered by `position`, paginated. */
export async function listPublishedIndustries(
  page = 1,
  perPage = DEFAULT_PER_PAGE,
): Promise<IndustryPage> {
  const sb = getSupabase();
  const p = Math.max(1, Math.floor(page));
  const from = (p - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await sb
    .from("industries")
    .select(CARD_COLUMNS, { count: "exact" })
    .eq("status", "published")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
    .range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  return {
    items: (data ?? []) as IndustryCard[],
    total,
    page: p,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

/**
 * The first case study from each industry flagged `homepage_featured` in the
 * admin — surfaced on the homepage as proof. Ordered by industry `position`
 * (asc). Industries without a case study are skipped. Which sectors appear, in
 * what order, and their content + card image are all admin-controlled (no
 * hardcoded slugs): tick "Feature on homepage" in voltairtech-admin.
 */
export async function getFeaturedCaseStudies(limit = 3): Promise<FeaturedCaseStudy[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("industries")
    .select("slug, title, case_studies, cover_image")
    .eq("status", "published")
    .eq("homepage_featured", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;

  const rows = (data ?? []) as {
    slug: string;
    title: string;
    case_studies: IndustryCaseStudy[] | null;
    cover_image: IndustryCover | null;
  }[];

  const out: FeaturedCaseStudy[] = [];
  for (const r of rows) {
    const cs = (r.case_studies ?? [])[0];
    if (!cs) continue;
    out.push({
      ...cs,
      industrySlug: r.slug,
      industryTitle: r.title,
      coverImage: r.cover_image,
    });
    if (out.length >= limit) break;
  }
  return out;
}

/** Titles of all published industries, ordered by `position` (for page metadata). */
export async function listPublishedIndustryTitles(): Promise<string[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("industries")
    .select("title")
    .eq("status", "published")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as { title: string }[]).map((r) => r.title);
}

/**
 * Every published industry as a `{ slug, title }` pair, in order — lets the
 * /contact form resolve `?industry=<slug>` into a sector name to prefill with.
 */
export async function listPublishedIndustryOptions(): Promise<
  { slug: string; title: string }[]
> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("industries")
    .select("slug, title")
    .eq("status", "published")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as { slug: string; title: string }[];
}

/** Slugs of all published industries (for static params — index or not). */
export async function listPublishedIndustrySlugs(): Promise<string[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("industries")
    .select("slug")
    .eq("status", "published");
  if (error) throw error;
  return ((data ?? []) as { slug: string }[]).map((r) => r.slug);
}

/**
 * Slugs of published industries that are *indexable* (not `seo.noindex`) — the
 * sitemap should only advertise pages we actually want Google to index.
 */
export async function listIndexableIndustrySlugs(): Promise<string[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("industries")
    .select("slug, seo")
    .eq("status", "published");
  if (error) throw error;
  return ((data ?? []) as { slug: string; seo: IndustrySeo | null }[])
    .filter((r) => industryShouldIndex(r.seo))
    .map((r) => r.slug);
}

/** `{ slug, service }` params for every published industry's custom-service detail pages. */
export async function listPublishedCustomServiceParams(): Promise<
  { slug: string; service: string }[]
> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("industries")
    .select("slug, custom_services")
    .eq("status", "published");
  if (error) throw error;
  const rows = (data ?? []) as { slug: string; custom_services: IndustryCustomService[] | null }[];
  return rows.flatMap((r) =>
    (r.custom_services ?? []).map((cs) => ({ slug: r.slug, service: customServiceSlug(cs) })),
  );
}

/**
 * `{ slug, service }` params for only the *indexable* custom-service sub-pages —
 * thin sub-pages are noindexed, so the sitemap must not list them. A noindexed
 * parent industry hides all of its sub-pages here too.
 */
export async function listIndexableCustomServiceParams(): Promise<
  { slug: string; service: string }[]
> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("industries")
    .select("slug, custom_services, seo")
    .eq("status", "published");
  if (error) throw error;
  const rows = (data ?? []) as {
    slug: string;
    custom_services: IndustryCustomService[] | null;
    seo: IndustrySeo | null;
  }[];
  return rows.flatMap((r) => {
    if (!industryShouldIndex(r.seo)) return [];
    return (r.custom_services ?? [])
      .filter((cs) => customServiceShouldIndex(cs))
      .map((cs) => ({ slug: r.slug, service: customServiceSlug(cs) }));
  });
}

/** A single published industry by slug, or null. */
export async function getPublishedIndustry(slug: string): Promise<Industry | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("industries")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as Industry) ?? null;
}

/** Current `position` for a slug (any status), or null if no such industry. */
export async function getIndustryPosition(slug: string): Promise<number | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("industries")
    .select("position")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? (data as { position: number }).position : null;
}

/** Next free `position` so a new industry appends to the end of the list. */
export async function nextIndustryPosition(): Promise<number> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("industries")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  const max = data ? (data as { position: number }).position : null;
  return (max ?? 0) + 1;
}

/**
 * Rewrite the grid order: the given slugs become position 1..N (first = first
 * card). Slugs not listed keep their current position. Called by the
 * admin-gated POST /api/industries/reorder.
 */
export async function setIndustryPositions(order: string[]): Promise<void> {
  const sb = getSupabase();
  for (let i = 0; i < order.length; i += 1) {
    const slug = order[i];
    const { error } = await sb
      .from("industries")
      .update({ position: i + 1 })
      .eq("slug", slug);
    if (error) throw error;
  }
}

/** Insert or update an industry by slug. Returns the stored row (admin-gated route). */
export async function upsertIndustry(row: IndustryUpsert): Promise<Industry> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("industries")
    .upsert(row, { onConflict: "slug" })
    .select("*")
    .single();
  if (error) throw error;
  return data as Industry;
}
