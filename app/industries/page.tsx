import type { Metadata } from "next";
import { PageLayout } from "@/components/PageLayout";
import { Industries } from "@/components/Industries";
import { Process } from "@/components/Process";
import { listPublishedIndustries } from "@/lib/industries/db";
import type { IndustryCard } from "@/lib/industries/types";

// Revalidate every 5 min so admin edits appear without a redeploy.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Industries We Build For — AI for D2C, Healthcare, Fintech & More",
  description:
    "Voltair Tech ships AI websites, chatbots, RAG systems and automations for D2C & e-commerce, healthcare, fintech, real estate, education, logistics, professional services and hospitality. Mumbai AI build studio.",
  alternates: { canonical: "https://voltairtech.com/industries" },
  openGraph: {
    url: "https://voltairtech.com/industries",
    title: "Industries We Build For | Voltair Tech Mumbai",
    description:
      "AI shaped to your sector — D2C, healthcare, fintech, real estate, education, logistics, professional services and hospitality.",
  },
};

export default async function IndustriesPage() {
  let industries: IndustryCard[] = [];
  try {
    const data = await listPublishedIndustries(1, 100);
    industries = data.items;
  } catch {
    // DB unavailable (e.g. build before env) — render the empty state.
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Industries Voltair Tech builds for",
    itemListElement: industries.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.title,
      url: `https://voltairtech.com/industries/${it.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageLayout>
        <Industries industries={industries} />
        <Process />
      </PageLayout>
    </>
  );
}
