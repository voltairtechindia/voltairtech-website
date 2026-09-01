/**
 * Supabase data access for DB-backed live projects. All calls go through the
 * shared server-side service-role client (RLS-protected; the page renders
 * server-side and the admin panel posts to /api/live-projects).
 */
import { getSupabase } from "@/lib/rag/supabase";

import type { LiveProject, LiveProjectUpsert } from "./types";

/** Published projects in page order. */
export async function listPublishedProjects(): Promise<LiveProject[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("live_projects")
    .select("*")
    .eq("status", "published")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as LiveProject[];
}

/** Current `position` for a slug (any status), or null if no such project. */
export async function getProjectPosition(slug: string): Promise<number | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("live_projects")
    .select("position")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? (data as { position: number }).position : null;
}

/** Next free `position` so a new project appends to the end of the page. */
export async function nextProjectPosition(): Promise<number> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("live_projects")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  const max = data ? (data as { position: number }).position : null;
  return (max ?? 0) + 1;
}

/**
 * Rewrite the page order: the given slugs become position 1..N (first = first
 * spread). Slugs not listed keep their current position. Called by the
 * admin-gated POST /api/live-projects/reorder.
 */
export async function setProjectPositions(order: string[]): Promise<void> {
  const sb = getSupabase();
  for (let i = 0; i < order.length; i += 1) {
    const { error } = await sb
      .from("live_projects")
      .update({ position: i + 1 })
      .eq("slug", order[i]);
    if (error) throw error;
  }
}

/** Insert or update a project by slug. Returns the stored row (admin-gated route). */
export async function upsertProject(row: LiveProjectUpsert): Promise<LiveProject> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("live_projects")
    .upsert(row, { onConflict: "slug" })
    .select("*")
    .single();
  if (error) throw error;
  return data as LiveProject;
}
