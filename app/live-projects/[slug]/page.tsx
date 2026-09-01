import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Arr } from "@/components/atoms/Arr";
import { PageLayout } from "@/components/PageLayout";
import { ProjectStage } from "@/components/ProjectStage";
import { DEFAULT_OG_IMAGE, SITE_URL, breadcrumbLd } from "@/lib/seo";
import { listPublishedProjectSlugs } from "@/lib/live-projects/db";
import { loadProjectWithNeighbours, loadProjects } from "@/lib/live-projects/load";
import { LIFECYCLE_LABEL, type LiveProject, type MediaItem } from "@/lib/live-projects/types";

/** Same window as the index — the admin also pings /api/revalidate on save. */
export const revalidate = 300;

/** Prebuild the published set; anything else renders on first request. */
export async function generateStaticParams() {
  try {
    return (await listPublishedProjectSlugs()).map((slug) => ({ slug }));
  } catch {
    return (await loadProjects()).map((p) => ({ slug: p.slug }));
  }
}

type Params = { params: { slug: string } };

/** The cover is the first slide, so a project always has something to show. */
function slidesFor(p: LiveProject): MediaItem[] {
  const cover: MediaItem[] = p.cover_image?.url
    ? [{ type: "image", url: p.cover_image.url, alt: p.cover_image.alt ?? `${p.name} cover` }]
    : [];
  return [...cover, ...p.media];
}

/** "1.1 MB" — shown on the brochure button when the row records a size. */
function fileSize(bytes?: number): string | null {
  if (!bytes || bytes <= 0) return null;
  const mb = bytes / 1_048_576;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = await loadProjectWithNeighbours(params.slug);
  if (!found) return { title: "Project not found" };
  const p = found.project;

  const title = p.seo.title ?? `${p.name} - ${p.tagline ?? "Built by Voltair Tech"}`;
  const description =
    p.seo.description ??
    p.summary ??
    p.tagline ??
    `${p.name}, a product built and shipped by Voltair Tech, Mumbai.`;
  const image = p.seo.og_image ?? p.cover_image?.url ?? DEFAULT_OG_IMAGE;
  const url = `${SITE_URL}/live-projects/${p.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { url, title, description, images: [image] },
  };
}

export default async function ProjectPage({ params }: Params) {
  const found = await loadProjectWithNeighbours(params.slug);
  if (!found) notFound();

  const { project: p, index, total, prev, next } = found;
  const slides = slidesFor(p);
  const size = fileSize(p.brochure?.size_bytes);
  const abs = (u: string) => (u.startsWith("http") ? u : `${SITE_URL}${u}`);

  const appLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/live-projects/${p.slug}`,
    name: p.name,
    url: `${SITE_URL}/live-projects/${p.slug}`,
    ...(p.summary || p.tagline ? { description: p.summary ?? p.tagline } : {}),
    applicationCategory: "BusinessApplication",
    ...(p.surfaces.length ? { operatingSystem: p.surfaces.join(", ") } : {}),
    ...(p.cover_image?.url ? { image: abs(p.cover_image.url) } : {}),
    author: { "@type": "Organization", name: "Voltair Tech", url: SITE_URL },
  };

  return (
    <PageLayout footerNum="07">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([
              { label: "Home", href: "/" },
              { label: "Live projects", href: "/live-projects" },
              { label: p.name },
            ]),
          ),
        }}
      />

      {/* Everything below is inside .pj — its own type scale, its own colours,
          one centred column. See the `/live-projects/<slug>` block in
          globals.css and the fonts in this route's layout.tsx. */}
      <article className="pj">
        <header className="pj-head">
          <div className="pj-col">
            <nav className="pj-crumb" aria-label="Breadcrumb">
              <Link href="/live-projects">Live projects</Link>
              <span aria-hidden="true">/</span>
              <span>{p.name}</span>
            </nav>

            <div className="pj-badges">
              <span className={`pj-status pj-status--${p.lifecycle}`}>
                <span className="pj-status__led" aria-hidden="true" />
                {LIFECYCLE_LABEL[p.lifecycle]}
              </span>
              {p.kicker ? <span className="pj-kicker">{p.kicker}</span> : null}
              <span className="pj-count">
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>

            <h1 className="pj-title">{p.name}</h1>
            {p.tagline ? <p className="pj-tagline">{p.tagline}</p> : null}
            {p.summary ? <p className="pj-summary">{p.summary}</p> : null}

            {p.links.length || p.brochure?.url ? (
              <div className="pj-actions">
                {p.links.map((l) => (
                  <a
                    key={l.href}
                    className="pj-btn"
                    href={l.href}
                    {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
                  >
                    <span className="pj-btn__label">
                      {l.label} <Arr />
                    </span>
                  </a>
                ))}
                {p.brochure?.url ? (
                  <a
                    className="pj-btn pj-btn--ghost"
                    href={p.brochure.url}
                    target="_blank"
                    rel="noopener"
                  >
                    <span className="pj-btn__label">{p.brochure.label ?? "Brochure"}</span>
                    <span className="pj-btn__meta">
                      PDF
                      {p.brochure.pages ? ` · ${p.brochure.pages} pages` : ""}
                      {size ? ` · ${size}` : ""}
                    </span>
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </header>

        {slides.length ? (
          <section className="pj-media" aria-label={`${p.name} screenshots and demos`}>
            <div className="pj-col pj-col--wide">
              <ProjectStage media={slides} name={p.name} />
            </div>
          </section>
        ) : null}

        {p.stats.length ? (
          <section className="pj-figures" aria-label="Figures">
            <div className="pj-col pj-col--wide">
              <dl className="pj-stats">
                {p.stats.map((s) => (
                  <div key={`${s.value}-${s.label}`} className="pj-stat">
                    <dt className="pj-stat__value">{s.value}</dt>
                    <dd className="pj-stat__label">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        ) : null}

        {p.highlights.length ? (
          <section className="pj-section">
            <div className="pj-col">
              <h2 className="pj-h2">What it does</h2>
              <ul className="pj-points">
                {p.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {p.surfaces.length || p.stack.length ? (
          <section className="pj-section pj-section--meta">
            <div className="pj-col">
              {p.surfaces.length ? (
                <div className="pj-meta">
                  <h2 className="pj-lbl">Where it runs</h2>
                  <div className="pj-chips">
                    {p.surfaces.map((s) => (
                      <span key={s} className="pj-chip">{s}</span>
                    ))}
                  </div>
                </div>
              ) : null}
              {p.stack.length ? (
                <div className="pj-meta">
                  <h2 className="pj-lbl">Built with</h2>
                  <div className="pj-chips">
                    {p.stack.map((s) => (
                      <span key={s} className="pj-chip pj-chip--muted">{s}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <nav className="pj-pager" aria-label="More projects">
          <div className="pj-col pj-col--wide">
            <div className="pj-pager__row">
              {prev ? (
                <Link className="pj-pager__link" href={`/live-projects/${prev.slug}`}>
                  <span className="pj-lbl">Previous</span>
                  <span className="pj-pager__name">{prev.name}</span>
                </Link>
              ) : (
                <span />
              )}
              <Link className="pj-pager__all" href="/live-projects">
                All projects
              </Link>
              {next ? (
                <Link className="pj-pager__link pj-pager__link--next" href={`/live-projects/${next.slug}`}>
                  <span className="pj-lbl">Next</span>
                  <span className="pj-pager__name">{next.name}</span>
                </Link>
              ) : (
                <span />
              )}
            </div>
          </div>
        </nav>
      </article>
    </PageLayout>
  );
}
