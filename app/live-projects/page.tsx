import type { Metadata } from "next";

import { PageLayout } from "@/components/PageLayout";
import { ProjectShowcase } from "@/components/ProjectShowcase";
import { SectionHead } from "@/components/atoms/SectionHead";
import { DEFAULT_OG_IMAGE, SITE_URL, breadcrumbLd } from "@/lib/seo";
import { listPublishedProjects } from "@/lib/live-projects/db";
import { FALLBACK_PROJECTS } from "@/lib/live-projects/fallback";
import type { LiveProject } from "@/lib/live-projects/types";

/**
 * ISR: the page is DB-backed and admin-editable, so it refreshes on the same
 * window as /services and /faq. The admin also pings /api/revalidate after a
 * save, which makes an edit show up immediately rather than up to 5 min later.
 */
export const revalidate = 300;

const TITLE = "Live Projects - AI Products Built & Shipped by VoltairTech";
const DESCRIPTION =
  "Production products from Mumbai's AI build studio - delivery operations, an AI front desk, WebAR for print, a sales-intelligence app, recruiting and outbound. Feature brochures for every one.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/live-projects` },
  openGraph: {
    url: `${SITE_URL}/live-projects`,
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

/**
 * Published projects, in page order. Falls back to the seed list if Supabase
 * is empty or unreachable, so the page can never render as an empty shell —
 * same contract as /faq and its `CONTENT.faq` fallback.
 */
async function loadProjects(): Promise<LiveProject[]> {
  try {
    const rows = await listPublishedProjects();
    if (rows.length) return rows;
  } catch (err) {
    console.error("[live-projects] load failed, using fallback", err);
  }
  return FALLBACK_PROJECTS;
}

export default async function LiveProjectsPage() {
  const projects = await loadProjects();
  const count = projects.length;

  const heroStats = [
    { value: String(count), label: "Products" },
    {
      value: String(projects.filter((p) => p.lifecycle !== "build").length),
      label: "In production",
    },
    {
      value: String(new Set(projects.flatMap((p) => p.surfaces)).size),
      label: "Shipped surfaces",
    },
    {
      value: String(projects.filter((p) => p.brochure?.url).length),
      label: "Feature brochures",
    },
  ];

  /** Absolute URL for JSON-LD — covers may be Supabase-hosted or local. */
  const abs = (u: string) => (u.startsWith("http") ? u : `${SITE_URL}${u}`);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/live-projects`,
    name: "Live projects",
    description: DESCRIPTION,
    url: `${SITE_URL}/live-projects`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: count,
      itemListElement: projects.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SoftwareApplication",
          name: p.name,
          url: `${SITE_URL}/live-projects#${p.slug}`,
          ...(p.tagline ? { description: p.tagline } : {}),
          applicationCategory: "BusinessApplication",
          ...(p.surfaces.length ? { operatingSystem: p.surfaces.join(", ") } : {}),
          ...(p.cover_image?.url ? { image: abs(p.cover_image.url) } : {}),
          author: { "@type": "Organization", name: "Voltair Tech", url: SITE_URL },
        },
      })),
    },
  };

  return (
    <PageLayout footerNum="07">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([{ label: "Home", href: "/" }, { label: "Live projects" }]),
          ),
        }}
      />

      {/* ── Hero ── */}
      <section className="section lp-hero">
        <div className="container">
          <SectionHead
            as="h1"
            title="Live projects"
            right={<span className="tag"><span className="pulse" />Mumbai, India</span>}
          />

          <dl className="lp-hero__stats">
            {heroStats.map((s) => (
              <div key={s.label} className="lp-hero__stat">
                <dt className="lp-hero__stat-value">{s.value}</dt>
                <dd className="lp-hero__stat-label">{s.label}</dd>
              </div>
            ))}
          </dl>

        </div>
      </section>

      {/* The portfolio at a glance; depth opens in a dialog.
          See components/ProjectShowcase.tsx. */}
      <section className="section lp-showcase">
        <div className="container">
          <ProjectShowcase projects={projects} />
        </div>
      </section>

    </PageLayout>
  );
}
