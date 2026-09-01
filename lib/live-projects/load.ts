/**
 * The one read path for the published portfolio, shared by the index and the
 * per-project pages.
 *
 * Both surfaces want the WHOLE list: the index draws the contact sheet from it,
 * and a detail page needs its neighbours for the "previous / next" pager and
 * its own position in the run. The list is a dozen rows, so one query serves
 * both rather than a second lookup per slug.
 */
import { listPublishedProjects } from "./db";
import { FALLBACK_PROJECTS } from "./fallback";
import type { LiveProject } from "./types";

/** Published projects in page order; falls back to the seed list. */
export async function loadProjects(): Promise<LiveProject[]> {
  try {
    const rows = await listPublishedProjects();
    if (rows.length) return rows;
  } catch (err) {
    console.error("[live-projects] load failed, using fallback", err);
  }
  return FALLBACK_PROJECTS;
}

/** A project plus where it sits in the run, or null if the slug is unknown. */
export async function loadProjectWithNeighbours(slug: string): Promise<{
  project: LiveProject;
  index: number;
  total: number;
  prev: LiveProject | null;
  next: LiveProject | null;
} | null> {
  const all = await loadProjects();
  const index = all.findIndex((p) => p.slug === slug);
  if (index < 0) return null;
  return {
    project: all[index],
    index,
    total: all.length,
    prev: all[index - 1] ?? null,
    next: all[index + 1] ?? null,
  };
}
