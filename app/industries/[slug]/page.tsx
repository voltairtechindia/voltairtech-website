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

  const title = ind.seo?.title ?? `AI for ${ind.title} — Voltair Tech`;
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

  const url = `${SITE_URL}/industries/${ind.slug}`;
  const metaLine = ind.meta ?? "Industry";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: ind.seo?.title ?? `AI for ${ind.title}`,
    url,
    description: ind.summary ?? ind.lead ?? undefined,
    ...(ind.cover_image?.url ? { image: [ind.cover_image.url] } : {}),
    ...(services.length
      ? {
          mainEntity: {
            "@type": "ItemList",
            itemListElement: services.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: s.title,
              url: `${SITE_URL}/services/${s.slug}`,
            })),
          },
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

        {services.length ? (
          <div className="industry-services">
            <h2>Services for {ind.title}</h2>
            <p className="meta">
              The slice of what we build that fits this sector.{" "}
              <Link href="/services">See every service →</Link>
            </p>
            <ServiceCardGrid services={services} compact />
          </div>
        ) : null}

        <ProseCta label={`Tell us what you want to build for ${ind.title}.`} />
      </ProsePage>
    </>
  );
}
