import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DetailHero, firstImage } from "@/components/DetailHero";
import { DetailBand, DetailProse, DetailShell } from "@/components/DetailShell";
import { FaqSection } from "@/components/FaqSection";
import { LeadForm } from "@/components/LeadForm";
import Markdown from "@/components/Markdown";
import { MediaGallery } from "@/components/MediaGallery";
import { PointGrid } from "@/components/PointGrid";
import { ServiceCardGrid } from "@/components/ServiceCardGrid";
import { faqPageLd } from "@/lib/faq/normalize";
import { customServiceSlug } from "@/lib/industries/custom";
import { industryIconSrc } from "@/lib/industries/icons";
import { catalogueOptionId, customOptionId, type LeadOption } from "@/lib/lead-form";
import { isMovingMedia } from "@/lib/media";
import {
  getPublishedIndustry,
  listPublishedIndustrySlugs,
} from "@/lib/industries/db";
import { industryShouldIndex } from "@/lib/industries/indexing";
import { getPublishedServiceCardsBySlugs } from "@/lib/services/db";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";

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
  const ogImage =
    ind.seo?.og_image ??
    ind.cover_image?.url ??
    firstImage(ind.media ?? [])?.url ??
    DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/industries/${ind.slug}` },
    // Admin can hide a weak sector page from Google (seo.noindex) without
    // unpublishing it: it still renders and stays in the chatbot's knowledge.
    ...(industryShouldIndex(ind.seo) ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE_URL}/industries/${ind.slug}`,
      images: [{ url: ogImage }],
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
  const media = ind.media ?? [];
  const faq = ind.faq ?? [];
  const hero = ind.cover_image?.url
    ? { url: ind.cover_image.url, alt: ind.cover_image.alt }
    : firstImage(media);

  // The picker mirrors the "What we build for" grid above it: the sector's
  // curated catalogue subset plus its inline sector-only builds, same order.
  const leadOptions: LeadOption[] = [
    ...services.map((s) => ({
      id: catalogueOptionId(s.slug),
      slug: s.slug,
      title: s.title,
    })),
    ...customServices.map((c) => ({
      id: customOptionId(customServiceSlug(c)),
      slug: customServiceSlug(c),
      title: c.title,
      custom: true,
    })),
  ];

  // Linked (catalogue) services + inline custom services, in render order.
  const serviceListItems = [
    ...services.map((s) => ({ name: s.title, url: `${SITE_URL}/services/${s.slug}` })),
    ...customServices.map((c) => ({
      name: c.title,
      url: `${SITE_URL}/industries/${ind.slug}/${customServiceSlug(c)}`,
    })),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: ind.seo?.title ?? `AI for ${ind.title}`,
    url,
    description: ind.summary ?? ind.lead ?? undefined,
    ...(hero?.url ? { image: [hero.url] } : {}),
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
      {faq.length ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd(faq)) }}
        />
      ) : null}

      <DetailShell>
        <DetailHero
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Industries", href: "/industries" },
            { label: ind.title },
          ]}
          kicker={ind.meta ?? `AI for ${ind.title.toLowerCase()}`}
          title={ind.headline ?? `AI for ${ind.title}`}
          lead={ind.lead ?? ind.summary ?? undefined}
          facts={[
            { label: "Sector", value: ind.title },
            ...(serviceListItems.length
              ? [{ label: "Ready to build", value: `${serviceListItems.length} of them` }]
              : []),
            { label: "First reply", value: "Within the hour" },
          ]}
          visual={hero?.url ?? null}
          visualAlt={hero?.alt ?? ind.title}
          clips={media.filter(isMovingMedia).length}
          ctaLabel="Talk to us"
          glyph={
            <Image
              src={ind.icon_image?.url ?? industryIconSrc(ind.icon)}
              alt={ind.icon_image?.alt ?? ""}
              width={200}
              height={200}
              priority
            />
          }
        />

        {ind.bullets?.length ? (
          <DetailBand tone="ink">
            <PointGrid points={ind.bullets} heading={`Where AI helps in ${ind.title.toLowerCase()}`} />
          </DetailBand>
        ) : null}

        {media.length ? (
          <DetailBand>
            <MediaGallery
              media={media}
              heading="Take a look"
              lede={`Screens and short clips from work we have done in ${ind.title.toLowerCase()}.`}
            />
          </DetailBand>
        ) : null}

        {ind.body_md.trim() ? (
          <DetailProse>
            <Markdown>{ind.body_md}</Markdown>
          </DetailProse>
        ) : null}

        {hasServices ? (
          <DetailBand tone="ink">
            <div className="industry-services">
              <h2>What we build for {ind.title.toLowerCase()}</h2>
              <p className="meta">
                The part of what we do that fits this sector.{" "}
                <Link href="/services">See everything we build</Link>
              </p>
              <ServiceCardGrid
                services={services}
                custom={customServices}
                customBaseHref={`/industries/${ind.slug}`}
                compact
              />
            </div>
          </DetailBand>
        ) : null}

        {ind.case_studies?.length ? (
          <DetailBand>
            <div className="industry-cases">
              <h2>Work we have done in {ind.title.toLowerCase()}</h2>
              <p className="meta">
                The problem, what we built, and what changed afterwards.
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
                            <span className="case-card__label">The problem</span>
                            <p>{cs.challenge}</p>
                          </div>
                        ) : null}
                        {cs.approach ? (
                          <div className="case-card__block">
                            <span className="case-card__label">What we built</span>
                            <p>{cs.approach}</p>
                          </div>
                        ) : null}
                        {cs.outcome ? (
                          <div className="case-card__block">
                            <span className="case-card__label">What changed</span>
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
                          <span className="case-card__label">Built with</span>
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
                            Read the full story
                          </a>
                        ) : (
                          <Link className="case-card__link" href={cs.link}>
                            Read the full story
                          </Link>
                        )
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          </DetailBand>
        ) : null}

        {faq.length ? (
          <DetailProse>
            <FaqSection
              faq={faq}
              heading={`Questions we get about AI for ${ind.title.toLowerCase()}`}
              id={`ind-${ind.slug}-faq`}
            />
          </DetailProse>
        ) : null}

        <DetailBand id="enquire">
          <LeadForm
            variant="inline"
            idPrefix="ind"
            heading={
              <>
                Build it for <em>{ind.title.toLowerCase()}</em>.
              </>
            }
            lede="Pick what you need, or just describe it in your own words. We reply within the hour with a plan, a fixed price, and a start date."
            context={{ kind: "industry", industrySlug: ind.slug, industryTitle: ind.title }}
            options={leadOptions}
          />
        </DetailBand>
      </DetailShell>
    </>
  );
}
