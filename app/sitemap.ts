import type { MetadataRoute } from "next";

import { listPublishedPosts } from "@/lib/blog/db";
import { listPublishedServiceSlugs } from "@/lib/services/db";
import {
  listPublishedCustomServiceParams,
  listPublishedIndustrySlugs,
} from "@/lib/industries/db";

const BASE = "https://voltairtech.com";

// Fallback slugs if the DB is unreachable at build.
const FALLBACK_BLOG_SLUGS = [
  "what-is-rag-india",
  "whatsapp-chatbot-business-india",
  "dpdp-act-2023-ai-compliance",
];
const FALLBACK_SERVICE_SLUGS = [
  "ai-websites",
  "ai-automation",
  "whatsapp-chatbot",
  "rag-systems",
  "mobile-apps",
  "custom-ai-software",
];
const FALLBACK_INDUSTRY_SLUGS = [
  "d2c-ecommerce",
  "healthcare-clinics",
  "fintech-payments",
  "real-estate",
  "education-edtech",
  "logistics-supply-chain",
  "professional-services",
  "hospitality-travel",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,           lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/about`,      lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/industries`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/services`,   lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/faq`,        lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/blog`,       lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/contact`,    lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/privacy`,    lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,      lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/sendzap/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/sendzap/terms`,   lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  let serviceSlugs: string[];
  try {
    serviceSlugs = await listPublishedServiceSlugs();
    if (!serviceSlugs.length) serviceSlugs = FALLBACK_SERVICE_SLUGS;
  } catch {
    serviceSlugs = FALLBACK_SERVICE_SLUGS;
  }

  let industrySlugs: string[];
  try {
    industrySlugs = await listPublishedIndustrySlugs();
    if (!industrySlugs.length) industrySlugs = FALLBACK_INDUSTRY_SLUGS;
  } catch {
    industrySlugs = FALLBACK_INDUSTRY_SLUGS;
  }

  // Blog entries carry their real publish date as lastmod (a genuine freshness
  // signal — far better than stamping `now` on every URL each deploy).
  let blogEntries: { slug: string; lastModified: Date }[];
  try {
    const { items } = await listPublishedPosts(1, 1000);
    blogEntries = items.length
      ? items.map((p) => ({
          slug: p.slug,
          lastModified: p.published_at ? new Date(p.published_at) : now,
        }))
      : FALLBACK_BLOG_SLUGS.map((slug) => ({ slug, lastModified: now }));
  } catch {
    blogEntries = FALLBACK_BLOG_SLUGS.map((slug) => ({ slug, lastModified: now }));
  }

  const serviceRoutes: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${BASE}/services/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const industryRoutes: MetadataRoute.Sitemap = industrySlugs.map((slug) => ({
    url: `${BASE}/industries/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Per-industry custom-service detail pages (best-effort — skip if unreachable).
  let customServiceRoutes: MetadataRoute.Sitemap = [];
  try {
    customServiceRoutes = (await listPublishedCustomServiceParams()).map(({ slug, service }) => ({
      url: `${BASE}/industries/${slug}/${service}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    customServiceRoutes = [];
  }

  const blogRoutes: MetadataRoute.Sitemap = blogEntries.map(({ slug, lastModified }) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...industryRoutes,
    ...customServiceRoutes,
    ...serviceRoutes,
    ...blogRoutes,
  ];
}
