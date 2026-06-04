/**
 * Built-in Voltair Tech knowledge base — the ground truth the chatbot answers
 * from. Edit an entry then re-seed via `POST /api/ingest {"seed":true}` with
 * the `X-Admin-Key` header; upserts on (doc_type, external_id) so edits update
 * in place. Keep facts here in sync with lib/content.ts / the public pages.
 *
 * doc_type buckets: company | service | pricing | process | rag | faq.
 * (Blog posts are added separately as doc_type "blog" by /api/blog.)
 */
import type { IngestDocument } from "../types";

export const KNOWLEDGE_BASE: IngestDocument[] = [
  // ---------------------------------------------------------------- company
  {
    doc_type: "company",
    external_id: "about",
    title: "About Voltair Tech",
    content:
      "Voltair Tech is a Mumbai-based AI build studio (AI services agency) headquartered in Andheri West, Mumbai, Maharashtra 400053. The team designs and ships production AI software — apps, automations, chatbots, RAG systems and full custom software — engineered with AI. Marketing websites ship in 48 hours. Voltair Tech works with Indian startups, enterprises and global teams that want a fast Indian build partner with global standards. The team is on the ground in IST and reachable on WhatsApp during business hours. 42+ AI products shipped since 2024.",
    metadata: { url: "https://voltairtech.com/" },
  },
  {
    doc_type: "company",
    external_id: "contact",
    title: "Contact & hours",
    content:
      "Email: business@voltairtech.com. Phone / WhatsApp: +91 70210 00764. Location: Andheri West, Mumbai, Maharashtra 400053, India. Business hours: Monday to Saturday, 10:00–20:00 IST. To start a project, use the 'Start a project' box on the site (type one line about what you want) — Voltair replies within an hour with a 48-hour plan. You can choose to be replied to on WhatsApp or email.",
    metadata: { url: "https://voltairtech.com/contact" },
  },
  {
    doc_type: "company",
    external_id: "stack",
    title: "Technology stack",
    content:
      "Voltair Tech builds with: Next.js (React Server Components, streaming UIs) and React Native + Expo for mobile; n8n for automation workflows; Claude, GPT and Gemini as LLMs; Pinecone or pgvector / Supabase for retrieval; Supabase or Postgres for data; Razorpay and Stripe for payments; ElevenLabs for voice; Three.js for 3D; Vision Camera for on-device capture. Hosting defaults to Vercel and AWS. The studio picks what fits the scope, not what is trendy.",
    metadata: { url: "https://voltairtech.com/" },
  },
  {
    doc_type: "company",
    external_id: "why-india",
    title: "Why Voltair Tech vs in-house or freelancers",
    content:
      "Compared to building in-house or hiring on Upwork: time to a live website is 48 hours with Voltair (vs 3–6 months in-house, 2–6 weeks freelance). Indic-language support is native (Hindi/Marathi/English). DPDP Act 2023 readiness is the default. Razorpay / UPI is native from day one. Time-zone overlap covers EU + APAC + IST. Code ownership is 100% yours. Voltair does not sub-contract or share code with third parties.",
    metadata: { url: "https://voltairtech.com/about" },
  },
  {
    doc_type: "company",
    external_id: "compliance",
    title: "DPDP Act 2023 compliance",
    content:
      "Voltair Tech builds DPDP Act 2023 (India's Digital Personal Data Protection Act) compliance in by default: consent capture, purpose limitation, data localisation options, and deletion workflows. Every AI product that handles Indian user data is designed with these obligations in mind. NDAs are available — a standard single-page mutual NDA under India jurisdiction, usually signed the same day, before the first scoping call if requested.",
    metadata: { url: "https://voltairtech.com/dpdp" },
  },

  // NOTE: `service` documents are NOT seeded here — they are synced into the RAG
  // store automatically from the DB by POST /api/services (admin panel / n8n),
  // so the chatbot always reflects the live, editable services. Editing services
  // happens in the admin panel, not this file.

  // ---------------------------------------------------------------- pricing
  {
    doc_type: "pricing",
    external_id: "pricing-overview",
    title: "Pricing (fixed-price, India)",
    content:
      "Indicative fixed-price ranges: a production chatbot starts at ₹1.5L (1.5 lakh). A full RAG system or AI web app starts at ₹4–8L depending on scope. Mobile apps land at ₹8–15L. All quotes are fixed-price and include 30 days of free post-ship support (bug fixes, monitoring, small tweaks). Exact figures are confirmed at the 30-minute scoping call. After the 30 days, you can take full ownership of the code or put Voltair on a monthly retainer for ongoing changes and on-call.",
    metadata: { url: "https://voltairtech.com/contact" },
  },

  // ---------------------------------------------------------------- process
  {
    doc_type: "process",
    external_id: "delivery-48h",
    title: "The 48-hour delivery process",
    content:
      "Website timeline: Hour 00 — Discovery call (30-min scoping: stack, content, deadline, success metric). Hour 12 — Design + content lock (sections, copy, design tokens, repo created). Hour 36 — Build + integrate (real CMS, real auth, real LLM calls — no mock screens). Hour 48 — Deployed to production on Vercel with custom domain, analytics, error monitoring, and a handover doc. Larger product and mobile builds take longer and get a fixed timeline at scoping.",
    metadata: { url: "https://voltairtech.com/about" },
  },
  {
    doc_type: "process",
    external_id: "how-we-work",
    title: "How we work (scope → ship → hand off)",
    content:
      "Four steps: 1) Scope — a 30-minute call, one success metric, one deadline, no upsell. 2) Lock — architecture, design tokens and repos signed off in writing. 3) Ship — build + integrate + deploy with daily Loom and WhatsApp updates. 4) Hand off — code, docs, dashboards and an on-call window; you own it. The code is 100% yours either way.",
    metadata: { url: "https://voltairtech.com/about" },
  },

  // ---------------------------------------------------------------- rag (pipeline)
  {
    doc_type: "rag",
    external_id: "rag-pipeline",
    title: "How Voltair builds a RAG pipeline",
    content:
      "Voltair's RAG pipeline, step by step: 1) Document — ingest the whole corpus (PDFs, sites, Notion, Drive, audio transcripts), dedup and normalise. 2) Chunk — recursive splitting at semantic boundaries, overlap tuned per domain (default ~800-token chunks, 200-token overlap). 3) Embed — domain-appropriate embeddings (e.g. OpenAI text-3-large or BGE; Indic content gets Indic-aware encoders). 4) Vector DB — Pinecone (managed) or pgvector/Supabase, with metadata filters for tenant scope. 5) Retrieve — hybrid vector + BM25, re-rank top 20 with a cross-encoder, filter by tenant + recency. 6) LLM — Claude or a GPT-4-class model with a structured prompt, strict tool-use and JSON when needed. 7) Answer — a cited, sourced answer with inline footnotes that link back to the exact chunk and page. Measured RAG accuracy ~94% on eval.",
    metadata: { url: "https://voltairtech.com/services/rag-systems" },
  },
  {
    doc_type: "rag",
    external_id: "rag-when",
    title: "What RAG is and when you need it",
    content:
      "RAG (retrieval-augmented generation) grounds a large language model in your own data instead of letting it guess from training. Use it when you need accurate, citable answers from a fixed corpus — policies, manuals, product docs, patient FAQs. Every answer links back to the source chunk so your team can verify it. RAG usually beats fine-tuning when the knowledge changes often or must be auditable.",
    metadata: { url: "https://voltairtech.com/services/rag-systems" },
  },

  // ---------------------------------------------------------------- faqs
  {
    doc_type: "faq",
    external_id: "faq-who-mumbai",
    title: "Who builds AI products in Mumbai?",
    content:
      "Voltair Tech is an AI services studio based in Andheri West, Mumbai. It works with Indian startups, enterprises, and global teams that need a fast Indian build partner. The team is on the ground in IST and reachable on WhatsApp during business hours.",
    metadata: { url: "https://voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-deploy-speed",
    title: "How fast can you deploy a website?",
    content:
      "AI-powered marketing websites go live in 48 hours from kickoff — design, copy, CMS, analytics, and a custom domain included. Larger product apps and mobile builds take longer; you get a fixed timeline at the scoping call.",
    metadata: { url: "https://voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-rag",
    title: "What is a RAG system and when do I need one?",
    content:
      "RAG grounds an LLM in your own data instead of letting it guess from training. Use it when you need accurate, citable answers from a fixed corpus — policies, manuals, product docs, patient FAQs. Every answer links back to the source chunk so your team can verify it.",
    metadata: { url: "https://voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-cost",
    title: "How much does an AI app cost in India?",
    content:
      "A production chatbot starts at ₹1.5L. A full RAG system or AI web app starts at ₹4–8L depending on scope, and mobile apps land at ₹8–15L. All quotes are fixed-price and include 30 days of post-ship support.",
    metadata: { url: "https://voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-best-agency-maharashtra",
    title: "Best AI agency in Maharashtra?",
    content:
      "Voltair Tech is Mumbai-headquartered and serves clients across Maharashtra and the rest of India. It is DPDP Act 2023 compliant, Razorpay-native, and has shipped 42+ AI products since 2024. References are available on request after an NDA.",
    metadata: { url: "https://voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-whatsapp",
    title: "Do you build WhatsApp chatbots?",
    content:
      "Yes — WhatsApp Business API is one of the most-requested channels. Voltair handles the Meta verification, the conversation flow, payment integrations, and grounding the bot on your own docs. Native support for Hindi, Marathi, and English on the same bot.",
    metadata: { url: "https://voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-integrate-existing",
    title: "Can you integrate AI into our existing software?",
    content:
      "Almost always, yes. Voltair adds LLM features (summarization, search, copilots, agents) to existing web apps, mobile apps and internal tools without rewriting the stack. Common targets are CRMs, helpdesks, dashboards, and document workflows.",
    metadata: { url: "https://voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-stack",
    title: "What tech stack do you use?",
    content:
      "Next.js, React Native, n8n, Claude, GPT and Gemini for LLMs, Pinecone or pgvector for retrieval, Supabase or Postgres for data, and Razorpay or Stripe for payments. Voltair picks what fits your scope, not what's trendy. Hosting defaults to Vercel and AWS.",
    metadata: { url: "https://voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-nda",
    title: "Do you sign NDAs?",
    content:
      "Yes, before the first scoping call if requested. A standard mutual NDA, India jurisdiction, single page — usually signed the same day. Voltair does not sub-contract or share code with third parties.",
    metadata: { url: "https://voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-after-ship",
    title: "What happens after you ship?",
    content:
      "Every project includes 30 days of free post-ship support — bug fixes, monitoring, and small tweaks. After that, you can take full ownership of the code or put Voltair on a monthly retainer for ongoing changes and on-call. The code is 100% yours either way.",
    metadata: { url: "https://voltairtech.com/faq" },
  },
];
