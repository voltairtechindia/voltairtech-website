/**
 * Helpers for an industry's inline custom services. They live in the industry's
 * `custom_services` JSONB (no table of their own) but get a real detail page at
 * /industries/<industry>/<service>, so we resolve a stable slug per entry and
 * look one up by slug.
 */
import { slugify } from "@/lib/blog/util";

import type { Industry, IndustryCustomService } from "./types";

/** Stable URL slug for a custom service — its stored slug, else derived from the title. */
export function customServiceSlug(cs: IndustryCustomService): string {
  return cs.slug || slugify(cs.title);
}

/** Find a custom service within an industry by its resolved slug, or null. */
export function findCustomService(
  ind: Pick<Industry, "custom_services">,
  serviceSlug: string,
): IndustryCustomService | null {
  const target = slugify(serviceSlug);
  return (ind.custom_services ?? []).find((cs) => customServiceSlug(cs) === target) ?? null;
}
