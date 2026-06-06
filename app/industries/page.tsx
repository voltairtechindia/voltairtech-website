import type { Metadata } from "next";
import { PageLayout } from "@/components/PageLayout";
import { Industries } from "@/components/Industries";
import { Process } from "@/components/Process";
import { listPublishedIndustries, DEFAULT_PER_PAGE } from "@/lib/industries/db";
import type { IndustryPage } from "@/lib/industries/types";

// Revalidate every 5 min so admin edits appear without a redeploy.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Industries We Build For: AI for D2C, Healthcare, Fintech & More",
  description:
    "Voltair Tech ships AI websites, chatbots, RAG systems and automations for D2C & e-commerce, healthcare, fintech, real estate, education, logistics, professional services and hospitality. Mumbai AI build studio.",
  alternates: { canonical: "https://voltairtech.com/industries" },
  openGraph: {
    url: "https://voltairtech.com/industries",
    title: "Industries We Build For | Voltair Tech Mumbai",
    description:
      "AI shaped to your sector: D2C, healthcare, fintech, real estate, education, logistics, professional services and hospitality.",
  },
};

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
      url: `https://voltairtech.com/industries/${it.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageLayout footerNum="03">
        <Industries industries={data.items} page={data.page} pageCount={data.pageCount} />
        <Process
          num="02"
          title={<>How we build<br />for your sector.</>}
          lead="Every sector build runs the same four steps. We just tune the stack and the one success metric to how your industry actually works."
        />
      </PageLayout>
    </>
  );
}
