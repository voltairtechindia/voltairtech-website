/**
 * Supabase data access for DB-backed services. All calls go through the shared
 * server-side service-role client (RLS-protected; pages render server-side and
 * the admin panel / n8n post to /api/services).
 */
import { getSupabase } from "@/lib/rag/supabase";

import type { Service, ServiceCard, ServicePage, ServiceUpsert } from "./types";

const CARD_COLUMNS =
  "slug, title, summary, bullets, eta, icon, cover_image, tags, position";

/** 8 = a full 4 x 2 grid on wide desktop (see `.svc-grid`). */
export const DEFAULT_PER_PAGE = 8;

/** Published services for the grid, ordered by `position`, paginated. */
export async function listPublishedServices(
  page = 1,
  perPage = DEFAULT_PER_PAGE,
): Promise<ServicePage> {
  const sb = getSupabase();
  const p = Math.max(1, Math.floor(page));
  const from = (p - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await sb
    .from("services")
    .select(CARD_COLUMNS, { count: "exact" })
    .eq("status", "published")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
    .range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  return {
    items: (data ?? []) as ServiceCard[],
    total,
    page: p,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

/**
 * Published service cards for a set of slugs (used by /industries/<slug> to show
 * the sector's curated subset). Returned in the order the slugs were given —
 * the admin controls the order via the industry's `service_slugs` array — and
 * silently drops any slug that's missing or no longer published.
 */
export async function getPublishedServiceCardsBySlugs(
  slugs: string[],
): Promise<ServiceCard[]> {
  const wanted = slugs.filter(Boolean);
  if (!wanted.length) return [];
  const sb = getSupabase();
  const { data, error } = await sb
    .from("services")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .in("slug", wanted);
  if (error) throw error;

  const bySlug = new Map((data ?? []).map((r) => [(r as ServiceCard).slug, r as ServiceCard]));
  return wanted.map((s) => bySlug.get(s)).filter((s): s is ServiceCard => Boolean(s));
}

/** Slugs of all published services (for sitemap + static params). */
export async function listPublishedServiceSlugs(): Promise<string[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("services")
    .select("slug")
    .eq("status", "published");
  if (error) throw error;
  return ((data ?? []) as { slug: string }[]).map((r) => r.slug);
}

/**
 * Every published service as a `{ slug, title }` pair, in catalogue order — the
 * lead form's service picker (components/LeadForm.tsx). Deliberately two columns
 * rather than a card: this runs on pages that only need the labels.
 */
export async function listPublishedServiceOptions(): Promise<
  { slug: string; title: string }[]
> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("services")
    .select("slug, title")
    .eq("status", "published")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as { slug: string; title: string }[];
}

/** A single published service by slug, or null. */
export async function getPublishedService(slug: string): Promise<Service | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as Service) ?? null;
}

/** Current `position` for a slug (any status), or null if no such service. */
export async function getServicePosition(slug: string): Promise<number | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("services")
    .select("position")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? (data as { position: number }).position : null;
}

/** Next free `position` so a new service appends to the end of the list. */
export async function nextServicePosition(): Promise<number> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("services")
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
 * admin-gated POST /api/services/reorder.
 */
export async function setServicePositions(order: string[]): Promise<void> {
  const sb = getSupabase();
  for (let i = 0; i < order.length; i += 1) {
    const slug = order[i];
    const { error } = await sb
      .from("services")
      .update({ position: i + 1 })
      .eq("slug", slug);
    if (error) throw error;
  }
}

/** Insert or update a service by slug. Returns the stored row (admin-gated route). */
export async function upsertService(post: ServiceUpsert): Promise<Service> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("services")
    .upsert(post, { onConflict: "slug" })
    .select("*")
    .single();
  if (error) throw error;
  return data as Service;
}
