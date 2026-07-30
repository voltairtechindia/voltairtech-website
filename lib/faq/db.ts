/**
 * Supabase data access for the DB-backed /faq page. All calls go through the
 * shared server-side service-role client (RLS-protected; pages render
 * server-side and the admin panel / n8n post to /api/faqs).
 */
import { getSupabase } from "@/lib/rag/supabase";

import type { SiteFaq, SiteFaqUpsert } from "./types";

/** Published questions for /faq, in admin-controlled order. */
export async function listPublishedSiteFaqs(): Promise<SiteFaq[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("site_faqs")
    .select("*")
    .eq("status", "published")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SiteFaq[];
}

/** The subset flagged for the home page's FAQ block, in the same order. */
export async function listHomepageSiteFaqs(): Promise<SiteFaq[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("site_faqs")
    .select("*")
    .eq("status", "published")
    .eq("homepage_featured", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SiteFaq[];
}

/** A single published question by slug, or null. */
export async function getPublishedSiteFaq(slug: string): Promise<SiteFaq | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("site_faqs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as SiteFaq) ?? null;
}

/** Current `position` for a slug (any status), or null if no such question. */
export async function getSiteFaqPosition(slug: string): Promise<number | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("site_faqs")
    .select("position")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? (data as { position: number }).position : null;
}

/** Next free `position` so a new question appends to the end of the page. */
export async function nextSiteFaqPosition(): Promise<number> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("site_faqs")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  const max = data ? (data as { position: number }).position : null;
  return (max ?? 0) + 1;
}

/**
 * Rewrite the /faq order: the given slugs become position 1..N (first = first
 * question). Slugs not listed keep their current position. Called by the
 * admin-gated POST /api/faqs/reorder.
 */
export async function setSiteFaqPositions(order: string[]): Promise<void> {
  const sb = getSupabase();
  for (let i = 0; i < order.length; i += 1) {
    const { error } = await sb
      .from("site_faqs")
      .update({ position: i + 1 })
      .eq("slug", order[i]);
    if (error) throw error;
  }
}

/** Insert or update a question by slug. Returns the stored row (admin-gated route). */
export async function upsertSiteFaq(faq: SiteFaqUpsert): Promise<SiteFaq> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("site_faqs")
    .upsert(faq, { onConflict: "slug" })
    .select("*")
    .single();
  if (error) throw error;
  return data as SiteFaq;
}
