import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Markdown from "@/components/Markdown";
import { ProsePage } from "@/components/ProsePage";
import { ProseCta } from "@/components/ProseCta";
import { ServiceCardGrid } from "@/components/ServiceCardGrid";
import {
  getPublishedIndustry,
  listPublishedIndustrySlugs,
} from "@/lib/industries/db";
import { getPublishedServiceCardsBySlugs } from "@/lib/services/db";

const SITE_URL = "https://voltairtech.com";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const slugs = await listPublishedIndustrySlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const ind = await getPublishedIndustry(params.slug).catch(() => null);
  if (!ind) return { title: "Industry not found" };

  const title = ind.seo?.title ?? `AI for ${ind.title} | Voltair Tech`;
  const description = ind.seo?.description ?? ind.summary ?? ind.lead ?? ind.title;
  const ogImage = ind.seo?.og_image ?? ind.cover_image?.url;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/industries/${ind.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE_URL}/industries/${ind.slug}`,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function IndustryDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const ind = await getPublishedIndustry(params.slug).catch(() => null);
  if (!ind) notFound();

  const services = await getPublishedServiceCardsBySlugs(ind.service_slugs).catch(() => []);
  const customServices = ind.custom_services ?? [];
  const hasServices = services.length > 0 || customServices.length > 0;

  const url = `${SITE_URL}/industries/${ind.slug}`;
  const metaLine = ind.meta ?? "Industry";

  // Linked (catalogue) services + inline custom services, in render order.
  const serviceListItems = [
    ...services.map((s) => ({ name: s.title, url: `${SITE_URL}/services/${s.slug}` })),
    ...customServices.map((c) => ({
      name: c.title,
      url: c.link && /^https?:\/\//i.test(c.link) ? c.link : undefined,
    })),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: ind.seo?.title ?? `AI for ${ind.title}`,
    url,
    description: ind.summary ?? ind.lead ?? undefined,
    ...(ind.cover_image?.url ? { image: [ind.cover_image.url] } : {}),
    ...(serviceListItems.length
      ? {
          mainEntity: {
            "@type": "ItemList",
            itemListElement: serviceListItems.map((item, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: item.name,
              ...(item.url ? { url: item.url } : {}),
            })),
          },
        }
      : {}),
    ...(ind.case_studies?.length
      ? {
          hasPart: ind.case_studies.map((cs) => ({
            "@type": "CreativeWork",
            name: cs.title,
            ...(cs.challenge || cs.approach || cs.outcome
              ? {
                  abstract: [cs.challenge, cs.approach, cs.outcome]
                    .filter(Boolean)
                    .join(" "),
                }
              : {}),
            ...(cs.tech_stack.length ? { keywords: cs.tech_stack.join(", ") } : {}),
          })),
        }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProsePage
        wide
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Industries", href: "/industries" },
          { label: ind.title },
        ]}
        title={ind.headline ?? `AI for ${ind.title}`}
        meta={metaLine}
        lead={ind.lead ?? ind.summary ?? undefined}
      >
        {ind.cover_image?.url ? (
          <figure className="blog-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ind.cover_image.url}
              alt={ind.cover_image.alt ?? ind.title}
              decoding="async"
            />
          </figure>
        ) : null}

        {ind.body_md.trim() ? <Markdown>{ind.body_md}</Markdown> : null}

        {hasServices ? (
          <div className="industry-services">
            <h2>Services for {ind.title}</h2>
            <p className="meta">
              The slice of what we build that fits this sector.{" "}
              <Link href="/services">See every service →</Link>
            </p>
            <ServiceCardGrid services={services} custom={customServices} compact />
          </div>
        ) : null}

        {ind.case_studies?.length ? (
          <div className="industry-cases">
            <h2>How we&apos;ve used AI in {ind.title}</h2>
            <p className="meta">
              Real builds: the problem, our AI approach, the stack we used, and what changed.
            </p>
            <div className="case-grid">
              {ind.case_studies.map((cs, i) => {
                const external = /^https?:\/\//i.test(cs.link ?? "");
                return (
                  <article key={`${cs.title}-${i}`} className="case-card">
                    <header className="case-card__head">
                      <span className="case-card__num">[ {String(i + 1).padStart(2, "0")} ]</span>
                      <h3 className="case-card__title">{cs.title}</h3>
                      {cs.client ? <p className="case-card__client">{cs.client}</p> : null}
                    </header>

                    <div className="case-card__body">
                      {cs.challenge ? (
                        <div className="case-card__block">
                          <span className="case-card__label">Challenge</span>
                          <p>{cs.challenge}</p>
                        </div>
                      ) : null}
                      {cs.approach ? (
                        <div className="case-card__block">
                          <span className="case-card__label">How we used AI</span>
                          <p>{cs.approach}</p>
                        </div>
                      ) : null}
                      {cs.outcome ? (
                        <div className="case-card__block">
                          <span className="case-card__label">Outcome</span>
                          <p>{cs.outcome}</p>
                        </div>
                      ) : null}
                    </div>

                    {cs.metrics?.length ? (
                      <div className="case-card__metrics">
                        {cs.metrics.map((m, j) => (
                          <div key={`${m.label}-${j}`} className="case-metric">
                            <span className="case-metric__value">{m.value}</span>
                            <span className="case-metric__label">{m.label}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {cs.tech_stack?.length ? (
                      <div className="case-card__stack">
                        <span className="case-card__label">Tech stack</span>
                        <ul className="case-chips">
                          {cs.tech_stack.map((t) => (
                            <li key={t} className="case-chip">{t}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {cs.link ? (
                      external ? (
                        <a
                          className="case-card__link"
                          href={cs.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Read the full story ↗
                        </a>
                      ) : (
                        <Link className="case-card__link" href={cs.link}>
                          Read the full story →
                        </Link>
                      )
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}

        <ProseCta label={`Tell us what you want to build for ${ind.title}.`} />
      </ProsePage>
    </>
  );
}
