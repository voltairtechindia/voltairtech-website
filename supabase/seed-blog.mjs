/**
 * Seed the 3 original Voltair blog articles into the DB (and the chatbot RAG
 * store) by POSTing them to the site's admin-gated /api/blog endpoint. These
 * were previously hardcoded React pages; they now live in `blog_posts` so the
 * admin panel can edit them and the chatbot can cite them.
 *
 * Usage (with the dev server running, env loaded):
 *   ADMIN_API_KEY=... node supabase/seed-blog.mjs                 # -> http://localhost:3000
 *   ADMIN_API_KEY=... SITE=https://www.voltairtech.com node supabase/seed-blog.mjs
 */

const SITE = process.env.SITE || process.env.VOLTAIR_API_URL || "http://localhost:3000";
const KEY = process.env.ADMIN_API_KEY || process.env.VOLTAIR_ADMIN_KEY;

if (!KEY) {
  console.error("Set ADMIN_API_KEY (the site's admin key) in the environment.");
  process.exit(1);
}

const posts = [
  {
    slug: "what-is-rag-india",
    title: "What is RAG (Retrieval-Augmented Generation)? A Plain-English Guide for India",
    status: "published",
    author: "Voltair Tech",
    tags: ["RAG", "Explainer"],
    excerpt:
      "RAG explained without jargon: what it is, why Indian businesses need it, how it works in 7 steps, and when it beats fine-tuning.",
    seo: {
      title: "What is RAG? A Plain-English Guide for India | Voltair Tech",
      description:
        "RAG explained without jargon: what it is, why Indian businesses need it, how it works in 7 steps, and when it beats fine-tuning.",
    },
    body_md: `RAG stands for Retrieval-Augmented Generation. It is the technique that makes an AI answer questions from your documents instead of its training data — the single most important concept for any Indian business buying or building AI.

## The problem RAG solves

Large language models like GPT-4 and Claude are trained on data that ends at a cutoff date. They don't know your product catalogue, your return policy, your employee handbook, or your pricing. Ask them and they either refuse or — dangerously — make something up. This is called hallucination.

RAG fixes this. Instead of relying on training data, a RAG system retrieves the relevant section of your actual documents and passes it to the LLM as context. The model answers based on what it was just given, not what it vaguely remembers.

## How a RAG system works — 7 steps

1. **Ingest** — your documents (PDFs, DOCX, web pages, Notion pages) are uploaded into the pipeline.
2. **Chunk** — documents are split into retrievable units (paragraphs, sections, ~500-token chunks).
3. **Embed** — each chunk is converted to a vector (a list of numbers) by an embedding model.
4. **Store** — vectors are stored in a vector database (Pinecone, pgvector, or Supabase).
5. **Query** — when a user asks a question, the question is also embedded as a vector.
6. **Retrieve** — the system finds the chunks whose vectors are closest to the question vector.
7. **Generate** — the LLM receives the question + retrieved chunks and generates an answer that cites the source.

## RAG vs fine-tuning — which does India need?

|  | RAG | Fine-tuning |
| --- | --- | --- |
| Cost | ₹4–8L build, low inference cost | ₹10L+ for a quality fine-tune |
| Updating your data | Instant — add docs to the vector DB | Requires a full retrain (weeks, expensive) |
| Hallucination on your data | Rare (grounded in your docs) | Sometimes (learned, not retrieved) |
| Best for | Knowledge bases, FAQs, policies | Style/tone adaptation, classification |
| India compliance | Data stays in your control | Training data must be managed carefully |

## Real Indian use cases for RAG

- A legal firm whose associates query 10 years of case files in plain English
- A manufacturer whose service engineers get instant answers from 2,000-page machine manuals
- A bank whose compliance team checks new contracts against RBI circulars automatically
- A hospital whose WhatsApp bot answers patient questions from the clinic's protocol documents

## FAQs — RAG for Indian businesses

### Does my data leave India if I use a RAG system?

Only if you use a US-hosted vector database. Voltair Tech defaults to pgvector on Supabase with an ap-south-1 (Mumbai) region, keeping your data on Indian servers and aligning with DPDP Act 2023 requirements.

### How long does it take to build a RAG system?

A single-corpus RAG system (one knowledge base, one front-end) takes 2–3 weeks from kickoff to production. Multi-tenant or multi-language systems take 4–6 weeks.

### Can RAG work in Hindi and Marathi?

Yes. Embedding models from Cohere and OpenAI support Indic languages, and the LLM (Claude or GPT-4o) generates fluent Hindi and Marathi responses. Retrieval works regardless of whether the query language matches the document language.

---

**Want a RAG system on your documents?** [Start a project](/contact) — we ship citation-grade RAG in 2–3 weeks, fixed price.`,
  },
  {
    slug: "whatsapp-chatbot-business-india",
    title: "How to Build a WhatsApp Chatbot for Your Business in India (2025 Guide)",
    status: "published",
    author: "Voltair Tech",
    tags: ["WhatsApp", "How-to"],
    excerpt:
      "Step-by-step: WhatsApp Business API setup, message templates, bot flow design, Razorpay integration, and Hindi/Marathi support.",
    seo: {
      title: "How to Build a WhatsApp Chatbot for Your Business in India (2025 Guide) | Voltair Tech",
      description:
        "WhatsApp Business API setup, message templates, bot flow design, Razorpay integration, and Hindi/Marathi support.",
    },
    body_md: `India has 500 million WhatsApp users. Your customers are already there. A WhatsApp Business API chatbot can handle FAQs, collect leads, process orders, and speak Hindi — 24/7, without a support team. Here's exactly how to build one.

## Step 1 — Get Meta Business Verification

Before you can use WhatsApp Business API, your business must be verified by Meta. Requirements: a registered Indian company, a business website, and a phone number not already on WhatsApp. Verification takes 3–7 business days if documents are in order.

## Step 2 — Choose your API access method

Two paths: direct Cloud API access (recommended for new builds — managed by Meta, lower latency) or the legacy on-premises API (being sunset). Voltair Tech uses Cloud API for all new builds.

## Step 3 — Design your conversation flows

Map every intent your customers might express — timings, location, returns, order status. Each intent needs a response flow: a fixed answer, a RAG lookup, or a human escalation trigger.

## Step 4 — Build the bot and integrate AI

A basic button-flow bot handles known intents. An AI-powered bot with a language model at its core handles free-text inputs in Hinglish or Hindi without any hardcoded keyword matching.

## Step 5 — Add payment integration

Until WhatsApp Pay (UPI) reaches full coverage, integrate Razorpay to accept UPI, cards, and net banking inside the conversation using payment links. Customers pay without leaving the app.

## Step 6 — Test, submit templates, and go live

Every outbound message must use a Meta-approved template (24–72 hours to approve). Test all flows in staging with a dedicated test number before going live on the business number.

## How much does a WhatsApp chatbot cost in India?

A basic button-flow bot: **₹50,000–₹80,000**. An AI-powered bot with free-text understanding and RAG grounding: **₹1.5L–₹3L**. WhatsApp API conversation charges from Meta run roughly ₹0.60–₹1.50 per conversation depending on category.

## FAQs

### Can a WhatsApp bot respond in Hindi and English on the same number?

Yes — language detection is automatic. If a customer sends "Namaste, appointment chahiye", the bot responds in Hindi. If they write "I need to rebook my order", it responds in English. Same bot, same number.

### What is the difference between WhatsApp Business App and WhatsApp Business API?

The Business App is a free mobile app for small businesses — one device, manual responses, basic automation. The Business API connects your business to Meta's cloud infrastructure, enabling bots, bulk messaging, multi-agent support, and payment integrations.

---

**Build your WhatsApp bot with Voltair Tech** — 1-week delivery, fixed price. [Start a project](/contact).`,
  },
  {
    slug: "dpdp-act-2023-ai-compliance",
    title: "DPDP Act 2023 & AI — What Every Indian AI Product Must Do",
    status: "published",
    author: "Voltair Tech",
    tags: ["Compliance", "Guide"],
    excerpt:
      "The Digital Personal Data Protection Act 2023 applies to every AI product handling Indian user data. Consent, purpose limitation, data localisation, and deletion obligations explained.",
    seo: {
      title: "DPDP Act 2023 & AI — What Every Indian AI Product Must Do | Voltair Tech",
      description:
        "Consent, purpose limitation, data localisation, and deletion obligations under the DPDP Act 2023 — for AI builders.",
    },
    body_md: `The Digital Personal Data Protection Act 2023 is India's first comprehensive data protection law. It applies to every organisation that processes the personal data of Indian users — including every AI product, chatbot, and automation pipeline.

## What counts as personal data under DPDP?

Any data that can identify an individual: name, phone number, email, Aadhaar number, location data, IP address, financial data, health records, and any combination that makes identification possible. Anonymised data that cannot be re-identified is exempt.

## Sensitive personal data (higher obligations)

- Financial data (bank account, credit card, transaction history)
- Health and medical data (patient records, prescription history)
- Biometric data (fingerprints, facial recognition)
- Caste or religious data
- Sexual orientation

## 7 DPDP obligations for AI products

1. **Consent** — explicit, informed, granular consent before collecting any personal data. No bundled consent forms.
2. **Purpose limitation** — data collected for a specific purpose may only be used for that purpose. A chatbot collecting phone numbers for appointments cannot use them for marketing without separate consent.
3. **Data minimisation** — collect only what you actually need. A delivery tracking bot doesn't need the user's date of birth.
4. **Storage limitation** — don't keep data longer than necessary. Implement automated deletion schedules.
5. **Data localisation** — sensitive personal data must be stored on Indian servers. Check your cloud provider's region settings.
6. **Right to erasure** — users can request deletion of their data. Your AI system must have a verifiable, documented deletion mechanism.
7. **Breach notification** — notify affected users and the Data Protection Board within 72 hours of discovering a breach.

## DPDP compliance checklist for AI builders

- Consent UI is explicit and granular
- Privacy policy references the DPDP Act 2023
- Vector database and AI model APIs use Indian or approved data centres
- Deletion endpoint is tested and documented
- Third-party APIs (OpenAI, Anthropic, etc.) have data processing agreements
- Breach notification SLA is defined internally

## How Voltair Tech handles DPDP by default

Every product we ship includes: DPDP-compliant consent capture, a tested deletion mechanism, pgvector on ap-south-1 (Mumbai) as the default vector store, and a privacy policy that explicitly references the DPDP Act 2023. We include DPDP documentation in the handover package.

## FAQs — DPDP and AI

### Does DPDP apply to B2B AI products?

Yes. If your B2B AI product processes the personal data of individuals (even employees of your clients), DPDP applies. The B2B exemption under DPDP is narrow and does not cover processing of individual personal data.

### Do US-hosted AI APIs (OpenAI, Anthropic) comply with DPDP?

Both OpenAI and Anthropic offer data processing agreements and data residency options, but the default API endpoint sends data to US servers. For sensitive personal data, use a regional deployment in India or implement a data-scrubbing layer before sending to any foreign API.

---

**Build a DPDP-compliant AI product** — compliance on day one, not as an afterthought. [Start a project](/contact).`,
  },
];

const res = await fetch(`${SITE}/api/blog`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-admin-key": KEY },
  body: JSON.stringify({ posts }),
});
const text = await res.text();
console.log(`POST ${SITE}/api/blog -> ${res.status}`);
console.log(text);
process.exit(res.ok ? 0 : 1);
