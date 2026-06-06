import type { Metadata } from "next";
import { PageLayout } from "@/components/PageLayout";
import { Faq } from "@/components/Faq";

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
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Who builds AI products in Mumbai?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Voltair Tech is an AI services studio based in Andheri West, Mumbai. We work with Indian startups, enterprises, and global teams that need a fast Indian build partner.",
      },
    },
    {
      "@type": "Question",
      name: "How fast can you deploy a website?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI-powered marketing websites go live in 48 hours from kickoff. That includes design, copy, CMS, analytics, and a custom domain.",
      },
    },
    {
      "@type": "Question",
      name: "How much does an AI app cost in India?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A production chatbot starts at ₹1.5L. A full RAG system or AI web app starts at ₹4–8L depending on scope, and mobile apps land at ₹8–15L. All quotes are fixed-price.",
      },
    },
    {
      "@type": "Question",
      name: "Do you build WhatsApp chatbots?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. WhatsApp Business API is one of our most-requested channels. We handle the Meta verification, conversation flow, payment integrations, and grounding the bot on your own docs.",
      },
    },
  ],
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
