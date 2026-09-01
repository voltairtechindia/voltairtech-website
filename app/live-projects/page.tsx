import type { Metadata } from "next";

import { PageLayout } from "@/components/PageLayout";
import { ProjectHashRedirect } from "@/components/ProjectHashRedirect";
import { ProjectShowcase } from "@/components/ProjectShowcase";
import { DEFAULT_OG_IMAGE, SITE_URL, breadcrumbLd } from "@/lib/seo";
import { loadProjects } from "@/lib/live-projects/load";
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

export default async function LiveProjectsPage() {
  const projects = await loadProjects();
  const count = projects.length;

  const byLifecycle = (l: LiveProject["lifecycle"]) =>
    projects.filter((p) => p.lifecycle === l).length;

  // The masthead legend doubles as the key for the coloured LED on each card,
  // so it earns its space instead of restating the grid's length four ways.
  const legend = [
    { key: "live" as const, label: "Live", n: byLifecycle("live") },
    { key: "shipped" as const, label: "Shipped", n: byLifecycle("shipped") },
    { key: "build" as const, label: "In build", n: byLifecycle("build") },
  ].filter((r) => r.n > 0);

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
          url: `${SITE_URL}/live-projects/${p.slug}`,
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

      {/* ── Masthead ── */}
      <section className="section lp-hero">
        <div className="container">
          <header className="lp-masthead">
            <div className="lp-masthead__title">
              <h1>Live projects</h1>
              <p className="lp-masthead__meta">
                Voltair Tech · product portfolio · Mumbai
              </p>
            </div>

            <dl className="lp-legend">
              <div className="lp-legend__total">
                <dt>{count}</dt>
                <dd>Products</dd>
              </div>
              {legend.map((r) => (
                <div key={r.key} className="lp-legend__row">
                  <span className={`lp-legend__led lp-legend__led--${r.key}`} aria-hidden="true" />
                  <dt>{r.n}</dt>
                  <dd>{r.label}</dd>
                </div>
              ))}
            </dl>
          </header>
        </div>
      </section>

      {/* The portfolio at a glance; depth opens in a dialog.
          See components/ProjectShowcase.tsx. */}
      <section className="section lp-showcase">
        <div className="container">
          <ProjectShowcase projects={projects} />
          <ProjectHashRedirect slugs={projects.map((p) => p.slug)} />
        </div>
      </section>

    </PageLayout>
  );
}
