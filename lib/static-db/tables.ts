/**
 * The content snapshot the static site is built from (content/db/*.json).
 *
 * Rebuilt from the repo's own seed and copy scripts (supabase/seed-*.mjs, then
 * rewrite-copy.mjs and remove-pricing.mjs), replayed in the order they ran
 * against the live database. Edit these files to change what the site shows;
 * the next push redeploys it.
 *
 * `job_openings` is present and empty, so /career shows no openings. Live
 * projects are deliberately absent: their reads fail the way they did with the
 * database down, and every caller then uses lib/live-projects/fallback.ts.
 */
import blogPosts from "@/content/db/blog_posts.json";
import industries from "@/content/db/industries.json";
import services from "@/content/db/services.json";
import siteFaqs from "@/content/db/site_faqs.json";

import type { Row, Tables } from "./postgrest";

export function staticTables(): Tables {
  return {
    services: services as Row[],
    industries: industries as Row[],
    site_faqs: siteFaqs as Row[],
    blog_posts: blogPosts as Row[],
    job_openings: [],
  };
}
