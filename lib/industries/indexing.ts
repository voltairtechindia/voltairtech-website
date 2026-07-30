/**
 * Shared "should this page be indexed by Google?" logic for industry pages and
 * their sector-only custom-service sub-pages. One source of truth used by both
 * the page `generateMetadata` (robots tag) and the sitemap (which URLs to list),
 * so the two can never disagree.
 *
 * Why: an industry can spin up ~12 custom-service sub-pages
 * (/industries/<industry>/<service>). With 13 industries that's 140+ auto-
 * generated pages. When those pages are thin (a one-line summary + a few
 * bullets + boilerplate) and near-identical in structure, Google can treat them
 * as low-quality/doorway pages and discount the whole domain. So we noindex the
 * thin ones by default and only surface pages that carry genuine unique content,
 * with an explicit admin override either way.
 */
import { markdownToPlainText } from "@/lib/blog/util";
import { faqToPlainText } from "@/lib/faq/normalize";

import type { IndustryCustomService, IndustrySeo } from "./types";

/**
 * Minimum unique body prose (plain-text characters) a custom-service sub-page
 * needs before it's allowed into Google's index. ~600 chars ≈ 100 words of real
 * content beyond the summary/bullets template.
 */
export const MIN_CUSTOM_SERVICE_BODY = 600;

/**
 * Plain-text length of a custom service's unique prose (0 when empty). The FAQ
 * counts: hand-written answers are exactly the kind of unique, useful content
 * the gate is looking for, and they're what an answer engine quotes.
 */
export function customServiceBodyLength(
  cs: Pick<IndustryCustomService, "body_md" | "faq">,
): number {
  return (
    markdownToPlainText(cs.body_md ?? "").length + faqToPlainText(cs.faq).length
  );
}

/**
 * Whether a custom-service sub-page should be indexable.
 * - `cs.index === true|false` → explicit admin override wins.
 * - otherwise auto: index only once it has real, unique body prose.
 */
export function customServiceShouldIndex(
  cs: Pick<IndustryCustomService, "index" | "body_md" | "faq">,
): boolean {
  if (typeof cs.index === "boolean") return cs.index;
  return customServiceBodyLength(cs) >= MIN_CUSTOM_SERVICE_BODY;
}

/**
 * Whether an industry detail page should be indexable. Industry pages are rich
 * (linked services + case studies + body) so they default to indexable; the
 * admin can force-hide one via `seo.noindex`.
 */
export function industryShouldIndex(seo: IndustrySeo | null | undefined): boolean {
  return seo?.noindex !== true;
}
