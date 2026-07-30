/**
 * Seed the Voltair industries into the DB (and the chatbot RAG store) by
 * POSTing them to the admin-gated /api/industries endpoint. These were
 * previously a hardcoded array in app/industries/page.tsx; they now live in the
 * `industries` table so the admin panel can edit them, link services to each
 * sector, and the chatbot can cite them.
 *
 * ⚠️  ONE-TIME BOOTSTRAP — DO NOT RE-RUN against a live DB.
 * This was already applied and the live data has since diverged (new sectors,
 * admin-edited copy, case studies, homepage_featured flags, cover/badge images,
 * reordered positions). /api/industries does a FULL-ROW upsert, so re-running
 * this would OVERWRITE every industry's case_studies → [], cover_image/icon_image
 * → null, etc. for any field this file omits — silently wiping admin work (and
 * emptying the homepage "Proof" section). Edit industries in voltairtech-admin
 * instead. If you must re-seed, first mirror the current live rows here.
 *
 * `service_slugs` must reference slugs that exist in `services` (seed those
 * first with supabase/seed-services.mjs).
 *
 * Usage (dev server running, env loaded):
 *   ADMIN_API_KEY=... node supabase/seed-industries.mjs                 # -> http://localhost:3000
 *   ADMIN_API_KEY=... SITE=https://www.voltairtech.com node supabase/seed-industries.mjs
 */

const SITE = process.env.SITE || process.env.VOLTAIR_API_URL || "http://localhost:3000";
const KEY = process.env.ADMIN_API_KEY || process.env.VOLTAIR_ADMIN_KEY;

if (!KEY) {
  console.error("Set ADMIN_API_KEY (the site's admin key) in the environment.");
  process.exit(1);
}

const industries = [
  {
    slug: "d2c-ecommerce",
    title: "D2C & E-commerce",
    status: "published",
    position: 1,
    icon: "d2c",
    tags: ["d2c", "ecommerce", "retail", "whatsapp", "razorpay"],
    service_slugs: ["ai-websites", "whatsapp-chatbot", "ai-automation"],
    summary:
      "Storefronts, WhatsApp order bots, Razorpay/UPI checkout, and AI product search that converts.",
    headline: "AI for D2C & e-commerce brands",
    meta: "Industry · D2C & e-commerce",
    lead:
      "India shops on the phone and orders on WhatsApp. We build storefronts, order bots and AI product search that turn that behaviour into revenue — live fast, India-first by default.",
    bullets: [
      "WhatsApp order bots",
      "Razorpay / UPI checkout",
      "AI product search",
      "48-hour storefronts",
      "Order-to-dispatch automation",
      "Abandoned-cart recovery bots",
    ],
    seo: {
      title: "AI for D2C & E-commerce Brands India | Voltair Tech",
      description:
        "Storefronts, WhatsApp order bots, Razorpay/UPI checkout and AI product search for D2C brands. Built in Mumbai, live fast.",
    },
    body_md: `## What we build for D2C & e-commerce

- **Storefronts that convert** — fast Next.js sites with Razorpay/UPI checkout, built in 48 hours.
- **WhatsApp order bots** — browse, order and pay inside the chat, in Hindi, Marathi or English.
- **AI product search** — natural-language search and recommendations that find the right SKU.
- **Back-office automation** — order placed → inventory update → dispatch alert → review request, hands-off.

## Why brands pick Voltair

Campaigns don't wait for six-week timelines. We ship the landing page before the ad drops, wire the bot to your catalogue, and hand you a stack you fully own — Razorpay-native and built to scale with your next sale.`,
  },
  {
    slug: "healthcare-clinics",
    title: "Healthcare & Clinics",
    status: "published",
    position: 2,
    icon: "healthcare",
    tags: ["healthcare", "clinics", "rag", "appointments"],
    service_slugs: ["whatsapp-chatbot", "rag-systems", "custom-ai-software"],
    summary:
      "Appointment bots, patient-FAQ RAG grounded in your protocols, and secure patient-data handling.",
    headline: "AI for healthcare & clinics",
    meta: "Industry · Healthcare & clinics",
    lead:
      "Patient trust is everything. We build appointment bots and patient-FAQ assistants grounded in your own protocols — never guessing — with secure, consent-first patient-data handling from day one.",
    bullets: [
      "Appointment & reminder bots",
      "Protocol-grounded patient FAQ",
      "Secure patient-data handling",
      "Intake & triage automation",
      "Multilingual patient bots",
      "Audit-ready compliance logs",
    ],
    seo: {
      title: "AI for Healthcare & Clinics India | Voltair Tech",
      description:
        "Appointment bots, patient-FAQ RAG grounded in your protocols, and secure patient-data handling for clinics and hospitals.",
    },
    body_md: `## What we build for healthcare

- **Appointment & reminder bots** on WhatsApp — booking, confirmations, follow-ups, no front-desk overload.
- **Patient-FAQ assistants** grounded in *your* treatment protocols via RAG, so every answer is cited and safe.
- **Intake & triage automation** that routes the right query to the right team.
- **Secure patient-data handling** — consent flows, Indian data residency options, audit-ready logs.

## Built for trust

In healthcare, a hallucinated answer is a liability. Our RAG systems answer only from your approved documents and show their source — and we handle patient data securely and with consent by default, not as an afterthought.`,
  },
  {
    slug: "fintech-payments",
    title: "Fintech & Payments",
    status: "published",
    position: 3,
    icon: "fintech",
    tags: ["fintech", "payments", "kyc", "support", "guardrails"],
    service_slugs: ["custom-ai-software", "ai-automation", "whatsapp-chatbot"],
    summary:
      "KYC flows, support copilots, fraud-aware automations, and audit-friendly LLM guardrails.",
    headline: "AI for fintech & payments",
    meta: "Industry · Fintech & payments",
    lead:
      "Fintech moves fast but can't afford to be loose. We build support copilots, KYC flows and fraud-aware automations with audit-friendly guardrails — AI you can put in front of regulated workflows.",
    bullets: [
      "KYC & onboarding flows",
      "Support copilots",
      "Audit-friendly guardrails",
      "Document extraction & verification",
      "Fraud-anomaly alert routing",
      "PII redaction & logging",
    ],
    seo: {
      title: "AI for Fintech & Payments India | Voltair Tech",
      description:
        "KYC flows, support copilots, fraud-aware automations and audit-friendly LLM guardrails for fintech and payment companies.",
    },
    body_md: `## What we build for fintech

- **Support copilots** that answer customer queries from your real policies, with escalation built in.
- **KYC & onboarding flows** with document extraction and verification automation.
- **Fraud-aware automations** — anomaly alerts routed to the right desk in seconds.
- **Audit-friendly guardrails** — PII redaction, prompt-injection defence, and logged, reviewable outputs.

## AI you can defend in an audit

Every LLM touchpoint we ship is grounded, logged and guard-railed, so your compliance team can trace exactly what the model saw and why it answered the way it did.`,
  },
  {
    slug: "real-estate",
    title: "Real Estate",
    status: "published",
    position: 4,
    icon: "realestate",
    homepage_featured: true,
    case_studies: [
      {
        title: "AI lead-capture & listing search for a luxury developer",
        challenge:
          "High-ad-spend campaigns generated clicks, but manual follow-up was slow, resulting in cold leads and missed sales.",
        outcome:
          "An instant WhatsApp AI agent qualifies buyers, shares brochures, and books site visits 24/7, securing hot leads immediately.",
        tech_stack: ["WhatsApp API", "Next.js", "Supabase (pgvector)", "n8n"],
        metrics: [
          { value: "instant", label: "response time" },
          { value: "3.4x", label: "lead conversion" },
        ],
      },
    ],
    tags: ["real estate", "leads", "listings", "whatsapp"],
    service_slugs: ["ai-websites", "whatsapp-chatbot", "ai-automation"],
    summary:
      "Lead-capture sites in 48 hours, listing search, and multilingual WhatsApp follow-up agents.",
    headline: "AI for real estate",
    meta: "Industry · Real estate",
    lead:
      "In real estate, speed-to-lead wins the deal. We ship lead-capture sites in 48 hours, AI listing search, and multilingual WhatsApp agents that follow up the moment an enquiry lands.",
    bullets: [
      "48-hour lead-capture sites",
      "AI listing search",
      "WhatsApp follow-up agents",
      "Multilingual lead qualification",
      "CRM & portal automation",
      "Project launch microsites",
    ],
    seo: {
      title: "AI for Real Estate India | Voltair Tech",
      description:
        "Lead-capture sites in 48 hours, AI listing search and multilingual WhatsApp follow-up agents for real estate.",
    },
    body_md: `## What we build for real estate

- **Lead-capture sites in 48 hours** — project microsites that go live before the launch.
- **AI listing search** — buyers describe what they want; the bot surfaces the right inventory.
- **WhatsApp follow-up agents** that qualify and nurture leads in Hindi, Marathi and English.
- **CRM automation** so no enquiry slips through the cracks between portals and your sales team.

## Never miss a hot lead

The first to respond usually closes. Our agents reply instantly, qualify the buyer, and hand a warm, context-rich lead to your team — day or night.`,
  },
  {
    slug: "education-edtech",
    title: "Education & EdTech",
    status: "published",
    position: 5,
    icon: "education",
    tags: ["education", "edtech", "tutors", "rag", "mobile"],
    service_slugs: ["rag-systems", "custom-ai-software", "mobile-apps"],
    summary:
      "Doubt-solving tutors, content generation, and RAG over course material with citations.",
    headline: "AI for education & EdTech",
    meta: "Industry · Education & EdTech",
    lead:
      "Learners want answers now. We build doubt-solving tutors, content-generation tools and RAG assistants grounded in your course material — so students get accurate, cited help, at scale.",
    bullets: [
      "Doubt-solving AI tutors",
      "RAG over course material",
      "AI content generation",
      "Cited, syllabus-grounded answers",
      "Question-bank generation",
      "Mobile-first learning apps",
    ],
    seo: {
      title: "AI for Education & EdTech India | Voltair Tech",
      description:
        "Doubt-solving tutors, content generation and RAG over course material with citations for education and EdTech.",
    },
    body_md: `## What we build for education

- **Doubt-solving tutors** that answer from your syllabus, not the open internet.
- **RAG over course material** — every answer cites the chapter and page it came from.
- **Content generation** for question banks, summaries and revision notes.
- **Mobile-first delivery** — AI tutors and progress tracking inside your own app.

## Accurate, not just impressive

A tutor that makes things up erodes trust fast. Ours stay grounded in your approved material and show their work, so students — and parents — can rely on every answer.`,
  },
  {
    slug: "logistics-supply-chain",
    title: "Logistics & Supply Chain",
    status: "published",
    position: 6,
    icon: "logistics",
    tags: ["logistics", "supply chain", "automation", "tracking", "n8n"],
    service_slugs: ["ai-automation", "whatsapp-chatbot", "custom-ai-software"],
    summary:
      "Tracking bots, document extraction, and n8n automations across Sheets, Slack and WhatsApp.",
    headline: "AI for logistics & supply chain",
    meta: "Industry · Logistics & supply chain",
    lead:
      "Logistics runs on documents and status updates. We automate both — tracking bots, document extraction, and n8n pipelines that move data across Sheets, Slack and WhatsApp without a human in the loop.",
    bullets: [
      "Shipment tracking bots",
      "Document extraction (PODs, invoices)",
      "n8n pipelines",
      "Exception & delay alerts",
      "Sheets ↔ Slack ↔ WhatsApp sync",
      "TMS & ERP integration",
    ],
    seo: {
      title: "AI for Logistics & Supply Chain India | Voltair Tech",
      description:
        "Tracking bots, document extraction and n8n automations across Sheets, Slack and WhatsApp for logistics operators.",
    },
    body_md: `## What we build for logistics

- **Tracking bots** that answer "where's my shipment?" from your live data, on WhatsApp.
- **Document extraction** — PODs, invoices and e-way bills parsed and filed automatically.
- **n8n pipelines** that sync Sheets, Slack, WhatsApp and your TMS into one flow.
- **Exception alerts** that flag delays and route them to the right desk instantly.

## Cut the manual data-shuffling

Most logistics overhead is copy-pasting between systems. We replace that with automations that run 24/7 at near-zero marginal cost — and a dashboard your ops team can actually read.`,
  },
  {
    slug: "professional-services",
    title: "Professional Services",
    status: "published",
    position: 7,
    icon: "proservices",
    tags: ["legal", "accounting", "agency", "rag", "copilot"],
    service_slugs: ["rag-systems", "ai-automation", "custom-ai-software"],
    summary:
      "Legal, CA and agency teams: document RAG, intake automation, and internal copilots.",
    headline: "AI for professional services",
    meta: "Industry · Professional services",
    lead:
      "Legal, CA and agency teams live in documents. We build document RAG, intake automation and internal copilots that find the clause, draft the reply and answer the policy question — grounded in your files.",
    bullets: [
      "Document RAG & search",
      "Client intake automation",
      "Internal copilots",
      "Contract & filings search",
      "Drafting & summarisation copilots",
      "Notion / Drive / DMS search",
    ],
    seo: {
      title: "AI for Professional Services India — Legal, CA, Agencies | Voltair Tech",
      description:
        "Document RAG, intake automation and internal copilots for legal, CA and agency teams. Grounded in your own files.",
    },
    body_md: `## What we build for professional services

- **Document RAG** across contracts, filings and case files — ask in plain language, get cited answers.
- **Client intake automation** that captures, qualifies and routes new matters.
- **Internal copilots** that draft replies, summarise documents and surface precedent.
- **Knowledge search** over Notion, Drive, SharePoint or your DMS.

## Your expertise, instantly searchable

Your firm's value is locked in its documents. We make that corpus answerable — every response tied back to the exact source — so your team spends time advising, not hunting through folders.`,
  },
  {
    slug: "hospitality-travel",
    title: "Hospitality & Travel",
    status: "published",
    position: 8,
    icon: "hospitality",
    tags: ["hospitality", "travel", "booking", "concierge", "reviews"],
    service_slugs: ["whatsapp-chatbot", "ai-websites", "ai-automation"],
    summary:
      "Booking assistants, multilingual concierge bots, and review-aware response automation.",
    headline: "AI for hospitality & travel",
    meta: "Industry · Hospitality & travel",
    lead:
      "Guests expect a fast, warm reply in their own language. We build booking assistants, multilingual concierge bots and review-aware automation that keep every guest looked after — around the clock.",
    bullets: [
      "Booking assistants",
      "Multilingual concierge bots",
      "Review response automation",
      "Pre- & post-stay automation",
      "Upsell & re-engagement flows",
      "24/7 guest messaging",
    ],
    seo: {
      title: "AI for Hospitality & Travel India | Voltair Tech",
      description:
        "Booking assistants, multilingual concierge bots and review-aware response automation for hotels, travel and hospitality.",
    },
    body_md: `## What we build for hospitality

- **Booking assistants** that take enquiries to confirmed reservations on WhatsApp.
- **Multilingual concierge bots** — recommendations and requests handled in the guest's language.
- **Review-aware automation** that drafts on-brand responses and flags issues to staff.
- **Pre- and post-stay flows** that upsell, remind and re-engage automatically.

## Five-star service that never sleeps

A guest messaging at 2am still expects an answer. Our concierge bots respond instantly and warmly in English, Hindi, Marathi and more — and escalate to your team the moment a human touch is needed.`,
  },
  {
    slug: "manufacturing-industrial",
    title: "Manufacturing & Industrial",
    status: "published",
    position: 9,
    icon: "manufacturing",
    homepage_featured: true,
    tags: ["manufacturing", "industrial", "automation", "iot"],
    service_slugs: ["ai-automation", "custom-ai-software", "rag-systems"],
    summary:
      "Shop-floor automation, predictive-maintenance copilots, and SOP/manual RAG for operators.",
    headline: "AI for manufacturing & industrial",
    meta: "Industry · Manufacturing & industrial",
    lead:
      "The factory floor generates more data than anyone reads. We turn it into action — automation across your MES and ERP, maintenance copilots, and instant answers from your SOPs and machine manuals.",
    bullets: [
      "Shop-floor & ERP automation",
      "Maintenance & quality copilots",
      "SOP / manual RAG",
      "Predictive-maintenance alerts",
      "Inspection & demand forecasting",
      "MES / ERP data sync",
    ],
    seo: {
      title: "AI for Manufacturing & Industrial India | Voltair Tech",
      description:
        "Shop-floor automation, predictive-maintenance copilots and SOP/manual RAG for manufacturers. Built in Mumbai.",
    },
    body_md: `## What we build for manufacturing

- **Shop-floor & back-office automation** linking MES, ERP, Sheets and Slack into one flow.
- **Maintenance & quality copilots** that surface the right fix from your manuals and past tickets.
- **SOP / manual RAG** — operators ask in plain language and get the cited procedure in seconds.
- **Custom AI software** for inspection, demand forecasting and production planning.

## Less downtime, less tribal knowledge

When the senior technician is on leave, the answer shouldn't leave with them. We make your manuals, SOPs and machine history answerable on the floor — and automate the data-shuffling that slows every shift.`,
  },
  {
    slug: "automotive-mobility",
    title: "Automotive & Mobility",
    status: "published",
    position: 10,
    icon: "automotive",
    tags: ["automotive", "mobility", "dealership", "ev"],
    service_slugs: ["ai-websites", "whatsapp-chatbot", "ai-automation"],
    summary:
      "Dealership lead bots, service-booking automation, and AI sites for auto & EV brands.",
    headline: "AI for automotive & mobility",
    meta: "Industry · Automotive & mobility",
    lead:
      "Test drives and service slots get won on response speed. We build lead bots, service-booking automation and fast sites for dealerships, OEMs and EV brands — multilingual, India-first.",
    bullets: [
      "Dealership lead bots",
      "Service-booking automation",
      "Launch & EV brand sites",
      "Test-drive qualification bots",
      "Pickup / drop scheduling",
      "Dealership CRM automation",
    ],
    seo: {
      title: "AI for Automotive & Mobility India | Voltair Tech",
      description:
        "Dealership lead bots, service-booking automation and AI sites for auto and EV brands. Multilingual, built fast.",
    },
    body_md: `## What we build for automotive

- **Lead bots** that book test drives and qualify buyers on WhatsApp.
- **Service-booking automation** — slot reminders, pickup/drop scheduling, follow-ups.
- **Launch & EV brand sites** that go live before the campaign.
- **CRM automation** so dealership and OEM teams never lose an enquiry.

## Win the buyer who messages first

In auto retail, the dealership that replies first usually closes. Our bots respond instantly, qualify intent, and hand a warm, context-rich lead to your sales team — across every showroom.`,
  },
  {
    slug: "insurance-insurtech",
    title: "Insurance & InsurTech",
    status: "published",
    position: 11,
    icon: "insurance",
    tags: ["insurance", "insurtech", "claims", "policy"],
    service_slugs: ["custom-ai-software", "rag-systems", "whatsapp-chatbot"],
    summary:
      "Claims automation, policy-document RAG, and support copilots with audit-ready guardrails.",
    headline: "AI for insurance & InsurTech",
    meta: "Industry · Insurance & InsurTech",
    lead:
      "Insurance lives and dies by documents. We build policy-document RAG, claims automation and support copilots that answer from the wording — never guessing — with audit-ready guardrails.",
    bullets: [
      "Policy & wording RAG",
      "Claims intake automation",
      "Audit-ready support copilots",
      "Document extraction & routing",
      "PII redaction guardrails",
      "Out-of-scope deflection",
    ],
    seo: {
      title: "AI for Insurance & InsurTech India | Voltair Tech",
      description:
        "Claims automation, policy-document RAG and support copilots with audit-ready guardrails for insurers and InsurTech.",
    },
    body_md: `## What we build for insurance

- **Policy & wording RAG** — agents and customers get cited answers from the exact clause.
- **Claims intake automation** with document extraction and routing.
- **Support copilots** grounded in your products, with escalation built in.
- **Guardrails** — PII redaction, logged outputs, out-of-scope deflection.

## Answers you can defend

Every response is tied to the policy wording it came from and logged for review — so your compliance and claims teams can trace exactly why the AI said what it said.`,
  },
  {
    slug: "media-entertainment",
    title: "Media & Entertainment",
    status: "published",
    position: 12,
    icon: "media",
    tags: ["media", "entertainment", "content", "ott"],
    service_slugs: ["ai-websites", "custom-ai-software", "ai-automation"],
    summary:
      "Content generation, recommendation engines, and AI sites for publishers & OTT.",
    headline: "AI for media & entertainment",
    meta: "Industry · Media & entertainment",
    lead:
      "Audiences expect more content, personalised. We build content-generation tools, recommendation engines and fast publishing sites for media houses, creators and OTT platforms.",
    bullets: [
      "AI content generation",
      "Recommendation engines",
      "Publisher & OTT sites",
      "Metadata & SEO drafting",
      "Captioning & scheduling automation",
      "Multi-platform distribution",
    ],
    seo: {
      title: "AI for Media & Entertainment India | Voltair Tech",
      description:
        "Content generation, recommendation engines and AI sites for publishers, creators and OTT platforms.",
    },
    body_md: `## What we build for media

- **AI content generation** — summaries, scripts, metadata, and SEO drafts at scale.
- **Recommendation engines** that lift watch-time and reduce churn.
- **Publishing & OTT sites** with fast, streaming-first front-ends.
- **Automation** for scheduling, captioning, and multi-platform distribution.

## More output, same team

We hand creative teams AI that drafts, tags and distributes — so they spend their time on the work only humans can do, not the repetitive production grind.`,
  },
  {
    slug: "agriculture-agritech",
    title: "Agriculture & AgriTech",
    status: "published",
    position: 13,
    icon: "agriculture",
    tags: ["agriculture", "agritech", "farmers", "advisory"],
    service_slugs: ["whatsapp-chatbot", "mobile-apps", "ai-automation"],
    summary:
      "Vernacular farmer advisory bots, crop-advisory apps, and supply automation.",
    headline: "AI for agriculture & AgriTech",
    meta: "Industry · Agriculture & AgriTech",
    lead:
      "Farmers want answers in their language, on the phone they already use. We build vernacular advisory bots, crop-advisory apps and supply automation for AgriTech and FPOs.",
    bullets: [
      "Vernacular advisory bots",
      "Crop-advisory mobile apps",
      "Procurement automation",
      "Image-based crop diagnosis",
      "Agronomy-guide RAG",
      "Mandi & buyer linking",
    ],
    seo: {
      title: "AI for Agriculture & AgriTech India | Voltair Tech",
      description:
        "Vernacular farmer advisory bots, crop-advisory apps and supply automation for AgriTech and FPOs.",
    },
    body_md: `## What we build for agriculture

- **Vernacular advisory bots** on WhatsApp — crop, weather and price guidance in Hindi, Marathi and more.
- **Crop-advisory mobile apps** with image-based diagnosis and reminders.
- **Procurement & supply automation** linking farmers, mandis and buyers.
- **RAG** over agronomy guides so advice stays grounded and consistent.

## Reach farmers where they are

No app download, no English barrier — a WhatsApp message in the local language gets a farmer a grounded, useful answer, and gives your team reach across every village you serve.`,
  },
  {
    slug: "saas-b2b-tech",
    homepage_featured: true,
    title: "SaaS & B2B Tech",
    status: "published",
    position: 14,
    icon: "saas",
    tags: ["saas", "b2b", "ai-features", "copilot"],
    service_slugs: ["custom-ai-software", "ai-websites", "rag-systems"],
    summary:
      "Embed AI in your product — copilots, RAG search, and onboarding automation.",
    headline: "AI for SaaS & B2B tech",
    meta: "Industry · SaaS & B2B tech",
    lead:
      "Your users now expect AI inside the product. We embed copilots, RAG-powered search and onboarding automation into your SaaS — shipped fast, with the eval and guardrails to keep it reliable.",
    bullets: [
      "In-product AI copilots",
      "RAG search over your docs",
      "Onboarding automation",
      "Eval pipelines & guardrails",
      "Lifecycle & retention flows",
      "Existing-stack integration",
    ],
    seo: {
      title: "AI for SaaS & B2B Tech India | Voltair Tech",
      description:
        "Embed AI copilots, RAG search and onboarding automation into your SaaS product. Shipped fast with guardrails.",
    },
    body_md: `## What we build for SaaS

- **In-product AI copilots** — summarise, draft, and act inside your existing app.
- **RAG search** over your docs, tickets and knowledge base, with citations.
- **Onboarding & lifecycle automation** that activates and retains users.
- **Eval pipelines & guardrails** so the AI feature stays accurate as you ship.

## Add AI without rebuilding

We slot AI into your current stack — your auth, your data, your UI — and hand you the eval harness to measure quality, so the feature launches reliable and stays that way.`,
  },
  {
    slug: "beauty-salons-wellness",
    title: "Beauty, Salons & Wellness",
    status: "published",
    position: 15,
    icon: "beauty",
    tags: ["beauty", "salon", "spa", "wellness", "booking"],
    service_slugs: ["whatsapp-chatbot", "ai-websites", "ai-automation"],
    summary:
      "Booking bots, reminder automation, and AI sites for salons, spas & wellness brands.",
    headline: "AI for beauty, salons & wellness",
    meta: "Industry · Beauty, salons & wellness",
    lead:
      "No-shows and DMs eat into every salon's day. We build booking bots, reminder automation and clean sites for salons, spas and wellness brands — so the chair stays full and the team stays focused.",
    bullets: [
      "WhatsApp booking bots",
      "Reminder & rebooking automation",
      "Brand & booking sites",
      "No-show reduction flows",
      "Review-to-booking automation",
      "Pay-on-chat checkout",
    ],
    seo: {
      title: "AI for Beauty, Salons & Wellness India | Voltair Tech",
      description:
        "Booking bots, reminder automation and AI sites for salons, spas and wellness brands. Cut no-shows, fill the chair.",
    },
    body_md: `## What we build for beauty & wellness

- **WhatsApp booking bots** — book, reschedule and pay without a phone call.
- **Reminder & rebooking automation** that cuts no-shows and brings clients back.
- **Brand & booking sites** that look as good as your work.
- **Review automation** that turns happy clients into more bookings.

## Keep the chair full

Every missed reminder is an empty slot. Our bots confirm, remind and rebook automatically — and free your front desk to look after the client in front of them.`,
  },
  {
    slug: "events-experiences",
    title: "Events & Experiences",
    status: "published",
    position: 16,
    icon: "events",
    tags: ["events", "experiences", "ticketing", "conferences"],
    service_slugs: ["ai-websites", "whatsapp-chatbot", "ai-automation"],
    summary:
      "Event sites, registration & ticketing bots, and attendee-info automation.",
    headline: "AI for events & experiences",
    meta: "Industry · Events & experiences",
    lead:
      "Events run on tight timelines and a thousand attendee questions. We build event sites, registration bots and attendee-info automation that handle the rush so your team runs the show.",
    bullets: [
      "Event & ticketing sites",
      "Registration & info bots",
      "Attendee automation",
      "Agenda-grounded RAG answers",
      "Confirmations & reminders",
      "Post-event feedback automation",
    ],
    seo: {
      title: "AI for Events & Experiences India | Voltair Tech",
      description:
        "Event sites, registration & ticketing bots and attendee-info automation for conferences and experiences.",
    },
    body_md: `## What we build for events

- **Event & ticketing sites** spun up fast for each show.
- **Registration & info bots** answering schedule, venue and FAQ questions on WhatsApp.
- **Attendee automation** — confirmations, reminders, feedback, and follow-up.
- **RAG** over the agenda so attendees get accurate, instant answers.

## Handle the rush, run the show

The week before an event, the questions never stop. Our bots field them instantly and accurately, so your team focuses on delivering the experience, not answering the same FAQ a hundred times.`,
  },
  {
    slug: "nonprofit-ngo",
    title: "Non-profit & NGO",
    status: "published",
    position: 17,
    icon: "nonprofit",
    tags: ["nonprofit", "ngo", "fundraising", "social impact"],
    service_slugs: ["ai-websites", "whatsapp-chatbot", "rag-systems"],
    summary:
      "Donation sites, donor & beneficiary bots, and reporting automation for NGOs.",
    headline: "AI for non-profits & NGOs",
    meta: "Industry · Non-profit & NGO",
    lead:
      "Small teams, big missions. We build donation sites, donor and beneficiary bots, and reporting automation that let NGOs spend less time on admin and more on impact.",
    bullets: [
      "Donation & campaign sites",
      "Donor & beneficiary bots",
      "Reporting automation",
      "UPI / Razorpay donation flows",
      "Programme-document RAG",
      "Funder-ready reporting",
    ],
    seo: {
      title: "AI for Non-profits & NGOs India | Voltair Tech",
      description:
        "Donation sites, donor & beneficiary bots and reporting automation for NGOs and social-impact teams.",
    },
    body_md: `## What we build for non-profits

- **Donation & campaign sites** with UPI/Razorpay, live in days.
- **Donor & beneficiary bots** on WhatsApp for outreach, support and updates.
- **Reporting automation** that turns field data into funder-ready reports.
- **RAG** over your programme documents for instant, grounded answers.

## More impact per rupee

Every hour your team spends on admin is an hour off the mission. We automate the reporting, outreach and donor comms — affordably — so your people stay focused on the work that matters.`,
  },
  {
    slug: "energy-utilities",
    title: "Energy & Utilities",
    status: "published",
    position: 18,
    icon: "energy",
    tags: ["energy", "utilities", "solar", "power"],
    service_slugs: ["ai-automation", "custom-ai-software", "rag-systems"],
    summary:
      "Customer-support copilots, billing automation, and field-ops RAG for energy & utilities.",
    headline: "AI for energy & utilities",
    meta: "Industry · Energy & utilities",
    lead:
      "Utilities juggle high volumes and complex regulation. We build support copilots, billing automation and field-ops RAG that cut handle times and keep crews informed — grounded in your own data.",
    bullets: [
      "Support & billing copilots",
      "Outage & billing automation",
      "Field-ops manual RAG",
      "Anomaly & forecasting tools",
      "Ticket routing automation",
      "On-site procedure lookup",
    ],
    seo: {
      title: "AI for Energy & Utilities India | Voltair Tech",
      description:
        "Customer-support copilots, billing automation and field-ops RAG for energy and utility companies.",
    },
    body_md: `## What we build for energy & utilities

- **Support & billing copilots** that answer from your tariffs and policies, with escalation.
- **Outage & billing automation** — alerts, status updates and ticket routing.
- **Field-ops RAG** so crews get the right procedure from manuals on site.
- **Custom AI software** for forecasting, anomaly detection and reporting.

## Lower handle times, fewer escalations

Most utility queries are billing, outage and tariff questions. We deflect them with grounded, accurate AI — and route the genuinely complex ones to the right desk with full context.`,
  },
];

const res = await fetch(`${SITE}/api/industries`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-admin-key": KEY },
  body: JSON.stringify({ industries }),
});
const text = await res.text();
console.log(`POST ${SITE}/api/industries -> ${res.status}`);
console.log(text);
process.exit(res.ok ? 0 : 1);
