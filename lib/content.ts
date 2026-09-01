/**
 * Site copy that isn't in the database.
 *
 * Written for a business owner who has never heard of a vector database. If a
 * line needs a glossary, it gets rewritten. The catalogue itself (services,
 * industries, FAQ, projects) lives in Supabase and is edited in the admin;
 * what's left here is the brand block, the process steps, the comparison
 * table, the marquee, and the FAQ fallback the /faq page uses when the DB is
 * empty or unreachable.
 */
export const CONTENT = {
  brand: {
    name: "Voltair Tech",
    tagline: "AI that does the work, built in Mumbai.",
    sub: "We build websites, chatbots, phone agents and software that take the repetitive work off your team. Websites go live in 48 hours.",
    location: "Andheri West, Mumbai",
    locationFull: "Andheri West, Mumbai · Maharashtra · 400053",
    email: "business@voltairtech.com",
    phone: "+91 70210 00764",
    whatsapp: "+91 70210 00764",
    domain: "voltairtech.com",
    hours: "Mon to Sat · 10:00 to 20:00 IST",
  },

  stack: [
    "Websites", "Chatbots", "WhatsApp",
    "Voice agents", "Mobile apps", "Automation",
    "Document search", "Payments", "Dashboards",
    "Hindi & Marathi", "Fixed price", "48 hours",
  ],

  process: [
    { n: "01", t: "Talk", d: "A 30 minute call. What is slow, what it costs you, when you need it." },
    { n: "02", t: "Agree", d: "One price, one date, written down. No hourly billing, no surprises." },
    { n: "03", t: "Build", d: "We build it and show you progress every day on WhatsApp." },
    { n: "04", t: "Hand over", d: "It goes live, you get the code and the logins. You own all of it." },
  ],

  compare: [
    { label: "Time to get a website live", us: "48 hours", inhouse: "3 to 6 months", upwork: "2 to 6 weeks" },
    { label: "Works in Hindi and Marathi", us: "Yes, built in", inhouse: "Depends", upwork: "Rare" },
    { label: "UPI and Razorpay payments", us: "From day one", inhouse: "Extra work", upwork: "Extra work" },
    { label: "Reachable in your hours", us: "IST, plus EU and APAC", inhouse: "One timezone", upwork: "Varies" },
    { label: "Who owns the code", us: "You do, all of it", inhouse: "You do", upwork: "Negotiated" },
  ],

  /**
   * Fallback for /faq and the home page FAQ block. The real questions live in
   * the `site_faqs` table and are edited in the admin; these keep the page from
   * ever rendering blank.
   */
  faq: [
    {
      q: "What does Voltair Tech actually do?",
      a: "We build software that uses AI to do work your team is doing by hand. That usually looks like a website, a chatbot that answers customers on WhatsApp, a voice agent that picks up your phone, or a tool that reads your documents and answers questions about them. We are based in Andheri West, Mumbai.",
    },
    {
      q: "How fast can my website be live?",
      a: "48 hours from the day we start. That includes the design, the writing, the ability to edit it yourself later, and your own domain name. Bigger projects like apps take longer, and we give you the exact date before you pay anything.",
    },
    {
      q: "What does it cost?",
      a: "Every build is quoted on its own, so we do not publish a price list. You get one fixed price for the whole thing, agreed in writing before any work starts. Never an hourly rate, and never a different number halfway through. Tell us what you need and we come back within the hour with the scope, the price and a start date. Thirty days of support after it goes live is included.",
    },
    {
      q: "Can a bot answer questions about our own documents?",
      a: "Yes, and this is one of the most common things we build. You give it your policies, price lists, manuals or product information, and it answers staff or customer questions from those files only. Every answer shows which document it came from, so nobody has to take it on trust. The technical name for this is RAG, if you have heard it called that.",
    },
    {
      q: "Do you build WhatsApp chatbots?",
      a: "Yes, it is our most requested build. We handle the approval process with Meta, write the conversation, connect payments if you take them, and teach the bot from your own information. The same bot handles Hindi, Marathi and English.",
    },
    {
      q: "Can you add AI to the software we already have?",
      a: "Usually yes, without rebuilding what you have. We add things like search, summaries, and assistants to existing websites, apps and internal tools. The usual candidates are your CRM, your support desk, your dashboards, and anything involving paperwork.",
    },
    {
      q: "Will it work in Hindi and Marathi?",
      a: "Yes. Chatbots and voice agents handle Hindi, Marathi and English on the same number, and reply in whichever language the customer used.",
    },
    {
      q: "Do you sign an NDA?",
      a: "Yes, before the first call if you want one. It is a standard one page mutual NDA under Indian law, usually signed the same day. We do not subcontract your work or share your code with anyone.",
    },
    {
      q: "What happens after it goes live?",
      a: "You get 30 days of free support: fixes, monitoring, and small changes. After that you can take it over completely or keep us on a monthly retainer. Either way the code is yours.",
    },
    {
      q: "Why should we trust you with this?",
      a: "We have shipped 42 products since 2024 for 28 clients across India, Europe and Asia Pacific. You can see real ones on our live projects page, and we will put you in touch with references after an NDA.",
    },
  ],
} as const;
