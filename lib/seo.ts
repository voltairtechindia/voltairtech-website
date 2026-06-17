/**
 * Shared SEO constants + helpers.
 *
 * - SITE_URL: canonical origin (no trailing slash).
 * - DEFAULT_OG_IMAGE: site-wide social card. Next merges `openGraph` shallowly,
 *   so any page that defines its own `openGraph` block drops the layout's image
 *   unless it re-declares one — pages reuse this to avoid imageless previews.
 * - breadcrumbLd: BreadcrumbList JSON-LD from a crumb trail (absolute URLs).
 */

export const SITE_URL = "https://voltairtech.com";

/** 1200x630 social card under /public/assets — resolved absolute via metadataBase. */
export const DEFAULT_OG_IMAGE = "/assets/og-image.jpg";

type Crumb = { label: string; href?: string };

/** Schema.org BreadcrumbList for a crumb trail; the current (href-less) crumb is name-only. */
export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${SITE_URL}${c.href}` } : {}),
    })),
  };
}
