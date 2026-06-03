import type { MetadataRoute } from "next";

import { listPublishedSlugs } from "@/lib/blog/db";
import { listPublishedServiceSlugs } from "@/lib/services/db";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,         lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/timeline`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/rag`,      lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/work`,     lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/faq`,      lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/blog`,     lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/contact`,  lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/privacy`,  lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,    lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/dpdp`,     lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
  ];

  let serviceSlugs: string[];
  try {
    serviceSlugs = await listPublishedServiceSlugs();
    if (!serviceSlugs.length) serviceSlugs = FALLBACK_SERVICE_SLUGS;
  } catch {
    serviceSlugs = FALLBACK_SERVICE_SLUGS;
  }

  let blogSlugs: string[];
  try {
    blogSlugs = await listPublishedSlugs();
    if (!blogSlugs.length) blogSlugs = FALLBACK_BLOG_SLUGS;
  } catch {
    blogSlugs = FALLBACK_BLOG_SLUGS;
  }

  const serviceRoutes: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${BASE}/services/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes];
}
