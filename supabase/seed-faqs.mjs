/**
 * Populate every FAQ surface in one pass:
 *
 *   1. `site_faqs`      — the 10 standalone questions on /faq (previously
 *                         hardcoded in lib/content.ts).
 *   2. `services.faq`   — a per-service Q&A set for each published service.
 *   3. `industries.faq` — a sector-specific Q&A set for each published industry.
 *
 * Everything goes through the admin-gated write APIs (never straight to
 * Supabase) so each row is validated, normalised, and re-embedded into the RAG
 * store the chatbot reads.
 *
 * Services and industries are FULL-ROW upserts, so this script reads the live
 * row first and re-posts it with only `faq` added — nothing else is touched.
 * Rows that already carry a FAQ are skipped unless you pass --force.
 *
 * Requires migration 0036_faq_everywhere.sql to be applied first.
 *
 * Usage (reads .env.local for SUPABASE_URL / SUPABASE_SERVICE_KEY / ADMIN_API_KEY):
 *   npm run faq:seed                                   # -> https://www.voltairtech.com
 *   npm run faq:seed -- --target=http://localhost:3000
 *   npm run faq:seed -- --force                        # overwrite existing FAQs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const SITE = (
  args.find((a) => a.startsWith("--target="))?.split("=")[1] ||
  process.env.SITE ||
  process.env.SEED_TARGET ||
  "https://www.voltairtech.com"
).replace(/\/$/, "");

function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(resolve(ROOT, ".env.local"), "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#") || !t.includes("=")) continue;
      const i = t.indexOf("=");
      const k = t.slice(0, i).trim();
      if (env[k] === undefined) env[k] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    /* no .env.local — rely on process.env */
  }
  return env;
}
const env = loadEnv();

function need(name) {
  if (!env[name]) {
    console.error(`Missing ${name} (set it in .env.local or the environment).`);
    process.exit(2);
  }
  return env[name];
}

const SUPABASE_URL = need("SUPABASE_URL").replace(/\/$/, "");
const SERVICE_KEY = need("SUPABASE_SERVICE_KEY");
const ADMIN_KEY = env.ADMIN_API_KEY || env.VOLTAIR_ADMIN_KEY;
if (!ADMIN_KEY) {
  console.error("Missing ADMIN_API_KEY (the site's admin key).");
  process.exit(2);
}

const sbHeaders = { apikey: SERVICE_KEY, authorization: `Bearer ${SERVICE_KEY}` };

async function sbSelect(table, query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers: sbHeaders });
  if (!res.ok) {
    throw new Error(`Read ${table} failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

async function postAdmin(path, body) {
  const res = await fetch(`${SITE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-key": ADMIN_KEY },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`POST ${path} failed (${res.status}): ${text}`);
  return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. The standalone /faq page
// ─────────────────────────────────────────────────────────────────────────────
const SITE_FAQS = [
  {
    position: 1,
    category: "About Voltair Tech",
    homepage_featured: true,
    tags: ["mumbai", "about"],
    question: "Who builds AI products in Mumbai?",
    answer:
      "Voltair Tech is an AI services studio based in Andheri West, Mumbai. We work with Indian startups, enterprises, and global teams that need a fast Indian build partner. Our team is on the ground in IST and reachable on WhatsApp during business hours.",
  },
  {
    position: 2,
    category: "About Voltair Tech",
    homepage_featured: false,
    tags: ["mumbai", "maharashtra", "about"],
    question: "Best AI agency in Maharashtra?",
    answer:
      "Voltair Tech is Mumbai-headquartered and serves clients across Maharashtra and the rest of India. We're Razorpay-native and have shipped 42+ AI products since 2024. References available on request after an NDA.",
  },
  {
    position: 3,
    category: "Timelines",
    homepage_featured: true,
    tags: ["timeline", "website"],
    question: "How fast can you deploy a website?",
    answer:
      "AI-powered marketing websites go live in 48 hours from kickoff. That includes design, copy, CMS, analytics, and a custom domain. Larger product apps and mobile builds take longer. We'll give you a fixed timeline at the scoping call.",
  },
  {
    position: 4,
    category: "Pricing",
    homepage_featured: true,
    tags: ["pricing", "cost"],
    question: "How much does an AI app cost in India?",
    answer:
      "A production chatbot starts at ₹1.5L. A full RAG system or AI web app starts at ₹4–8L depending on scope, and mobile apps land at ₹8–15L. All quotes are fixed-price and include 30 days of post-ship support.",
  },
  {
    position: 5,
    category: "What we build",
    homepage_featured: true,
    tags: ["rag", "retrieval"],
    question: "What is a RAG system and when do I need one?",
    answer:
      "RAG (retrieval-augmented generation) grounds a large language model in your own data instead of letting it guess from training. Use it when you need accurate, citable answers from a fixed corpus: policies, manuals, product docs, patient FAQs. Every answer links back to the source chunk so your team can verify it.",
  },
  {
    position: 6,
    category: "What we build",
    homepage_featured: true,
    tags: ["whatsapp", "chatbot"],
    question: "Do you build WhatsApp chatbots?",
    answer:
      "Yes. WhatsApp Business API is one of our most-requested channels. We handle the Meta verification, the conversation flow, payment integrations, and grounding the bot on your own docs. Native support for Hindi, Marathi, and English on the same bot.",
  },
  {
    position: 7,
    category: "What we build",
    homepage_featured: true,
    tags: ["integration", "existing software"],
    question: "Can you integrate AI into our existing software?",
    answer:
      "Almost always, yes. We add LLM features (summarization, search, copilots, agents) to existing web apps, mobile apps, and internal tools without rewriting the stack. Common targets are CRMs, helpdesks, dashboards, and document workflows.",
  },
  {
    position: 8,
    category: "How we work",
    homepage_featured: false,
    tags: ["stack", "tech"],
    question: "What tech stack do you use?",
    answer:
      "Next.js, React Native, n8n, Claude, GPT and Gemini for LLMs, Pinecone or pgvector for retrieval, Supabase or Postgres for data, and Razorpay or Stripe for payments. We pick what fits your scope, not what's trendy. Hosting defaults to Vercel and AWS.",
  },
  {
    position: 9,
    category: "How we work",
    homepage_featured: false,
    tags: ["nda", "legal"],
    question: "Do you sign NDAs?",
    answer:
      "Yes, before the first scoping call if requested. Standard mutual NDA, India-jurisdiction, single page, usually signed the same day. We do not sub-contract or share code with third parties.",
  },
  {
    position: 10,
    category: "How we work",
    homepage_featured: false,
    tags: ["support", "handover"],
    question: "What happens after you ship?",
    answer:
      "Every project includes 30 days of free post-ship support: bug fixes, monitoring, and small tweaks. After that, you can either take full ownership of the code or put us on a monthly retainer for ongoing changes and on-call. The code is 100% yours either way.",
  },
].map((f) => ({ ...f, status: "published" }));

// ─────────────────────────────────────────────────────────────────────────────
// 2. Per-service FAQs. Prices/timelines mirror the live `services` rows.
// ─────────────────────────────────────────────────────────────────────────────
const SERVICE_FAQS = {
  "ai-websites": [
    {
      q: "What does “live in 48 hours” actually include?",
      a: "Design, copy, CMS, auth, payments, analytics, and deployment on your own domain — a production site, not a prototype. The clock starts once your content and brand assets are with us, and we agree the exact scope on a 30-minute kickoff call.",
    },
    {
      q: "How much does a 48-hour AI website cost?",
      a: "₹75,000 fixed price for the standard build, including deployment and 30 days of post-ship support. Extra integrations or a larger page count are quoted upfront — there are no hourly surprises.",
    },
    {
      q: "What do you need from us before the 48 hours start?",
      a: "Your logo and brand colours, the copy or a rough draft of it, any images you want used, and access to your domain's DNS. If the content isn't ready we can draft it with you, which usually adds a day.",
    },
    {
      q: "Do we own the code?",
      a: "Yes, 100%. The repository transfers to your GitHub organisation on handover and the site runs on your own Vercel and domain accounts. No lock-in, no licence fee.",
    },
  ],
  "ai-automation": [
    {
      q: "What kinds of processes can you automate?",
      a: "Anything that moves data between tools on a trigger: lead routing from forms into your CRM, invoice and document processing, WhatsApp and email follow-ups, report generation, and Slack or Sheets notifications. We build on n8n so the workflows stay readable and editable by your team.",
    },
    {
      q: "How much does AI automation cost?",
      a: "From ₹25,000 for a single workflow, delivered in 1–2 weeks. Multi-step automations spanning several systems are scoped and fixed-priced after a short discovery call.",
    },
    {
      q: "Will it work with the software we already use?",
      a: "In most cases, yes. If a tool has an API or webhook we can connect it — CRMs, helpdesks, accounting software, Google Workspace, Slack, and WhatsApp are routine. We confirm every integration during scoping, before you commit.",
    },
    {
      q: "What happens if a workflow breaks?",
      a: "Every automation ships with error handling and failure alerts, so you find out before your customers do. The first 30 days of fixes are included; after that you can self-manage in n8n or keep us on a retainer.",
    },
  ],
  "rag-systems": [
    {
      q: "How much does a RAG system cost and how long does it take?",
      a: "From ₹4L, delivered in 2–3 weeks. That's a fixed price covering ingestion, the retrieval pipeline, evaluation, and deployment, plus 30 days of post-ship support.",
    },
    {
      q: "How do you stop the AI from making things up?",
      a: "The model only answers from chunks retrieved out of your own documents, and every answer carries a citation back to its source. When retrieval finds nothing relevant, the system says so instead of guessing. We ship an evaluation set so you can measure accuracy yourself rather than take our word for it.",
    },
    {
      q: "Where does our data live?",
      a: "In your own Supabase or Postgres project with pgvector, in the region you choose. We don't copy your corpus anywhere else, and your documents are never used to train a model.",
    },
    {
      q: "What file types can you ingest, and how much content?",
      a: "PDFs, Word documents, spreadsheets, web pages, and database records are all routine, and the pipeline handles corpora from a few hundred to tens of thousands of documents. Re-ingestion runs on a schedule so answers track your latest content.",
    },
  ],
  "mobile-apps": [
    {
      q: "How much does a mobile app cost in India?",
      a: "From ₹8L for a production React Native app, delivered in 4–8 weeks depending on scope. The quote is fixed after scoping and covers both iOS and Android from a single codebase.",
    },
    {
      q: "Do you handle App Store and Play Store submission?",
      a: "Yes. We take the build through both review processes, including store listings, privacy declarations, and signing setup. Apps ship under your own developer accounts, which you keep.",
    },
    {
      q: "iOS and Android — is that one build or two?",
      a: "One React Native and Expo codebase produces both, which is why the timeline and price are what they are. Where a platform genuinely needs native code we write it, and you still get a single repository to maintain.",
    },
    {
      q: "Can the app work offline or run AI on-device?",
      a: "Yes to both. We build offline-first data sync where the use case needs it, and on-device ML for features that must run without a network or keep data on the handset.",
    },
  ],
  "custom-ai-software": [
    {
      q: "How is this different from your other services?",
      a: "The catalogue services solve a shaped problem — a website, a RAG system, a voice agent. This is for everything else: internal tools, LLM features inside an existing product, agent workflows, and integrations that don't fit a template. Scope and price are set after a discovery call.",
    },
    {
      q: "What does it cost?",
      a: "From ₹1.5L, with the final figure fixed once we've scoped the work. We quote a flat number and a date rather than an hourly rate, so the budget doesn't drift during the build.",
    },
    {
      q: "Can you add AI to software we already have?",
      a: "Almost always. We add summarisation, search, copilots, and agents to existing web apps, mobile apps, and internal tools without rewriting your stack. Common targets are CRMs, helpdesks, dashboards, and document workflows.",
    },
    {
      q: "Which models do you use?",
      a: "Claude, GPT, and Gemini, chosen per task on cost, latency, and quality — and swappable later, because we keep the provider behind an abstraction. Where a workload suits it, we'll run a smaller or self-hosted model to cut your running cost.",
    },
  ],
  "voice-agents-ivr-automation": [
    {
      q: "What can a voice agent actually handle?",
      a: "Answering inbound calls, booking and rescheduling appointments, order and delivery status, qualifying inbound leads, and clean escalation to a human when the caller asks or the agent isn't confident. It runs 24/7 and nobody waits in a queue.",
    },
    {
      q: "Does it speak Hindi and Marathi?",
      a: "Yes — Hindi, Marathi, and English on the same number, with the agent switching to whichever language the caller uses. Other Indian languages can be added during scoping.",
    },
    {
      q: "How much does it cost and how fast can it go live?",
      a: "From ₹2L, live in 2–3 weeks. That covers the build; telephony and speech-provider usage is billed by those vendors directly, and we'll size that cost with you before you commit.",
    },
    {
      q: "Will callers know they're talking to an AI?",
      a: "We disclose it at the start of the call. It's the honest default and it sets expectations that make the conversation go better. The agent hands off to a human whenever the caller asks.",
    },
  ],
  "ai-compliance-regtech-gst-dpdp-act": [
    {
      q: "What does the DPDP Act mean for our AI systems?",
      a: "India's Digital Personal Data Protection Act, 2023 governs how you collect, process, and store personal data — including anything you feed to an AI model. In practice that means consent tracking, purpose limitation, deletion on request, and breach notification. We build those controls into the system rather than bolting them on afterwards.",
    },
    {
      q: "What do you actually build here?",
      a: "Consent and audit-trail infrastructure, data retention and deletion workflows, GST reconciliation and filing automation, and monitoring that flags exceptions before a deadline does. From ₹3L, delivered in 2–3 weeks.",
    },
    {
      q: "Is this legal advice?",
      a: "No. We're engineers, not a law firm — we build the systems that implement the policy your counsel sets. We're happy to work directly with your legal advisors so the implementation matches their reading of the rules.",
    },
    {
      q: "Can the system keep our data inside India?",
      a: "Yes. We deploy to Indian regions and keep personal data in a database you control, which is the usual starting point for a DPDP-conscious architecture. Where a model call has to leave the region, we'll show you exactly what data does and doesn't go with it.",
    },
  ],
  "custom-self-improving-ai-agents": [
    {
      q: "What makes an agent “self-improving”?",
      a: "It logs every run, scores outcomes against an evaluation set, and feeds those results back into its prompts, retrieval, and tool selection. You get a dashboard showing whether it's getting better or worse over time, instead of guessing.",
    },
    {
      q: "How much does it cost and how long does it take?",
      a: "From ₹5L, delivered in 3–5 weeks. The build includes the agent, the tools it can call, the evaluation harness, and the guardrails — fixed price, with 30 days of post-ship support.",
    },
    {
      q: "What stops an agent from doing something it shouldn't?",
      a: "Scoped tool permissions, hard limits on what it can call, human approval gates on irreversible actions, and full run logging. We agree the blast radius during scoping and enforce it in code.",
    },
    {
      q: "What kinds of work do these agents take on?",
      a: "Multi-step jobs a script can't handle: research and enrichment, triage and routing of inbound queries, document processing that needs judgement, and internal copilots that read across several systems at once.",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Per-industry FAQs — sector-specific questions (compliance, data,
//    integrations, ROI). Generic questions belong on /faq, not here.
// ─────────────────────────────────────────────────────────────────────────────
const INDUSTRY_FAQS = {
  "d2c-ecommerce": [
    {
      q: "Will it integrate with Shopify or WooCommerce?",
      a: "Yes — both are routine, along with Magento and custom carts. We connect over their APIs, so order status, catalogue, and customer data stay in your store as the single source of truth.",
    },
    {
      q: "What's the fastest win for a D2C brand?",
      a: "Usually a WhatsApp order-status and support bot. It absorbs the “where is my order” volume that dominates D2C support and can go live in about a week. COD confirmation and abandoned-cart recovery flows are close behind.",
    },
    {
      q: "Can it handle returns and COD confirmation?",
      a: "Yes. Return initiation, pickup scheduling, and COD confirmation are standard WhatsApp flows for us, and they hand off to a human the moment a case gets unusual.",
    },
    {
      q: "How do you handle festive-season traffic spikes?",
      a: "The systems run serverless and scale with load rather than on fixed capacity, so a Diwali spike doesn't need re-architecting. We load-test ahead of peak season if you tell us the numbers you're expecting.",
    },
  ],
  "healthcare-clinics": [
    {
      q: "Is patient data safe with an AI system?",
      a: "Patient data stays in a database you control, hosted in India, and it is never used to train a model. Access is logged, and the assistant only answers from clinical documents you have approved.",
    },
    {
      q: "Can it book and reschedule appointments in our existing system?",
      a: "Yes, wherever your practice-management or EMR system exposes an API. We sync slots both ways so the bot can't double-book, and we confirm the integration during scoping before you commit.",
    },
    {
      q: "Will the AI give medical advice?",
      a: "No. We scope these assistants to logistics and to answering from your own approved material — appointments, preparation instructions, timings, and policies. Anything clinical is routed to your staff.",
    },
    {
      q: "Does it work for patients who don't speak English?",
      a: "Yes. Hindi, Marathi, and English run on the same WhatsApp number or phone line, with the assistant matching whichever language the patient uses.",
    },
  ],
  "fintech-payments": [
    {
      q: "How do you handle RBI and DPDP compliance?",
      a: "We build to keep personal and financial data in Indian infrastructure you control, with consent tracking, audit trails, and retention rules implemented in the system itself. We're engineers rather than a compliance authority, so we build against the requirements your compliance team sets.",
    },
    {
      q: "Can AI make lending or underwriting decisions?",
      a: "We build systems that gather, verify, and summarise for a human decision-maker, keeping an audit trail of what informed each recommendation. Fully automated adverse decisions are a policy call for your risk and compliance teams, not something we ship by default.",
    },
    {
      q: "Which payment and data providers do you integrate?",
      a: "Razorpay and Stripe are routine, along with account-aggregator, KYC, and bureau APIs. If a provider has documented APIs we can connect it, and we confirm each one during scoping.",
    },
    {
      q: "What's the most common first build in this sector?",
      a: "Document-heavy work: KYC and statement processing, and a RAG assistant over policy and product documentation so support and sales stop guessing. Both show measurable time savings quickly.",
    },
  ],
  "real-estate": [
    {
      q: "How does AI help with property leads?",
      a: "It answers and qualifies inbound enquiries within seconds at any hour, then routes the serious ones to an agent with the context already collected. Speed of first response is the single biggest lever on portal leads, which go cold fast.",
    },
    {
      q: "Can it answer questions about specific properties?",
      a: "Yes. We ground the assistant in your inventory — configurations, pricing, floor plans, amenities, and location detail — so answers come from your listings rather than a model's guesswork.",
    },
    {
      q: "Does it work with our CRM and the portals we list on?",
      a: "Yes, wherever they expose APIs or webhooks. Leads from portals, your website, and WhatsApp land in one place with the qualification already attached.",
    },
    {
      q: "Can it handle site-visit scheduling?",
      a: "Yes — booking, confirmation, reminders, and rescheduling, synced to your agents' calendars. The reminder flow is what cuts no-shows.",
    },
  ],
  "education-edtech": [
    {
      q: "What can AI do for an institute or edtech product?",
      a: "Admissions counselling and enquiry handling at scale, doubt-solving grounded in your own course material, and automated progress and attendance updates to parents. Admissions is usually where the return shows up first.",
    },
    {
      q: "Will the assistant answer from our syllabus or from the internet?",
      a: "From your material. We ground it in your courseware so answers match what you actually teach, and it says it doesn't know rather than inventing an answer from outside the syllabus.",
    },
    {
      q: "Is it appropriate for use by students, including minors?",
      a: "We scope these systems tightly, keep data handling minimal and consent-based, and build in escalation to staff. Where minors are involved, the guardrails and the data policy are agreed with you before the build starts.",
    },
    {
      q: "Can parents get updates in their own language?",
      a: "Yes. Hindi, Marathi, and English are standard on the same WhatsApp number, and other Indian languages can be added during scoping.",
    },
  ],
  "logistics-supply-chain": [
    {
      q: "What's the highest-value AI use case in logistics?",
      a: "Self-service shipment tracking. “Where is my consignment” is the bulk of inbound volume, and a WhatsApp bot wired to your tracking system absorbs it without adding headcount.",
    },
    {
      q: "Can it plug into our TMS or WMS?",
      a: "Yes, wherever those systems expose APIs — and where they don't, we can work from scheduled exports. We confirm the integration path during scoping so there are no surprises mid-build.",
    },
    {
      q: "Can it notify customers proactively instead of waiting to be asked?",
      a: "Yes, and that's usually the bigger win. Dispatch, out-for-delivery, delay, and exception notifications cut the inbound queries before they happen.",
    },
    {
      q: "Does it work for drivers and field staff, not just customers?",
      a: "Yes. WhatsApp and voice suit field teams well — proof-of-delivery capture, exception reporting, and status updates, without asking anyone to install and learn a new app.",
    },
  ],
  "professional-services": [
    {
      q: "Is it safe to put client documents into an AI system?",
      a: "The documents stay in infrastructure you control, are never used to train a model, and access is logged. For firms with confidentiality obligations we scope data handling explicitly before the build, and we can keep everything in Indian regions.",
    },
    {
      q: "What does AI actually do for a law or CA firm?",
      a: "It searches across your own matter files and precedents with citations, drafts first passes of routine documents, and automates GST and filing-deadline tracking. It compresses research and drafting time; it does not replace professional judgement.",
    },
    {
      q: "Can it be trusted to be accurate on the law?",
      a: "It answers only from your own documents and cites the source for every claim, so a professional can verify in seconds. We build it as a research accelerator for a qualified reviewer, never as an unchecked authority.",
    },
    {
      q: "Does it handle GST return and compliance deadlines?",
      a: "Yes — reconciliation, exception flagging, and deadline monitoring are a common first build, often paired with our AI Compliance & RegTech service.",
    },
  ],
  "hospitality-travel": [
    {
      q: "Can AI take bookings and orders over the phone?",
      a: "Yes. A voice agent answers every call instantly, takes reservations and orders, handles the routine questions about timings and location, and hands off to staff when it should. Nobody sits on hold during a dinner rush.",
    },
    {
      q: "Will it work with our POS or reservation system?",
      a: "Wherever those systems have APIs, yes — table availability and orders sync both ways so nothing gets double-booked. We confirm the integration during scoping.",
    },
    {
      q: "What languages does it handle?",
      a: "Hindi, Marathi, and English on the same number, switching to whichever the guest speaks. Additional languages can be added if you serve a particular market.",
    },
    {
      q: "Can it deal with a full house or a waitlist?",
      a: "Yes. It can offer alternative slots, take waitlist entries, and notify guests when a table frees up, rather than simply declining the booking.",
    },
  ],
  "manufacturing-industrial": [
    {
      q: "What does AI change for a manufacturing business?",
      a: "The paperwork and enquiry load, mostly. RFQ intake and quotation, order status for dealers and distributors, and search across specification and compliance documents are where the time goes — and where the return shows up first.",
    },
    {
      q: "Can it handle technical product enquiries?",
      a: "Yes. We ground the assistant in your specification sheets, catalogues, and drawings so it answers with real numbers and cites the document, rather than approximating.",
    },
    {
      q: "Does it integrate with our ERP?",
      a: "Wherever the ERP has APIs, yes — SAP, Tally, and Zoho are common. Where it doesn't, we can work from scheduled exports. Either way we confirm the path during scoping.",
    },
    {
      q: "Is this worth it if our order volume is low but each order is large?",
      a: "Often yes, because the value is in response speed and quotation turnaround rather than in volume. Being first with an accurate quote is what wins high-value B2B enquiries.",
    },
  ],
  "automotive-mobility": [
    {
      q: "What are dealerships using AI for?",
      a: "Instant response to enquiries from portals and the website, test-drive scheduling, service booking and reminders, and answering the routine questions about variants, pricing, and availability at any hour.",
    },
    {
      q: "Can it book and remind for service?",
      a: "Yes — booking, confirmation, reminders, and follow-up after the visit, synced to your workshop calendar. The reminder flow is what brings lapsed customers back.",
    },
    {
      q: "Does it know our current inventory and prices?",
      a: "It answers from your own data, so yes, provided we can connect to your DMS or inventory feed. That's what keeps it from quoting a variant or a price you no longer offer.",
    },
    {
      q: "How fast does it respond to a lead?",
      a: "Within seconds, day or night. In automotive the first dealer to respond usually gets the test drive, so response time is effectively the whole game on portal leads.",
    },
  ],
  "saas-b2b-tech": [
    {
      q: "What's the fastest AI win for a SaaS product?",
      a: "A support assistant grounded in your docs and help centre. It deflects the repetitive tickets and cites the document it answered from, so trust stays intact. In-product onboarding copilots are the usual second step.",
    },
    {
      q: "Can you build AI features into our existing product?",
      a: "Yes — that's most of this work. We add search, summarisation, copilots, and agents to your existing codebase without a rewrite, and hand the code to your team.",
    },
    {
      q: "Will our customers' data be used to train models?",
      a: "No. Your data and your customers' data stay in your infrastructure and are never used for training. We can keep everything in a region you specify.",
    },
    {
      q: "Which models and infrastructure do you use?",
      a: "Claude, GPT, or Gemini depending on cost, latency, and quality for the task, with pgvector or Pinecone for retrieval — all kept behind an abstraction so you can swap providers without a rewrite.",
    },
  ],
  "travel-tourism": [
    {
      q: "Can AI handle itinerary and booking enquiries?",
      a: "Yes — answering package questions, assembling itinerary options from your own inventory, and capturing booking details, at any hour and in the traveller's language. Enquiries arrive around the clock and across time zones; a bot doesn't mind.",
    },
    {
      q: "Does it answer from our packages or make things up?",
      a: "From your packages. We ground it in your actual inventory, pricing, and terms, so it can't invent an itinerary or a price you don't sell.",
    },
    {
      q: "What languages does it support?",
      a: "Hindi, Marathi, and English as standard on the same channel, with more added during scoping if you serve specific inbound markets.",
    },
    {
      q: "Can it help after the traveller has booked?",
      a: "Yes, and that's where much of the load sits — pre-departure documents and reminders, itinerary changes, and in-trip questions, all on WhatsApp where travellers already are.",
    },
  ],
  "recruitment-hr": [
    {
      q: "Can AI screen résumés fairly?",
      a: "We build screening that ranks against criteria you define and shows its reasoning for each candidate, so a recruiter can audit and override it. It's a shortlisting aid for a human decision, not an automatic reject machine.",
    },
    {
      q: "What else does it do beyond screening?",
      a: "Candidate Q&A about the role and the process, interview scheduling, and search across your résumé bank so past applicants surface for new roles instead of being lost.",
    },
    {
      q: "Where does candidate data live, and how long is it kept?",
      a: "In a database you control, with retention and deletion rules we agree during scoping — which matters under the DPDP Act, since candidate data is personal data.",
    },
    {
      q: "Does it integrate with our ATS?",
      a: "Wherever the ATS has an API, yes. Where it doesn't, we can work from exports, or build the workflow standalone and sync the outcome back.",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Re-post whole rows with `faq` merged in. These endpoints are full upserts, so
 * we send the live row back verbatim plus the FAQ — anything omitted would be
 * reset to its default (that's how case_studies/custom_services get wiped).
 */
async function seedRecords({ table, columns, apiPath, batchKey, faqMap, label }) {
  const rows = await sbSelect(table, `select=${columns}&order=position`);
  const payload = [];
  let skipped = 0;

  for (const row of rows) {
    const faq = faqMap[row.slug];
    if (!faq) {
      console.log(`  – ${row.slug}: no FAQ authored, left as-is`);
      continue;
    }
    if (!FORCE && Array.isArray(row.faq) && row.faq.length) {
      skipped += 1;
      console.log(`  – ${row.slug}: already has ${row.faq.length} — skipped (use --force)`);
      continue;
    }
    payload.push({ ...row, faq });
  }

  if (!payload.length) {
    console.log(`  nothing to write (${skipped} already populated)\n`);
    return;
  }

  await postAdmin(apiPath, { [batchKey]: payload });
  console.log(`  ✓ wrote FAQs to ${payload.length} ${label} (re-embedded for the chatbot)\n`);
}

const SERVICE_COLUMNS =
  "slug,title,headline,summary,bullets,eta,icon,cover_image,lead,meta,body_md,price,tags,seo,faq,position,status,published_at";
const INDUSTRY_COLUMNS =
  "slug,title,headline,summary,bullets,icon,cover_image,icon_image,lead,meta,body_md,tags,service_slugs,custom_services,case_studies,faq,seo,position,homepage_featured,status,published_at";

console.log(`Seeding FAQs → ${SITE}${FORCE ? "  (--force: overwriting existing)" : ""}\n`);

console.log("1. /faq page (site_faqs)");
await postAdmin("/api/faqs", { faqs: SITE_FAQS });
console.log(`  ✓ wrote ${SITE_FAQS.length} questions\n`);

console.log("2. Services");
await seedRecords({
  table: "services",
  columns: SERVICE_COLUMNS,
  apiPath: "/api/services",
  batchKey: "services",
  faqMap: SERVICE_FAQS,
  label: "services",
});

console.log("3. Industries");
await seedRecords({
  table: "industries",
  columns: INDUSTRY_COLUMNS,
  apiPath: "/api/industries",
  batchKey: "industries",
  faqMap: INDUSTRY_FAQS,
  label: "industries",
});

console.log("Done. Check /faq, a /services/<slug> page, and an /industries/<slug> page.");
