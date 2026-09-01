import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DetailHero, firstImage } from "@/components/DetailHero";
import { DetailBand, DetailProse, DetailShell } from "@/components/DetailShell";
import { FaqSection } from "@/components/FaqSection";
import { LeadForm } from "@/components/LeadForm";
import Markdown from "@/components/Markdown";
import { MediaGallery } from "@/components/MediaGallery";
import { PointGrid } from "@/components/PointGrid";
import { ServiceGlyph } from "@/components/atoms/ServiceGlyph";
import { faqPageLd } from "@/lib/faq/normalize";
import { customServiceSlug, findCustomService } from "@/lib/industries/custom";
import {
  getPublishedIndustry,
  listPublishedCustomServiceParams,
} from "@/lib/industries/db";
import { customServiceShouldIndex } from "@/lib/industries/indexing";
import { catalogueOptionId, customOptionId, type LeadOption } from "@/lib/lead-form";
import { isMovingMedia } from "@/lib/media";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";
import { getPublishedServiceCardsBySlugs } from "@/lib/services/db";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    return await listPublishedCustomServiceParams();
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; service: string };
}): Promise<Metadata> {
  const ind = await getPublishedIndustry(params.slug).catch(() => null);
  const cs = ind ? findCustomService(ind, params.service) : null;
  if (!ind || !cs) return { title: "Service not found" };

  const title = cs.headline ?? `${cs.title} | ${ind.title} | Voltair Tech`;
  const description = cs.summary ?? cs.lead ?? cs.headline ?? cs.title;
  const ogImage =
    cs.cover_image?.url ?? firstImage(cs.media ?? [])?.url ?? DEFAULT_OG_IMAGE;
  const url = `${SITE_URL}/industries/${ind.slug}/${customServiceSlug(cs)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    // Sector-only sub-pages are thin by default (summary + bullets), so they're
    // noindexed until they carry real unique prose or the admin force-indexes
    // them (`follow` keeps link equity flowing to the linked services/industry).
    ...(customServiceShouldIndex(cs) ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      type: "website",
      title,
      description,
      url,
      images: [{ url: ogImage }],
    },
  };
}

export default async function IndustryCustomServicePage({
  params,
}: {
  params: { slug: string; service: string };
}) {
  const ind = await getPublishedIndustry(params.slug).catch(() => null);
  if (!ind) notFound();
  const cs = findCustomService(ind, params.service);
  if (!cs) notFound();

  const url = `${SITE_URL}/industries/${ind.slug}/${customServiceSlug(cs)}`;
  const thisSlug = customServiceSlug(cs);
  const media = cs.media ?? [];
  const faq = cs.faq ?? [];
  const hero = cs.cover_image?.url
    ? { url: cs.cover_image.url, alt: cs.cover_image.alt }
    : firstImage(media);

  // Same picker as the parent sector page, so someone who landed straight on a
  // sub-page can still bolt on the rest of what that sector buys from us.
  const linked = await getPublishedServiceCardsBySlugs(ind.service_slugs).catch(() => []);
  const leadOptions: LeadOption[] = [
    ...(ind.custom_services ?? []).map((c) => ({
      id: customOptionId(customServiceSlug(c)),
      slug: customServiceSlug(c),
      title: c.title,
      custom: true,
    })),
    ...linked.map((s) => ({
      id: catalogueOptionId(s.slug),
      slug: s.slug,
      title: s.title,
    })),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: cs.title,
    serviceType: cs.title,
    provider: { "@type": "Organization", name: "Voltair Tech", url: SITE_URL },
    areaServed: { "@type": "Country", name: "India" },
    url,
    description: cs.summary ?? cs.lead ?? undefined,
    ...(hero?.url ? { image: [hero.url] } : {}),
    isRelatedTo: {
      "@type": "CollectionPage",
      name: ind.title,
      url: `${SITE_URL}/industries/${ind.slug}`,
    },
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
            { label: ind.title, href: `/industries/${ind.slug}` },
            { label: cs.title },
          ]}
          kicker={`Built for ${ind.title.toLowerCase()}`}
          title={cs.headline ?? cs.title}
          lead={cs.lead ?? cs.summary ?? undefined}
          facts={[
            ...(cs.eta ? [{ label: "Ready in", value: cs.eta }] : []),
            { label: "Sector", value: ind.title },
            { label: "First reply", value: "Within the hour" },
          ]}
          visual={hero?.url ?? null}
          visualAlt={hero?.alt ?? cs.title}
          clips={media.filter(isMovingMedia).length}
          glyph={<ServiceGlyph kind={cs.icon} />}
        />

        {cs.bullets.length ? (
          <DetailBand tone="ink">
            <PointGrid points={cs.bullets} />
          </DetailBand>
        ) : null}

        {media.length ? (
          <DetailBand>
            <MediaGallery media={media} heading="Take a look" />
          </DetailBand>
        ) : null}

        {cs.body_md?.trim() ? (
          <DetailProse>
            <Markdown>{cs.body_md}</Markdown>
          </DetailProse>
        ) : null}

        {faq.length ? (
          <DetailProse>
            <FaqSection faq={faq} id={`cs-${thisSlug}-faq`} />
          </DetailProse>
        ) : null}

        <DetailProse>
          <p className="detail-prose__note">
            One of the builds we do for{" "}
            <Link href={`/industries/${ind.slug}`}>{ind.title.toLowerCase()}</Link>.{" "}
            <Link href="/services">See everything we build</Link>
          </p>
        </DetailProse>

        <DetailBand id="enquire">
          <LeadForm
            variant="inline"
            idPrefix="cs"
            heading={
              <>
                Get <em>{cs.title.toLowerCase()}</em> built.
              </>
            }
            lede="Tell us where you are starting from. We reply within the hour with a plan, a fixed price, and a start date."
            context={{
              kind: "industry-service",
              industrySlug: ind.slug,
              industryTitle: ind.title,
              serviceSlug: thisSlug,
              serviceTitle: cs.title,
            }}
            options={leadOptions}
            initialSelected={[customOptionId(thisSlug)]}
          />
        </DetailBand>
      </DetailShell>
    </>
  );
}
