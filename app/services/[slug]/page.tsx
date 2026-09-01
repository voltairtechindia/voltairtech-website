import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DetailHero, firstImage, type HeroFact } from "@/components/DetailHero";
import { DetailBand, DetailProse, DetailShell } from "@/components/DetailShell";
import { FaqSection } from "@/components/FaqSection";
import { LeadForm } from "@/components/LeadForm";
import Markdown from "@/components/Markdown";
import { MediaGallery } from "@/components/MediaGallery";
import { PointGrid } from "@/components/PointGrid";
import { ServiceGlyph } from "@/components/atoms/ServiceGlyph";
import { faqPageLd } from "@/lib/faq/normalize";
import { catalogueOptionId, type LeadOption } from "@/lib/lead-form";
import { isMovingMedia } from "@/lib/media";
import { inrLabel } from "@/lib/price";
import {
  getPublishedService,
  listPublishedServiceOptions,
  listPublishedServiceSlugs,
} from "@/lib/services/db";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";

const ORG_ID = `${SITE_URL}/#organization`;
const AREA_SERVED = [
  { "@type": "Country", name: "India" },
  { "@type": "Place", name: "European Union" },
  { "@type": "Place", name: "Asia-Pacific (APAC)" },
];

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const slugs = await listPublishedServiceSlugs();
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
  const svc = await getPublishedService(params.slug).catch(() => null);
  if (!svc) return { title: "Service not found" };

  const title = svc.seo?.title ?? `${svc.title} | Voltair Tech`;
  const description = svc.seo?.description ?? svc.summary ?? svc.lead ?? svc.title;
  const ogImage =
    svc.seo?.og_image ??
    svc.cover_image?.url ??
    firstImage(svc.media ?? [])?.url ??
    DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/services/${svc.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE_URL}/services/${svc.slug}`,
      images: [{ url: ogImage }],
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const svc = await getPublishedService(params.slug).catch(() => null);
  if (!svc) notFound();

  // The whole catalogue, with this page's service already ticked. Most enquiries
  // want a second thing bolted on, and asking here beats a reply asking later.
  const catalogue = await listPublishedServiceOptions().catch(() => []);
  const leadOptions: LeadOption[] = catalogue.map((s) => ({
    id: catalogueOptionId(s.slug),
    slug: s.slug,
    title: s.title,
  }));

  const url = `${SITE_URL}/services/${svc.slug}`;
  const media = svc.media ?? [];
  const faq = svc.faq ?? [];
  const hero = svc.cover_image?.url
    ? { url: svc.cover_image.url, alt: svc.cover_image.alt }
    : firstImage(media);

  // Only facts the row actually carries. An empty rail beats an invented one.
  const price = inrLabel(svc.price);
  const facts: HeroFact[] = [
    ...(svc.eta ? [{ label: "Ready in", value: svc.eta }] : []),
    ...(price ? [{ label: "Starts at", value: price }] : []),
    { label: "Support after launch", value: "30 days" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    // Matches the itemOffered @id in the homepage OfferCatalog so engines
    // reconcile this page's Service with the offering listed on the org graph.
    "@id": `${url}#service`,
    name: svc.title,
    serviceType: svc.title,
    provider: { "@type": "Organization", "@id": ORG_ID, name: "Voltair Tech", url: SITE_URL },
    areaServed: AREA_SERVED,
    url,
    description: svc.summary ?? svc.lead ?? undefined,
    ...(hero?.url ? { image: [hero.url] } : {}),
    ...(svc.price
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: svc.price,
            url,
            availability: "https://schema.org/InStock",
          },
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
            { label: "What we build", href: "/services" },
            { label: svc.title },
          ]}
          kicker={svc.meta ?? "What we build"}
          title={svc.headline ?? svc.title}
          lead={svc.lead ?? svc.summary ?? undefined}
          facts={facts}
          visual={hero?.url ?? null}
          visualAlt={hero?.alt ?? svc.title}
          clips={media.filter(isMovingMedia).length}
          glyph={<ServiceGlyph kind={svc.icon} />}
        />

        {svc.bullets?.length ? (
          <DetailBand tone="ink">
            <PointGrid points={svc.bullets} />
          </DetailBand>
        ) : null}

        {media.length ? (
          <DetailBand>
            <MediaGallery
              media={media}
              heading="Take a look"
              lede="Screens and short clips from real builds."
            />
          </DetailBand>
        ) : null}

        {svc.body_md.trim() ? (
          <DetailProse>
            <Markdown>{svc.body_md}</Markdown>
          </DetailProse>
        ) : null}

        {faq.length ? (
          <DetailProse>
            <FaqSection faq={faq} id={`svc-${svc.slug}-faq`} />
          </DetailProse>
        ) : null}

        <DetailBand id="enquire">
          <LeadForm
            variant="inline"
            idPrefix="svc"
            heading={
              <>
                Start your <em>{svc.title.toLowerCase()}</em> build.
              </>
            }
            lede="Tick anything else you need, tell us the goal, and we will come back within the hour with a plan, a fixed price, and a start date."
            context={{ kind: "service", serviceSlug: svc.slug, serviceTitle: svc.title }}
            options={leadOptions}
            initialSelected={[catalogueOptionId(svc.slug)]}
          />
        </DetailBand>
      </DetailShell>
    </>
  );
}
