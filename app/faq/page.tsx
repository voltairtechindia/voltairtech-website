import type { Metadata } from "next";
import { PageLayout } from "@/components/PageLayout";
import { Faq } from "@/components/Faq";
import { CONTENT } from "@/lib/content";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "FAQ - AI Services Mumbai | Common Questions Answered",
  description:
    "Answers to the most common questions about AI development in India: pricing, timelines, RAG systems, WhatsApp chatbots, tech stack, NDAs, and post-ship support. Voltair Tech, Mumbai.",
  alternates: { canonical: "https://voltairtech.com/faq" },
  openGraph: {
    url: "https://voltairtech.com/faq",
    title: "FAQ - AI Services Mumbai | Voltair Tech",
    description:
      "How much does an AI app cost in India? How fast can you deploy a chatbot? What is RAG? All your questions answered by Voltair Tech, Mumbai.",
    images: [DEFAULT_OG_IMAGE],
  },
};

// Schema is generated from the same source as the visible accordion so the
// FAQPage markup always mirrors on-page content (a Google rich-results rule and
// the basis for AI/LLM answer-engine citations).
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: CONTENT.faq.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageLayout footerNum="02">
        <Faq />
      </PageLayout>
    </>
  );
}
