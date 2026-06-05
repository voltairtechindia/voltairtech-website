export const CONTENT = {
  brand: {
    name: "Voltair Tech",
    tagline: "AI services, built for India.",
    sub: "Apps, automations, chatbots, RAG, full software — engineered with AI by a Mumbai team. Websites ship in 48 hours.",
    location: "Andheri West, Mumbai",
    locationFull: "Andheri West, Mumbai · Maharashtra · 400053",
    email: "business@voltairtech.com",
    phone: "+91 70210 00764",
    whatsapp: "+91 70210 00764",
    domain: "voltairtech.com",
    hours: "Mon–Sat · 10:00 – 20:00 IST",
  },

  nav: [
    { label: "Services", href: "#services" },
    { label: "Timeline", href: "#timeline" },
    { label: "RAG", href: "#rag" },
    { label: "Work", href: "#work" },
    { label: "FAQ", href: "#faq" },
  ],

  services: [
    {
      n: "01",
      title: "AI websites in 48 hrs",
      bullets: ["Next.js · RSC", "Streaming UIs", "Razorpay · Stripe · Auth"],
      glyph: "web" as const,
      eta: "48 hrs",
      slug: "ai-websites",
    },
    {
      n: "02",
      title: "AI automation",
      bullets: ["n8n workflows", "Trigger → action chains", "Slack / Sheets / WA"],
      glyph: "auto" as const,
      eta: "1–2 weeks",
      slug: "ai-automation",
    },
    {
      n: "03",
      title: "Chatbots & voice agents",
      bullets: ["WhatsApp Business API", "Hindi / Marathi / English", "ElevenLabs voices"],
      glyph: "chat" as const,
      eta: "1 week",
      slug: "whatsapp-chatbot",
    },
    {
      n: "04",
      title: "RAG system config",
      bullets: ["Chunk → embed → retrieve", "Pinecone / pgvector", "Citation-grade answers"],
      glyph: "rag" as const,
      eta: "2–3 weeks",
      slug: "rag-systems",
    },
    {
      n: "05",
      title: "Mobile apps",
      bullets: ["React Native + Expo", "On-device ML", "Play + App Store ship"],
      glyph: "mobile" as const,
      eta: "4–8 weeks",
      slug: "mobile-apps",
    },
    {
      n: "06",
      title: "Custom AI software",
      bullets: ["LLM integrations", "Tool-use agents", "Eval + guardrails"],
      glyph: "soft" as const,
      eta: "scoped",
      slug: "custom-ai-software",
    },
  ],

  timeline: [
    { hr: "Hr 00", n: "00", label: "Discovery call", desc: "30-min scoping. Stack, content, deadline, success metric.", done: true },
    { hr: "Hr 12", n: "12", label: "Design + content lock", desc: "Sections, copy, design tokens, repo created.", done: true },
    { hr: "Hr 36", n: "36", label: "Build + integrate", desc: "Real CMS, real auth, real LLM calls. No mock screens.", done: true },
    { hr: "Hr 48", n: "48", label: "Deployed to prod", desc: "Vercel. Custom domain, analytics, error monitoring, handover doc.", done: true },
  ],

  rag: [
    { name: "Document", desc: "PDFs, sites, Notion, Drive, audio transcripts. We ingest the whole corpus, dedup, and normalise.", code: "ingest(source)" },
    { name: "Chunk", desc: "Recursive splitting at semantic boundaries. Overlap tuned per domain (default 200 tokens).", code: "split(text, size=800, overlap=200)" },
    { name: "Embed", desc: "Domain-appropriate embeddings — OpenAI text-3-large or BGE. Indic content gets Indic-aware encoders.", code: "embed(chunk)" },
    { name: "Vector DB", desc: "Pinecone for managed, pgvector / Supabase when budget matters. Metadata filters for tenant scope.", code: "upsert(vec, meta)" },
    { name: "Retrieve", desc: "Hybrid: vector + BM25. Re-rank top 20 with a cross-encoder. Filter by tenant + recency.", code: "topK(q, k=8)" },
    { name: "LLM", desc: "Claude or GPT-4-class with a structured prompt. Strict tool-use, JSON outputs when needed.", code: "complete(ctx + q)" },
    { name: "Answer", desc: "Cited, sourced answer. Inline footnotes link back to the exact chunk + page.", code: "stream(answer, citations)" },
  ],

  stack: [
    "Claude", "GPT", "Gemini",
    "n8n", "Next.js", "React Native",
    "Three.js", "Pinecone", "Supabase",
    "ElevenLabs", "Razorpay", "Vision Camera",
  ],

  process: [
    { n: "01", t: "Scope", d: "30-min call. One success metric. One deadline. No upsell." },
    { n: "02", t: "Lock", d: "Architecture, design tokens, repos. Signed off in writing." },
    { n: "03", t: "Ship", d: "Build + integrate + deploy. Daily Loom + WhatsApp updates." },
    { n: "04", t: "Hand off", d: "Code, docs, dashboards, on-call window. You own it." },
  ],

  compare: [
    { label: "Time to website live", us: "48 hours", inhouse: "3–6 months", upwork: "2–6 weeks" },
    { label: "Indic language support", us: "Native", inhouse: "Depends", upwork: "Rare" },
    { label: "Razorpay / UPI native", us: "Day one", inhouse: "Sprint cost", upwork: "Sprint cost" },
    { label: "Time-zone overlap", us: "EU + APAC + IST", inhouse: "Single TZ", upwork: "Variable" },
    { label: "Ownership of code", us: "100% yours", inhouse: "100% yours", upwork: "Negotiated" },
  ],

  faq: [
    {
      q: "Who builds AI products in Mumbai?",
      a: "Voltair Tech is an AI services studio based in Andheri West, Mumbai. We work with Indian startups, enterprises, and global teams that need a fast Indian build partner. Our team is on the ground in IST and reachable on WhatsApp during business hours.",
    },
    {
      q: "How fast can you deploy a website?",
      a: "AI-powered marketing websites go live in 48 hours from kickoff. That includes design, copy, CMS, analytics, and a custom domain. Larger product apps and mobile builds take longer — we'll give you a fixed timeline at the scoping call.",
    },
    {
      q: "What is a RAG system and when do I need one?",
      a: "RAG (retrieval-augmented generation) grounds a large language model in your own data instead of letting it guess from training. Use it when you need accurate, citable answers from a fixed corpus — policies, manuals, product docs, patient FAQs. Every answer links back to the source chunk so your team can verify it.",
    },
    {
      q: "How much does an AI app cost in India?",
      a: "A production chatbot starts at ₹1.5L. A full RAG system or AI web app starts at ₹4–8L depending on scope, and mobile apps land at ₹8–15L. All quotes are fixed-price and include 30 days of post-ship support.",
    },
    {
      q: "Best AI agency in Maharashtra?",
      a: "Voltair Tech is Mumbai-headquartered and serves clients across Maharashtra and the rest of India. We're Razorpay-native and have shipped 42+ AI products since 2024. References available on request after an NDA.",
    },
    {
      q: "Do you build WhatsApp chatbots?",
      a: "Yes — WhatsApp Business API is one of our most-requested channels. We handle the Meta verification, the conversation flow, payment integrations, and grounding the bot on your own docs. Native support for Hindi, Marathi, and English on the same bot.",
    },
    {
      q: "Can you integrate AI into our existing software?",
      a: "Almost always, yes. We add LLM features (summarization, search, copilots, agents) to existing web apps, mobile apps, and internal tools without rewriting the stack. Common targets are CRMs, helpdesks, dashboards, and document workflows.",
    },
    {
      q: "What tech stack do you use?",
      a: "Next.js, React Native, n8n, Claude, GPT and Gemini for LLMs, Pinecone or pgvector for retrieval, Supabase or Postgres for data, and Razorpay or Stripe for payments. We pick what fits your scope, not what's trendy. Hosting defaults to Vercel and AWS.",
    },
    {
      q: "Do you sign NDAs?",
      a: "Yes, before the first scoping call if requested. Standard mutual NDA, India-jurisdiction, single page — usually signed the same day. We do not sub-contract or share code with third parties.",
    },
    {
      q: "What happens after you ship?",
      a: "Every project includes 30 days of free post-ship support — bug fixes, monitoring, and small tweaks. After that, you can either take full ownership of the code or put us on a monthly retainer for ongoing changes and on-call. The code is 100% yours either way.",
    },
  ],

  stats: [
    { k: "Website delivery", v: "48", sub: "hrs", delta: "flat" },
    { k: "Shipped", v: "42", sub: "+", delta: "+6 / Q" },
    { k: "Uptime", v: "99.9", sub: "%", delta: "SLO" },
    { k: "RAG accuracy", v: "94", sub: "%", delta: "eval" },
  ],
} as const;

export type ServiceGlyphKind = typeof CONTENT.services[number]["glyph"];
