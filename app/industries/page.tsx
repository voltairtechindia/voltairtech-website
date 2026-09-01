import type { Metadata } from "next";
import { PageLayout } from "@/components/PageLayout";
import { Industries } from "@/components/Industries";
import { Process } from "@/components/Process";
import {
  listPublishedIndustries,
  listPublishedIndustryTitles,
  DEFAULT_PER_PAGE,
} from "@/lib/industries/db";
import type { IndustryPage } from "@/lib/industries/types";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

// Revalidate every 5 min so admin edits appear without a redeploy.
export const revalidate = 300;

// Derived from the live catalogue so the meta copy can't drift from the DB as
// sectors are added/removed in the admin (it used to hardcode 8 of 13).
export async function generateMetadata(): Promise<Metadata> {
  let titles: string[] = [];
  try {
    titles = await listPublishedIndustryTitles();
  } catch {
    // DB unavailable at build — fall back to a representative static list.
  }
  const lead = titles.length
    ? titles.slice(0, 6).join(", ")
    : "D2C & e-commerce, healthcare, fintech, real estate, SaaS, logistics";
  const sectors = titles.length > 6 ? `${lead} and more` : lead;

  return {
    title: "Industries We Build For: AI For Your Trade | Voltair Tech",
    description: `Voltair Tech builds websites, chatbots and automation for ${sectors}. Mumbai AI build studio, fixed price.`,
    alternates: { canonical: "https://www.voltairtech.com/industries" },
    openGraph: {
      url: "https://www.voltairtech.com/industries",
      title: "Industries We Build For | Voltair Tech Mumbai",
      description: `Built around how your trade works: ${sectors}.`,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function IndustriesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams?.page) || 1);

  let data: IndustryPage = { items: [], total: 0, page, perPage: DEFAULT_PER_PAGE, pageCount: 1 };
  try {
    data = await listPublishedIndustries(page);
  } catch {
    // DB unavailable (e.g. build before env) — render the empty state.
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Industries Voltair Tech builds for",
    itemListElement: data.items.map((it, i) => ({
      "@type": "ListItem",
      position: (data.page - 1) * data.perPage + i + 1,
      name: it.title,
      url: `https://www.voltairtech.com/industries/${it.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageLayout footerNum="03">
        <Industries industries={data.items} page={data.page} pageCount={data.pageCount} />
        <Process
          num="02"
          title={<>How we build{" "}<br />for your trade.</>}
          lead="Same four steps every time. What changes is what we build and the one number we agree to move."
        />
      </PageLayout>
    </>
  );
}
