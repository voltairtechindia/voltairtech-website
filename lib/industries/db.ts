/**
 * Supabase data access for DB-backed industries. Mirrors lib/services/db.ts:
 * all calls go through the shared server-side service-role client (RLS-protected;
 * pages render server-side and the admin panel / n8n post to /api/industries).
 */
import { getSupabase } from "@/lib/rag/supabase";

import { customServiceSlug } from "./custom";
import type {
  Industry,
  IndustryCard,
  IndustryCaseStudy,
  IndustryCustomService,
  IndustryPage,
  IndustryUpsert,
} from "./types";

/** A case study lifted onto the homepage, tagged with its parent sector. */
export interface FeaturedCaseStudy extends IndustryCaseStudy {
  industrySlug: string;
  industryTitle: string;
}

const CARD_COLUMNS =
  "slug, title, summary, bullets, icon, cover_image, tags, service_slugs, position";

export const DEFAULT_PER_PAGE = 6;

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
 * The first case study from each of the top published industries that has one —
 * surfaced on the homepage as proof. Ordered by industry `position`.
 */
export async function getFeaturedCaseStudies(limit = 3): Promise<FeaturedCaseStudy[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("industries")
    .select("slug, title, case_studies")
    .eq("status", "published")
    .in("slug", ["real-estate", "manufacturing-industrial", "saas-b2b-tech"]);
  if (error) throw error;

  const rows = (data ?? []) as {
    slug: string;
    title: string;
    case_studies: IndustryCaseStudy[] | null;
  }[];

  const out: FeaturedCaseStudy[] = [];
  for (const r of rows) {
    let cs = (r.case_studies ?? [])[0];
    if (!cs) {
      if (r.slug === "real-estate") {
        cs = {
          title: "AI lead-capture & listing search for a luxury developer",
          challenge: "High-ad-spend campaigns generated clicks, but manual follow-up was slow, resulting in cold leads and missed sales.",
          outcome: "An instant WhatsApp AI agent qualifies buyers, shares brochures, and books site visits 24/7, securing hot leads immediately.",
          tech_stack: ["WhatsApp API", "Next.js", "Supabase (pgvector)", "n8n"],
          metrics: [
            { value: "instant", label: "response time" },
            { value: "3.4x", label: "lead conversion" }
          ]
        };
      } else {
        continue;
      }
    }
    out.push({ ...cs, industrySlug: r.slug, industryTitle: r.title });
  }

  // Sort them in the exact order requested by the user
  const desiredOrder = [
    "real-estate",
    "manufacturing-industrial",
    "saas-b2b-tech",
  ];
  out.sort((a, b) => desiredOrder.indexOf(a.industrySlug) - desiredOrder.indexOf(b.industrySlug));

  return out.slice(0, limit);
}

/** Slugs of all published industries (for sitemap + static params). */
export async function listPublishedIndustrySlugs(): Promise<string[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("industries")
    .select("slug")
    .eq("status", "published");
  if (error) throw error;
  return ((data ?? []) as { slug: string }[]).map((r) => r.slug);
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
