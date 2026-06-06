/**
 * Lightweight, cached nav data for the site header dropdowns.
 *
 * The Nav renders on every page (incl. statically-generated marketing pages),
 * so we never want to hit Supabase per-request. `unstable_cache` lets the
 * published industries/services be fetched once and reused across renders,
 * revalidated on a window and bustable on-demand via the "nav-groups" tag
 * (the admin panel can ping /api/revalidate after editing). Any failure
 * degrades gracefully to empty groups so the header always renders.
 */
import { unstable_cache } from "next/cache";

import { listPublishedIndustries } from "@/lib/industries/db";
import { listPublishedServices } from "@/lib/services/db";

export type NavChild = { label: string; href: string; blurb?: string };

export interface NavGroups {
  industries: NavChild[];
  services: NavChild[];
}

const MAX_ITEMS = 8;

async function fetchNavGroups(): Promise<NavGroups> {
  try {
    const [ind, svc] = await Promise.all([
      listPublishedIndustries(1, MAX_ITEMS),
      listPublishedServices(1, MAX_ITEMS),
    ]);
    return {
      industries: ind.items.map((i) => ({
        label: i.title,
        href: `/industries/${i.slug}`,
        blurb: i.summary ?? undefined,
      })),
      services: svc.items.map((s) => ({
        label: s.title,
        href: `/services/${s.slug}`,
        blurb: s.summary ?? undefined,
      })),
    };
  } catch {
    return { industries: [], services: [] };
  }
}

/** Cached nav groups (industries + services) for the header dropdowns. */
export const getNavGroups = unstable_cache(fetchNavGroups, ["nav-groups"], {
  revalidate: 300,
  tags: ["nav-groups"],
});
