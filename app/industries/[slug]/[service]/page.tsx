import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Markdown from "@/components/Markdown";
import { ProseCta } from "@/components/ProseCta";
import { ProsePage } from "@/components/ProsePage";
import { customServiceSlug, findCustomService } from "@/lib/industries/custom";
import {
  getPublishedIndustry,
  listPublishedCustomServiceParams,
} from "@/lib/industries/db";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const SITE_URL = "https://voltairtech.com";

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
  const ogImage = cs.cover_image?.url ?? DEFAULT_OG_IMAGE;
  const url = `${SITE_URL}/industries/${ind.slug}/${customServiceSlug(cs)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
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
  const metaLine = `${ind.title}${cs.eta ? ` · ${cs.eta}` : ""}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: cs.title,
    serviceType: cs.title,
    provider: { "@type": "Organization", name: "Voltair Tech", url: SITE_URL },
    areaServed: { "@type": "Country", name: "India" },
    url,
    description: cs.summary ?? cs.lead ?? undefined,
    ...(cs.cover_image?.url ? { image: [cs.cover_image.url] } : {}),
    isRelatedTo: {
      "@type": "CollectionPage",
      name: ind.title,
      url: `${SITE_URL}/industries/${ind.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProsePage
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Industries", href: "/industries" },
          { label: ind.title, href: `/industries/${ind.slug}` },
          { label: cs.title },
        ]}
        title={cs.headline ?? cs.title}
        meta={metaLine}
        lead={cs.lead ?? cs.summary ?? undefined}
      >
        {cs.cover_image?.url ? (
          <figure className="blog-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cs.cover_image.url}
              alt={cs.cover_image.alt ?? cs.title}
              decoding="async"
            />
          </figure>
        ) : null}

        {cs.body_md?.trim() ? <Markdown>{cs.body_md}</Markdown> : null}

        {cs.bullets.length ? (
          <Markdown>{`## What you get\n\n${cs.bullets.map((b) => `- ${b}`).join("\n")}`}</Markdown>
        ) : null}

        {cs.eta ? (
          <p className="legal-page__meta">
            Typical timeline: <b>{cs.eta}</b>
          </p>
        ) : null}

        <p className="legal-page__meta" style={{ marginTop: 24 }}>
          A sector-specific build for <Link href={`/industries/${ind.slug}`}>{ind.title}</Link>.{" "}
          <Link href="/services">See our core services →</Link>
        </p>

        <ProseCta label={`Tell us what you want to build for ${ind.title}.`} />
      </ProsePage>
    </>
  );
}
