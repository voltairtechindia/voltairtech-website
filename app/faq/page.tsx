import type { Metadata } from "next";
import { PageLayout } from "@/components/PageLayout";
import { Faq, type FaqEntry } from "@/components/Faq";
import { listPublishedSiteFaqs } from "@/lib/faq/db";
import { faqPageLd } from "@/lib/faq/normalize";
import { groupSiteFaqs } from "@/lib/faq/types";
import { CONTENT } from "@/lib/content";
import { DEFAULT_OG_IMAGE, breadcrumbLd } from "@/lib/seo";

// The questions are admin-managed rows in `site_faqs`, so the page can't be
// fully static any more; a short ISR window picks up edits without a deploy.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "FAQ - AI Service provider in Mumbai | Common Questions Answered",
  description:
    "Answers to the most common questions about AI development in India: pricing, timelines, RAG systems, WhatsApp chatbots, tech stack, NDAs, and post-ship support. Voltair Tech, Mumbai.",
  alternates: { canonical: "https://www.voltairtech.com/faq" },
  openGraph: {
    url: "https://www.voltairtech.com/faq",
    title: "FAQ - AI Service provider in Mumbai | Voltair Tech",
    description:
      "How much does an AI app cost in India? How fast can you deploy a chatbot? What is RAG? All your questions answered by Voltair Tech, Mumbai.",
    images: [DEFAULT_OG_IMAGE],
  },
};

/**
 * The published `site_faqs` rows, or the original bundled set if the table is
 * empty or unreachable — this page is a top SEO/AEO asset, so it must never
 * render blank.
 */
async function loadFaqs(): Promise<FaqEntry[]> {
  try {
    const rows = await listPublishedSiteFaqs();
    if (rows.length) {
      // Collapse each category into one contiguous run first — the accordion
      // prints a heading whenever the category changes, so interleaved rows
      // would otherwise repeat the same heading down the page.
      return groupSiteFaqs(rows).flatMap((g) =>
        g.items.map((r) => ({
          q: r.question,
          a: r.answer,
          slug: r.slug,
          category: g.category,
        })),
      );
    }
  } catch {
    /* fall through to the bundled copy */
  }
  return CONTENT.faq.map((f) => ({ q: f.q, a: f.a }));
}

export default async function FaqPage() {
  const items = await loadFaqs();

  // Schema is generated from the same array as the visible accordion so the
  // FAQPage markup always mirrors on-page content (a Google rich-results rule
  // and the basis for AI/LLM answer-engine citations).
  const jsonLd = faqPageLd(items);
  const crumbs = breadcrumbLd([{ label: "Home", href: "/" }, { label: "FAQ" }]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
      <PageLayout footerNum="02">
        <Faq items={items} />
      </PageLayout>
    </>
  );
}
