/**
 * Seed the 6 original Voltair services into the DB (and the chatbot RAG store)
 * by POSTing them to the admin-gated /api/services endpoint. These were
 * previously hardcoded React pages; they now live in `services` so the admin
 * panel can edit them and the chatbot can cite them.
 *
 * Usage (dev server running, env loaded):
 *   ADMIN_API_KEY=... node supabase/seed-services.mjs                 # -> http://localhost:3000
 *   ADMIN_API_KEY=... SITE=https://www.voltairtech.com node supabase/seed-services.mjs
 */

const SITE = process.env.SITE || process.env.VOLTAIR_API_URL || "http://localhost:3000";
const KEY = process.env.ADMIN_API_KEY || process.env.VOLTAIR_ADMIN_KEY;

if (!KEY) {
  console.error("Set ADMIN_API_KEY (the site's admin key) in the environment.");
  process.exit(1);
}

const services = [
  {
    slug: "ai-websites",
    title: "AI websites in 48 hrs",
    headline: "AI websites that go live in 48 hours",
    status: "published",
    position: 1,
    icon: "web",
    eta: "48 hrs",
    price: "75000",
    tags: ["website", "next.js", "razorpay"],
    bullets: ["Next.js · RSC", "Streaming UIs", "Razorpay · Stripe · Auth"],
    summary:
      "Production AI-powered Next.js websites built and deployed in 48 hours — real CMS, auth, payments, custom domain.",
    meta: "Service · Next.js · Built in Mumbai · Deployed globally",
    lead:
      "We build AI-powered Next.js websites from brief to deployment in a flat 48 hours. No phased approvals, no mock screens, no six-week timelines — a production website with real CMS, real auth, and real integrations, live on your custom domain.",
    seo: {
      title: "AI Website Development Mumbai — Live in 48 Hours | Voltair Tech",
      description:
        "Production Next.js websites from brief to deployment in 48 hours. Razorpay & Stripe, auth, CMS, custom domain. Fixed price.",
    },
    body_md: `## What's included in every 48-hour website

- Next.js App Router with React Server Components for performance-first rendering
- Streaming UIs — LLM-powered content that loads progressively
- Razorpay & Stripe payment integration — India-first by default
- Authentication (Supabase / NextAuth) with role-based access
- Headless CMS integration (Sanity, Contentful, or Notion-as-CMS)
- Custom domain, SSL, Vercel deployment, error monitoring
- Analytics (Vercel Analytics + optional Mixpanel)
- Privacy policy and consent flows
- Handover doc + 30-day post-ship support window

## The 48-hour process

At hour 0, we run a 30-minute scoping call. By hour 12, design tokens, copy, and architecture are locked in writing. By hour 36, the real build is running — no placeholders. At hour 48, your website is live on Vercel with custom domain, analytics, and a full handover document.

## Who is this for?

- Startups launching an MVP and needing credibility fast
- Founders who have a product but a placeholder website
- Businesses rebranding with a hard launch deadline
- D2C brands needing a landing page before a campaign drops

## Pricing

AI-powered marketing websites from **₹75,000**. Full product sites with auth + CMS from **₹1.5L**. All quotes are fixed-price with zero scope creep.

## FAQs

### Can you really build a production website in 48 hours?
Yes. The key is a strict scope lock at hour 12: content, copy, and design tokens are signed off before a single line of code is written. We don't revise during the build window — that discipline is what makes 48 hours possible.

### What if I need changes after launch?
Every website ships with 30 days of free post-launch support. After that, we offer a monthly retainer or hand you the codebase — 100% yours either way.

### Do you build e-commerce sites?
Yes — we build Razorpay-native storefronts with cart, checkout, and order management. WhatsApp order flows can be added as a second phase.`,
  },
  {
    slug: "ai-automation",
    title: "AI automation",
    headline: "Stop doing manually what a machine can do in milliseconds",
    status: "published",
    position: 2,
    icon: "auto",
    eta: "1–2 weeks",
    price: "25000",
    tags: ["automation", "n8n", "workflows"],
    bullets: ["n8n workflows", "Trigger → action chains", "Slack / Sheets / WA"],
    summary:
      "AI-powered n8n automation workflows connecting Slack, Sheets, WhatsApp, CRMs and APIs into one pipeline.",
    meta: "Service · n8n workflows · 1–2 week delivery · Fixed price",
    lead:
      "We design and deploy AI-powered n8n automation workflows that connect your existing tools — Slack, Google Sheets, WhatsApp, your CRM, your database — into a single intelligent pipeline. Trigger once, chain infinitely.",
    seo: {
      title: "AI Automation & n8n Workflows India | Voltair Tech",
      description:
        "n8n automation workflows connecting Slack, Sheets, WhatsApp, CRMs and custom APIs. Deployed in 1–2 weeks. Fixed price.",
    },
    body_md: `## What we automate

- Lead capture → CRM entry → WhatsApp welcome message → Slack alert (in under 2 seconds)
- Invoice generation → PDF creation → email dispatch → accounting entry
- Support ticket → AI classification → routing → response draft → agent review
- Social media post scheduling across Instagram, LinkedIn, and X
- Daily reporting: pull from Sheets, transform with an LLM, send to Slack
- E-commerce: order placed → inventory update → dispatch notification → review request

## Why n8n over Zapier or Make?

n8n is open-source, self-hostable, and India-optimised. Unlike Zapier, there's no per-task pricing — you pay once for the workflow build, not per execution. We host your n8n instance on a low-cost VPS or on your own cloud, so your automations run 24/7 at near-zero marginal cost.

| Feature | n8n (Voltair) | Zapier | Make |
| --- | --- | --- | --- |
| Pricing model | **Fixed build fee + cheap hosting** | Per task (expensive at scale) | Per operation |
| Self-hostable | **Yes** | No | No |
| Custom code nodes | **Full JS / Python** | Limited | Limited |
| Data residency | **Indian server option** | US-only | EU / US |
| WhatsApp Business API | **Native integration** | Via third-party | Via third-party |

## What's included in an automation build

- Discovery session to map your current manual workflows
- n8n workflow design, build, and test in a staging environment
- Error handling, retry logic, and alert notifications
- Documentation: flow diagrams + operator runbook
- 30-day post-ship support + monitoring dashboard

## Pricing

Simple single-trigger automations from **₹25,000**. Full multi-step workflow suites from **₹75,000–₹2L** depending on complexity. All fixed-price.

## FAQs

### Do I need technical knowledge to manage automations?
No. We build a monitoring dashboard and a plain-language runbook so your ops team can manage triggers, pause workflows, and read logs without touching code.

### Can you automate WhatsApp Business workflows?
Yes — WhatsApp Business API is one of our most common automation targets. We handle Meta verification, message templates, and payment triggers natively.`,
  },
  {
    slug: "whatsapp-chatbot",
    title: "Chatbots & voice agents",
    headline: "A WhatsApp chatbot that speaks your customer's language",
    status: "published",
    position: 3,
    icon: "chat",
    eta: "1 week",
    price: "150000",
    tags: ["whatsapp", "chatbot", "voice", "hindi"],
    bullets: ["WhatsApp Business API", "Hindi / Marathi / English", "ElevenLabs voices"],
    summary:
      "Multilingual WhatsApp Business API chatbots and voice agents — FAQs, leads, orders, payments in Hindi, Marathi & English.",
    meta: "Service · WhatsApp Business API · 1-week delivery · From ₹1.5L",
    lead:
      "India runs on WhatsApp — 500 million users, 2 billion messages a day. We build WhatsApp Business API chatbots that handle customer queries, collect leads, process orders, and answer FAQs fluently in Hindi, Marathi, and English, on the same bot.",
    seo: {
      title: "WhatsApp Chatbot Development India | Voltair Tech",
      description:
        "WhatsApp Business API chatbots in Hindi, Marathi & English. Razorpay payments, RAG grounding, Meta verification handled. From ₹1.5L.",
    },
    body_md: `## What our WhatsApp bots do

- Answer FAQs from your own knowledge base (RAG-grounded, zero hallucination)
- Collect and qualify leads — name, budget, requirement — before routing to a human
- Process orders and accept UPI / Razorpay payments inside the chat
- Send appointment confirmations, reminders, and follow-ups
- Escalate complex queries to a live agent with full conversation context
- Broadcast campaigns with personalisation tokens (name, location, last order)

## Languages supported

Our bots understand and respond in Hindi (Devanagari + Hinglish), Marathi, English, Tamil, Telugu, Bengali, and Gujarati. Language detection is automatic — the bot switches mid-conversation if the user switches.

## What we handle end-to-end

- Meta Business Verification — we manage the entire approval process
- Phone number registration and WhatsApp Business Account setup
- Message template creation and Meta approval
- Conversation flow design with decision trees and AI fallback
- Payment integration: Razorpay, UPI, and Stripe for international clients
- CRM sync: HubSpot, Zoho, Salesforce, or custom webhook
- Analytics dashboard: message volume, drop-off rates, CSAT

## Pricing

WhatsApp chatbot builds from **₹1.5L** including Meta verification, 3 conversation flows, and 30 days of post-ship support. RAG-grounded bots (with a custom knowledge base) from **₹3L**.

## FAQs

### How long does Meta Business Verification take?
Typically 3–7 business days for verified businesses. We manage all communications with Meta on your behalf and have templates pre-approved for common Indian business categories.

### Can the bot handle voice messages in Hindi?
Yes — with ElevenLabs voice integration, the bot can both receive voice notes (transcribe to text) and respond with a natural Hindi or Marathi voice.

### Does the chatbot work with my existing CRM?
We integrate with HubSpot, Zoho, Salesforce, Leadsquared, and Freshdesk natively. Custom integrations via webhook for any other system.`,
  },
  {
    slug: "rag-systems",
    title: "RAG system config",
    headline: "Your AI. Your data. Every answer cited to the source.",
    status: "published",
    position: 4,
    icon: "rag",
    eta: "2–3 weeks",
    price: "400000",
    tags: ["rag", "pinecone", "pgvector", "search"],
    bullets: ["Chunk → embed → retrieve", "Pinecone / pgvector", "Citation-grade answers"],
    summary:
      "Production RAG systems grounded in your documents — citation-grade answers on Pinecone or pgvector.",
    meta: "Service · Pinecone / pgvector · 2–3 week delivery",
    lead:
      "RAG (Retrieval-Augmented Generation) is how enterprise AI should work: answers grounded in your policies, your manuals, your product docs — not the model's training data. We build production RAG systems that give citation-grade answers, every time.",
    seo: {
      title: "RAG System Development India | Voltair Tech",
      description:
        "Production RAG systems grounded in your documents. Pinecone, pgvector, Supabase. Every answer cites its source. 2–3 weeks.",
    },
    body_md: `## What is a RAG system?

A RAG system works in seven stages:

1. **Ingest** your documents
2. **Chunk** them into retrievable units
3. **Embed** them as vectors
4. **Store** in a vector database (Pinecone or pgvector)
5. **Retrieve** the most relevant chunks when a query comes in
6. Pass them to an **LLM** with the query
7. Return an **answer** that links back to the source document and page number

The result: an AI that knows exactly what your organisation knows, never makes things up, and shows its work.

## When do you need a RAG system?

- Customer support chatbot grounded in product documentation
- HR bot that answers policy questions from your employee handbook
- Legal assistant that searches contracts and flags risk clauses
- Healthcare clinic FAQ bot trained on treatment protocols
- Internal knowledge base search across Notion, Confluence, or Google Drive
- Compliance tool that checks new contracts against regulatory documents

## Our tech stack for RAG

**Vector databases:** Pinecone (managed, production-grade) · pgvector on Supabase (cost-optimised). **Embedding models:** OpenAI text-embedding-3-large · Cohere · Nomic. **LLMs:** Claude (Anthropic) · GPT-4o · Gemini. **Frameworks:** LangChain · LlamaIndex · custom pipelines.

## Deliverables

- Ingestion pipeline (PDF, DOCX, XLSX, web pages, Notion, Confluence)
- Chunking strategy tuned to your document type (policies vs manuals vs FAQs)
- Vector database setup with metadata filters (department, language, date)
- Retrieval pipeline with hybrid search (vector + BM25)
- Guardrails: hallucination detection, out-of-scope deflection
- Front-end: chat UI, WhatsApp integration, or API endpoint
- Monitoring: query logs, citation-accuracy dashboard, re-ranking controls

## Pricing

RAG systems from **₹4L** for a single-corpus deployment to **₹8L+** for multi-tenant, multi-language enterprise systems. Delivered in 2–3 weeks.`,
  },
  {
    slug: "mobile-apps",
    title: "Mobile apps",
    headline: "One codebase. Two stores. AI built in from day one.",
    status: "published",
    position: 5,
    icon: "mobile",
    eta: "4–8 weeks",
    price: "800000",
    tags: ["mobile", "react native", "expo"],
    bullets: ["React Native + Expo", "On-device ML", "Play + App Store ship"],
    summary:
      "React Native + Expo apps for iOS and Android with AI features and on-device ML, shipped to both stores.",
    meta: "Service · React Native + Expo · 4–8 week delivery · From ₹8L",
    lead:
      "We build React Native + Expo mobile apps for iOS and Android simultaneously. Every app includes AI features — voice agents, on-device ML, or LLM-powered search — as standard, not an add-on.",
    seo: {
      title: "React Native Mobile App Development Mumbai | Voltair Tech",
      description:
        "React Native + Expo apps for iOS and Android with AI built in. Play Store & App Store deployment. From ₹8L.",
    },
    body_md: `## What we build

- Consumer apps (marketplaces, social, D2C shopping, booking)
- Enterprise tools (field service, internal dashboards, sales apps)
- Healthcare apps (teleconsultation, medication reminders, secure patient data)
- Fintech apps (UPI integration, portfolio trackers, loan apps)
- EdTech apps (AI tutors, video courses, progress tracking)

## AI capabilities we ship in mobile apps

On-device ML with Vision Camera + TensorFlow Lite · LLM-powered in-app search · voice agents with ElevenLabs · Indic language support (Hindi, Marathi, Tamil) · AI-personalised recommendations · RAG-grounded in-app chatbots.

## Pricing

React Native apps from **₹8L** (simple MVP) to **₹15L+** (complex multi-role apps). Includes Play Store + App Store submission, one round of review fixes, and 30-day post-launch support.`,
  },
  {
    slug: "custom-ai-software",
    title: "Custom AI software",
    headline: "Custom AI software engineered to your spec — not off the shelf",
    status: "published",
    position: 6,
    icon: "code",
    eta: "scoped",
    price: "150000",
    tags: ["custom", "llm", "agents", "copilot"],
    bullets: ["LLM integrations", "Tool-use agents", "Eval + guardrails"],
    summary:
      "Custom AI software: LLM integrations, tool-use agents, copilots, eval pipelines, and production guardrails.",
    meta: "Service · LLM integrations & agents · Scoped delivery",
    lead:
      "When no existing product does exactly what you need, we build it. LLM integrations, tool-use AI agents, AI copilots for your internal tools, eval pipelines, and production guardrails — scoped, built, and handed over with the full codebase.",
    seo: {
      title: "Custom AI Software & LLM Integration India | Voltair Tech",
      description:
        "LLM integrations, tool-use agents, AI copilots, eval pipelines, and guardrails — scoped, built, and handed over with the full codebase.",
    },
    body_md: `## What falls under custom AI software

- AI copilots inside existing web apps (add summarisation, search, or drafting to your product)
- Tool-use agents (AI that browses, reads files, calls APIs, writes to databases)
- LLM fine-tuning pipelines for domain-specific tasks
- Eval frameworks: automated test suites to measure LLM output quality
- Guardrail systems: prompt-injection detection, PII redaction, output classifiers
- Multi-agent orchestration (Claude + GPT working in parallel with handoff logic)

## Delivery model

Custom AI software is scoped after a discovery session. We provide a fixed-price quote covering architecture, build, integration, testing, and handover documentation. Typical engagements run 3–8 weeks.

## Pricing

Scoped on discovery. Simple LLM integrations (add AI search to an existing app) from **₹1.5L**. Full agent systems from **₹6L+**.`,
  },
];

const res = await fetch(`${SITE}/api/services`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-admin-key": KEY },
  body: JSON.stringify({ services }),
});
const text = await res.text();
console.log(`POST ${SITE}/api/services -> ${res.status}`);
console.log(text);
process.exit(res.ok ? 0 : 1);
