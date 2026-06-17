/**
 * Dynamic /llms.txt — the llmstxt.org manifest that helps LLMs / answer engines
 * (ChatGPT, Perplexity, Google AI Overviews, etc.) understand Voltair Tech and
 * find the right pages. Generated from the DB so newly published services,
 * industries, and blog posts show up automatically (good for GEO/AEO). Falls
 * back to a static skeleton if the DB is unreachable so it never 500s.
 */
import { listPublishedPosts } from "@/lib/blog/db";
import { listPublishedIndustries } from "@/lib/industries/db";
import { listPublishedServices } from "@/lib/services/db";

export const runtime = "nodejs";
// Regenerate at most hourly; new published content appears within the window.
export const revalidate = 3600;

const SITE_URL = "https://voltairtech.com";

const HEADER = `# Voltair Tech

> Voltair Tech is a Mumbai-based AI build studio that ships production-ready AI apps, chatbots, RAG systems, and automations — websites in 48 hours. Indian operators, global standards. Serving clients across India, the EU, and APAC.

## About
- Location: Andheri West, Mumbai, Maharashtra 400053, India
- Contact: business@voltairtech.com · +91 70210 00764 (call/WhatsApp)
- Hours: Mon–Sat, 10:00–20:00 IST
- Languages: English, Hindi, Marathi
- Tagline: "Ship AI in 48 hours."

## Core pages
- [Home](${SITE_URL}/): What Voltair Tech builds and how fast.
- [About](${SITE_URL}/about): Who we are, the Voltair edge, our mission.
- [Services](${SITE_URL}/services): Full catalogue of AI build services.
- [Industries](${SITE_URL}/industries): Sector-shaped AI for D2C, healthcare, fintech, and more.
- [FAQ](${SITE_URL}/faq): Common questions on scope, timelines, pricing, and ownership.
- [Contact](${SITE_URL}/contact): Start a project — one line, reply within an hour.`;

const FOOTER = `## Policies
- [Privacy Policy](${SITE_URL}/privacy)
- [Terms of Service](${SITE_URL}/terms)`;

/** One markdown link line, with an optional one-line summary. */
function line(title: string, path: string, summary?: string | null): string {
  const desc = summary?.trim() ? `: ${summary.trim()}` : "";
  return `- [${title}](${SITE_URL}${path})${desc}`;
}

async function buildBody(): Promise<string> {
  const sections: string[] = [HEADER];

  // Services
  try {
    const { items } = await listPublishedServices(1, 100);
    if (items.length) {
      sections.push(
        ["## Services", ...items.map((s) => line(s.title, `/services/${s.slug}`, s.summary))].join(
          "\n",
        ),
      );
    }
  } catch {
    /* skip the section if the DB is unreachable */
  }

  // Industries
  try {
    const { items } = await listPublishedIndustries(1, 100);
    if (items.length) {
      sections.push(
        [
          "## Industries",
          ...items.map((i) => line(i.title, `/industries/${i.slug}`, i.summary)),
        ].join("\n"),
      );
    }
  } catch {
    /* skip */
  }

  // Blog (resources)
  try {
    const { items } = await listPublishedPosts(1, 100);
    const resources = [
      `- [Blog](${SITE_URL}/blog): Practical AI guides for Indian operators (RAG, WhatsApp chatbots, DPDP Act compliance).`,
      ...items.map((p) => line(p.title, `/blog/${p.slug}`, p.excerpt)),
      `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    ];
    sections.push(["## Resources", ...resources].join("\n"));
  } catch {
    sections.push(
      [
        "## Resources",
        `- [Blog](${SITE_URL}/blog): Practical AI guides for Indian operators (RAG, WhatsApp chatbots, DPDP Act compliance).`,
        `- [Sitemap](${SITE_URL}/sitemap.xml)`,
      ].join("\n"),
    );
  }

  sections.push(FOOTER);
  return sections.join("\n\n") + "\n";
}

export async function GET() {
  const body = await buildBody();
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
