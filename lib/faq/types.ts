/**
 * Shared FAQ types.
 *
 * `FaqItem` is the one Q&A shape used everywhere a page carries its own FAQ:
 * blog posts (`blog_posts.faq`), services (`services.faq`), industries
 * (`industries.faq`) and their sector-only sub-services (inside
 * `custom_services`). Every one of those renders an accordion + FAQPage JSON-LD
 * and folds the pairs into that record's RAG embedding.
 *
 * `SiteFaq` is a row of the standalone /faq page (`site_faqs`) — its own record
 * rather than a field on something else, because those questions belong to the
 * business, not to one service or article.
 */

/** One question/answer pair. Both fields are required to survive normalisation. */
export interface FaqItem {
  q: string;
  a: string;
}

export type SiteFaqStatus = "draft" | "published" | "archived";

/** A full /faq row as stored in / returned from Supabase. */
export interface SiteFaq {
  id: string;
  slug: string;
  question: string;
  answer: string;
  /** Optional group heading on /faq ("Pricing", "Process", …). Ungrouped when null. */
  category: string | null;
  tags: string[];
  position: number;
  /** Also surface this question in the home page's FAQ block. */
  homepage_featured: boolean;
  status: SiteFaqStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Payload accepted by POST /api/faqs (admin panel / n8n). */
export interface SiteFaqUpsert {
  slug: string;
  question: string;
  answer: string;
  category?: string | null;
  tags?: string[];
  position?: number;
  homepage_featured?: boolean;
  status?: SiteFaqStatus;
  published_at?: string | null;
}

/** /faq rows grouped under their category heading, in page order. */
export interface SiteFaqGroup {
  category: string | null;
  items: SiteFaq[];
}

/**
 * Group published rows by `category`, preserving the position order both
 * between groups (a group sits where its first question sits) and within them.
 * Uncategorised questions collapse into a single leading `null` group.
 */
export function groupSiteFaqs(items: SiteFaq[]): SiteFaqGroup[] {
  const groups: SiteFaqGroup[] = [];
  const byCategory = new Map<string | null, SiteFaqGroup>();
  for (const item of items) {
    const key = item.category?.trim() ? item.category.trim() : null;
    let group = byCategory.get(key);
    if (!group) {
      group = { category: key, items: [] };
      byCategory.set(key, group);
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}
