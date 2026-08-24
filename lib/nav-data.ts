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

/**
 * Cached nav groups (industries + services) for the header dropdowns.
 *
 * ⚠️ This window is the CEILING FOR THE WHOLE SITE, not just the header. Nav
 * renders on effectively every page, and Next takes the MINIMUM revalidate
 * across everything cached in a route — so while this was 300 the homepage's
 * declared 3600 and every other page's window were silently overridden to 5
 * minutes, and every page regenerated 288x/day under paid traffic. That was
 * invisible: each page's own `export const revalidate` still read correctly in
 * source. It is only observable in .next/prerender-manifest.json.
 *
 * A long window costs nothing in freshness because the "nav-groups" tag is
 * busted on demand: /api/revalidate calls revalidateTag("nav-groups") whenever
 * an /industries or /services path is revalidated, so an edit still shows up
 * immediately. Raise the pages' own windows to tune them — not this one.
 */
export const getNavGroups = unstable_cache(fetchNavGroups, ["nav-groups"], {
  revalidate: 3600,
  tags: ["nav-groups"],
});
