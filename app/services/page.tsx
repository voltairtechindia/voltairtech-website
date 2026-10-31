import type { Metadata } from "next";
import { PageLayout } from "@/components/PageLayout";
import { Services } from "@/components/Services";
import { Process } from "@/components/Process";
import { DEFAULT_PER_PAGE, listPublishedServices } from "@/lib/services/db";
import type { ServicePage } from "@/lib/services/types";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "What We Build: Websites, Chatbots, Document Search & Automation",
  description:
    "What Voltair Tech builds: websites in 48 hours, WhatsApp chatbots, voice agents, document search (RAG), mobile apps, and software that automates your repetitive work. Fixed price, Mumbai based.",
  alternates: { canonical: "https://www.voltairtech.com/services" },
  openGraph: {
    url: "https://www.voltairtech.com/services",
    title: "What We Build: Websites, Chatbots & Automation | Voltair Tech",
    description:
      "Websites in 48 hours, WhatsApp chatbots, voice agents, document search, mobile apps, and software that automates your repetitive work.",
    images: [DEFAULT_OG_IMAGE],
  },
};

// Static site: every service is built into the page and the browser shows one
// page of cards at a time (components/PagedGrid).
export default async function ServicesPage() {
  let data: ServicePage = { items: [], total: 0, page: 1, perPage: DEFAULT_PER_PAGE, pageCount: 1 };
  try {
    data = await listPublishedServices(1, 1000);
  } catch {
    // DB unavailable (e.g. build before env) — render the empty state.
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Voltair Tech AI Services",
    itemListElement: data.items.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: `https://www.voltairtech.com/services/${s.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageLayout footerNum="03">
        <Services services={data.items} perPage={DEFAULT_PER_PAGE} />
        <Process
          num="02"
          title={<>How a build{" "}<br />actually goes.</>}
          lead="Whichever one you pick, it runs the same four steps. One agreed price, progress on WhatsApp every day, and everything handed over to you at the end."
        />
      </PageLayout>
    </>
  );
}
