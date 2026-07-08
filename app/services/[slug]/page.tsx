import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Markdown from "@/components/Markdown";
import { ProsePage } from "@/components/ProsePage";
import { ProseCta } from "@/components/ProseCta";
import {
  getPublishedService,
  listPublishedServiceSlugs,
} from "@/lib/services/db";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const SITE_URL = "https://voltairtech.com";
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

  const url = `${SITE_URL}/services/${svc.slug}`;
  const metaLine = svc.meta ?? (svc.eta ? `Service · ${svc.eta} delivery` : "Service");

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
        <ProseCta label="Tell us what you want to build." />
      </ProsePage>
    </>
  );
}
