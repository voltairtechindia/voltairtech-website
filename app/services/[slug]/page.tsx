import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FaqSection } from "@/components/FaqSection";
import { LeadForm } from "@/components/LeadForm";
import Markdown from "@/components/Markdown";
import { ProsePage } from "@/components/ProsePage";
import { faqPageLd } from "@/lib/faq/normalize";
import { catalogueOptionId, type LeadOption } from "@/lib/lead-form";
import {
  getPublishedService,
  listPublishedServiceOptions,
  listPublishedServiceSlugs,
} from "@/lib/services/db";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const SITE_URL = "https://www.voltairtech.com";
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
  const ogImage = svc.seo?.og_image ?? svc.cover_image?.url ?? DEFAULT_OG_IMAGE;

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

  // The whole catalogue, with this page's service already ticked — most enquiries
  // want a second thing bolted on, and asking here beats a reply asking later.
  const catalogue = await listPublishedServiceOptions().catch(() => []);
  const leadOptions: LeadOption[] = catalogue.map((s) => ({
    id: catalogueOptionId(s.slug),
    slug: s.slug,
    title: s.title,
  }));

  const url = `${SITE_URL}/services/${svc.slug}`;
  const metaLine = svc.meta ?? (svc.eta ? `Service · ${svc.eta} delivery` : "Service");
  const faq = svc.faq ?? [];

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
    ...(svc.cover_image?.url ? { image: [svc.cover_image.url] } : {}),
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
      <ProsePage
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: svc.title },
        ]}
        title={svc.headline ?? svc.title}
        meta={metaLine}
        lead={svc.lead ?? svc.summary ?? undefined}
      >
        {svc.cover_image?.url ? (
          <figure className="blog-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={svc.cover_image.url}
              alt={svc.cover_image.alt ?? svc.title}
              decoding="async"
            />
          </figure>
        ) : null}
        {svc.body_md.trim() ? <Markdown>{svc.body_md}</Markdown> : null}
        <FaqSection faq={faq} id={`svc-${svc.slug}-faq`} />
        <LeadForm
          variant="inline"
          idPrefix="svc"
          heading={
            <>
              Start your <em>{svc.title}</em> build.
            </>
          }
          lede="Tick anything else you need, tell us the goal, and we'll come back within the hour with scope, a fixed price, and a start date."
          context={{ kind: "service", serviceSlug: svc.slug, serviceTitle: svc.title }}
          options={leadOptions}
          initialSelected={[catalogueOptionId(svc.slug)]}
        />
      </ProsePage>
    </>
  );
}
