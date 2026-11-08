/**
 * Built-in Voltair Tech knowledge base — the ground truth the chatbot answers
 * from. Edit an entry then re-seed via `POST /api/ingest {"seed":true}` with
 * the `X-Admin-Key` header; upserts on (doc_type, external_id) so edits update
 * in place. `npm run kb:check` reports drift between this file and the store.
 *
 * Written the way the site is: for someone who has not heard of a vector
 * database. The chatbot's answers are read by the same person who reads the
 * pages, so if the two vocabularies drift the bot starts explaining the site
 * in words the site no longer uses. Technical names appear once, labelled as
 * the technical name, so a visitor who searched for one still gets matched.
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
      "Voltair Tech is a technology company in Andheri West, Mumbai, Maharashtra 400053, working on three things: drones first (about 60% of our work), then AI (about 20%), then robotics and IoT (about 20%). On drones we make the free Voltair Drone Simulator for RPTO pilot training and advise Indian drone makers such as Preflight Labs, and we back drones and components made in India. On robotics and IoT we connect machines, sensors and devices to software and AI. On AI, we build software that uses AI to do work a team is currently doing by hand: websites, chatbots that answer customers on WhatsApp, voice agents that pick up the phone, tools that read a company's own documents and answer questions from them, and custom software built around how a business actually works. Websites go live in 48 hours; bigger builds get a fixed price and a fixed date agreed before anything starts. We work with Indian businesses of every size, and with teams in Europe and Asia Pacific who want a fast Indian build partner. The team is in Mumbai on IST and reachable on WhatsApp during business hours. 42 products shipped since 2024 for 28 clients.",
    metadata: { url: "https://www.voltairtech.com/" },
  },
  {
    doc_type: "company",
    external_id: "contact",
    title: "How to get in touch",
    content:
      "Email: business@voltairtech.com. Phone and WhatsApp: +91 70210 00764. Location: Andheri West, Mumbai, Maharashtra 400053, India. Open Monday to Saturday, 10:00 to 20:00 IST. The quickest way is the 'Contact us' button in the top menu, which opens a short form: tick what you are interested in, say in one line what you want built, and choose whether we reply on WhatsApp or by email. We come back within the hour with a plan and a price. Every page about something we build ends with the same form, already filled in for that thing, and you can add anything else you need before sending. If you would rather not use a form, email or WhatsApp us directly.",
    metadata: { url: "https://www.voltairtech.com/contact" },
  },
  {
    doc_type: "company",
    external_id: "stack",
    title: "What we build with",
    content:
      "For a client the short answer is: we pick whatever fits the job, we do not charge you to learn something new on your project, and you own everything at the end. For anyone who wants the technical detail: websites and web apps on Next.js; mobile apps on React Native and Expo, one build for both iPhone and Android; automation on n8n, self-hosted so there is no per-task fee; Claude, GPT and Gemini as the AI models; Supabase with pgvector, or Pinecone, for searching a company's own documents; Supabase or Postgres for data; Razorpay and Stripe for payments; ElevenLabs for voice. Hosting is usually Vercel or AWS, and data can stay on Indian servers when that matters.",
    metadata: { url: "https://www.voltairtech.com/" },
  },
  {
    doc_type: "company",
    external_id: "why-india",
    title: "Voltair Tech compared to hiring in-house or freelancers",
    content:
      "Against building it in-house or hiring a freelancer: a website is live in 48 hours with us, against 3 to 6 months in-house or 2 to 6 weeks with a freelancer. Hindi and Marathi work out of the box rather than being extra work. UPI and Razorpay payments work from day one. We overlap with Indian, European and Asia Pacific hours. You own all of the code, in every case. We do not subcontract your work or share your code with anyone.",
    metadata: { url: "https://www.voltairtech.com/about" },
  },
  {
    doc_type: "company",
    external_id: "drones",
    title: "Voltair Drones: drone products made in India",
    content:
      "Drones are now the biggest part of what Voltair Tech does, alongside AI and robotics. The Drones section of the site (top menu, Drones) lists our drone products. Available now: the Voltair Drone Simulator, a free RPTO drone pilot training simulator for Windows and Mac. Coming soon: Defense Drones (for surveillance and field work by defence and security teams), Commercial Drones with type certification (TC) for survey, agriculture and inspection work, College and Defense Training (drone pilot training programmes run at a college or unit), and Drone Lab Setup (a complete drone lab for an institute: simulators, kits and training). For any of the coming-soon products, use the Contact us form or WhatsApp +91 70210 00764 and we call back.",
    metadata: { url: "https://www.voltairtech.com/drones" },
  },
  {
    doc_type: "company",
    external_id: "drone-simulator",
    title: "Voltair Drone Simulator (free RPTO training simulator)",
    content:
      "Voltair Drone Simulator V3 is a drone flight simulator built by Voltair Tech as per DGCA guidelines for RPTO training (the DGCA RPC syllabus DTC 02 of 2022 and the simulator rules DTC 01 of 2026). It is free to download for Windows 10 and 11 (64 bit) and for Macs with Apple silicon (M1 or later, macOS 11 or newer) from https://www.voltairtech.com/drones/simulator. No sign up, no time limit, and it works offline after download. The free edition includes: the RPTO practice test with marks (pre-flight check 25 marks, the 13 DGCA flying exercises R1.F.3 to R1.F.18 at 10 marks each, post-flight check 25 marks, 180 marks in total, 108 to pass); practice of any exercise in any flight mode; theory lessons T1.1 to T1.11 with quizzes and a 40 minute theory test graded A to E; a pre-flight walk-around (chipped propellers, worn motors, cracked arms, swollen batteries); accelerometer and compass calibration; motor test; free flight; drone tuning; radio setup. Flight modes: Stabilize, Alt Hold, Loiter (GPS), Auto missions and Return home. Places to fly: an RPTO training ground with the 60 m by 60 m training area, a farm and a cricket stadium, with wind, gusts, time of day and night flying. Controls: any RC transmitter, USB dongle or gamepad the computer sees as a game controller (EdgeTX and OpenTX radios in USB joystick mode), set up in Mode 2, or the keyboard (W and S throttle, A and D yaw, arrow keys pitch and roll). Graphics can be set Low, Medium or High so it runs on laptops without a graphics card, and screen shape and text size settings suit a TV or projector. On a Mac, the first time only, right click the app and choose Open. On Windows, if a blue SmartScreen box appears, click More info then Run anyway.",
    metadata: { url: "https://www.voltairtech.com/drones/simulator" },
  },
  {
    doc_type: "company",
    external_id: "drone-simulator-av3",
    title: "Voltair Drone Simulator AV3 for RPTOs, colleges and defence",
    content:
      "AV3 is the advanced version of the Voltair Drone Simulator, for RPTOs (remote pilot training organisations), colleges and defence training units. It is switched on inside the same free download with a serial number, one serial per PC, and keeps working offline. AV3 adds: the full DGCA RPC course for rotorcraft (theory with a 188 question bank and 70% pass mark, simulator exercises R1.S.1 to R1.S.11 and the simulator test, practical flying R1.F.1 to R1.F.18 with the progress check and final test, assembly and maintenance R1.A.1 to R1.A.6); every manoeuvre graded A to E with the measured error; every flight logged and replayable in 3D with date, time, site and coordinates; a trainee roster with records kept for 5 years and sealed so any change shows; logbook, skill test reports and the final training report; instructor mode with take-over and failure buttons. A DGCA compliance list (PDF) is on the simulator page. The price is not published: it depends on how many PCs, and we quote it on a call. To get AV3, use Get AV3 inside the simulator, the Contact us form, or WhatsApp +91 70210 00764.",
    metadata: { url: "https://www.voltairtech.com/drones/simulator#av3" },
  },
  {
    doc_type: "company",
    external_id: "drones-advisory",
    title: "Advisory: Indian drone companies Voltair Tech works with (Preflight Labs)",
    content:
      "Voltair Tech is an advisor to Indian drone companies. We work alongside them to advance drone technology and to promote drones and components made in India; the page is Drones, then Advisory (https://www.voltairtech.com/drones/advisory). Our first advisory partner is Preflight Labs LLP of Goa, India (https://preflightlabs.in), which designs and builds unmanned systems. Their drones: TALON-1, a flagship hybrid VTOL UAV (900 mm wingspan, 1,350 g, 4S 5000 mAh battery, 640x512 thermal camera plus a day camera, vertical take-off with no runway, autonomous waypoint missions, day and night surveillance). COBRA VTOL, a long-endurance surveillance UAV (2 m wingspan, 6 kg max takeoff, about 1.5 hours endurance, 500 g payload, stabilised thermal gimbal with object tracking; used for border and coastline surveillance, search and rescue, infrastructure inspection and force protection). PFL TRAINER, a training and utility quadcopter (20+ minutes flight, 1080p 2-axis gimbal camera, up to 500 g payload with a dropper, 4S 74 Wh battery, one-key take-off and return to home; used for pilot training, small deliveries and inspection). SHRIKE, a counter-drone net-projectile interceptor (X8 eight-rotor platform, 3 x 3 m net, 10 to 15 m range; brings down hostile drones with a net, with no rounds fired and no debris, for force protection, critical infrastructure, borders and VIP security). For full details, prices or orders, visit preflightlabs.in. More Indian drone makers are joining; companies building drones or components in India can contact Voltair Tech through the Contact us form or WhatsApp +91 70210 00764.",
    metadata: { url: "https://www.voltairtech.com/drones/advisory" },
  },

  // NOTE: `service` documents are NOT seeded here — they are synced into the RAG
  // store automatically from the DB by POST /api/services (admin panel / n8n),
  // so the chatbot always reflects the live, editable services. Editing services
  // happens in the admin panel, not this file.

  // ---------------------------------------------------------------- pricing
  {
    doc_type: "pricing",
    external_id: "pricing-overview",
    title: "How pricing works",
    content:
      "Voltair Tech quotes every build individually, so there is no price list and no figure to give before a conversation. How it works: you have a free 30 minute call, you agree exactly what is being built, and you get ONE fixed price for the whole thing, in writing, before any work starts. Not an hourly rate, and no change to the number partway through unless you ask for something that was not agreed. Every quote includes 30 days of support after it goes live (fixes, monitoring and small changes); after that you can take it over completely or keep Voltair on a monthly retainer. To get an actual number, use the Contact us button in the top navigation, which opens /contact, or email business@voltairtech.com. Voltair replies within the hour with scope, a fixed price, and a start date. Do not state, estimate or confirm any rupee figure to a visitor.",
    metadata: { url: "https://www.voltairtech.com/contact" },
  },

  // ---------------------------------------------------------------- process
  {
    doc_type: "process",
    external_id: "delivery-48h",
    title: "How a website gets built in 48 hours",
    content:
      "Hour 0: a 30 minute call where we agree exactly what the site says and does, and you send your logo, photos and price list. Hour 12: the words, the layout and the pages are settled. Hour 36: it is built, with payments connected and a way for you to edit the text and photos yourself. Hour 48: it is live on your own domain, with the tracking and error monitoring set up, and a short guide for whoever will look after it. Bigger builds like apps take longer and get their own fixed date agreed at that first call.",
    metadata: { url: "https://www.voltairtech.com/about" },
  },
  {
    doc_type: "process",
    external_id: "how-we-work",
    title: "How we work, start to finish",
    content:
      "Four steps. One, talk: a 30 minute call about what is slow, what it is costing you, and when you need it. Two, agree: one price and one date, written down, with no hourly billing and no surprises. Three, build: we build it and show you progress every day on WhatsApp, so you are never waiting for a status call. Four, hand over: it goes live and you get the code, the logins and the documentation. You own all of it, whether or not you keep working with us afterwards.",
    metadata: { url: "https://www.voltairtech.com/about" },
  },

  // ---------------------------------------------------------------- rag (answering from your own documents)
  {
    doc_type: "rag",
    external_id: "rag-pipeline",
    title: "How we build an assistant that answers from your documents",
    content:
      "In plain terms: you give us your files, we index them so they can be searched by meaning rather than exact words, and then when somebody asks a question the assistant finds the relevant passages and answers from those, showing which document and page it used. If the answer is not in your files it says so rather than inventing one. We hand over a way to keep it up to date as your documents change, a set of real test questions with correct answers so you can measure how well it is doing yourself, and a log of everything asked. The technical name for this approach is RAG, or retrieval-augmented generation. Under the hood: documents are cleaned and split into passages, indexed with Gemini embeddings, stored in your own Supabase database with pgvector (or Pinecone), retrieved with a combination of meaning-based and keyword search, sorted by relevance, and answered by Claude or Gemini with the sources attached.",
    metadata: { url: "https://www.voltairtech.com/services/rag-systems" },
  },
  {
    doc_type: "rag",
    external_id: "rag-when",
    title: "When you need an assistant trained on your own documents",
    content:
      "Use it when people keep asking questions whose answers already exist somewhere in your files, and finding them takes too long. Common cases: a support chat that answers from your product documentation, an HR assistant that answers leave and policy questions from the handbook, a legal or accounting team searching years of matters, a clinic answering the same preparation questions from approved material only, or one search box across everything scattered in Drive and Notion. It is the right choice, rather than training a model on your data, whenever the information changes often or every answer has to be checkable. Every answer names its source, which is what makes it usable in a business where being wrong has a cost. The technical name is RAG.",
    metadata: { url: "https://www.voltairtech.com/services/rag-systems" },
  },

  // ---------------------------------------------------------------- faqs
  // These mirror the /faq page (`site_faqs`) and CONTENT.faq. Keep all three in
  // step: the bot should answer in the same words the page shows.
  {
    doc_type: "faq",
    external_id: "faq-who-mumbai",
    title: "What does Voltair Tech actually do?",
    content:
      "We build software that uses AI to do work your team is doing by hand. That usually looks like a website, a chatbot that answers customers on WhatsApp, a voice agent that picks up your phone, or a tool that reads your documents and answers questions about them. We are based in Andheri West, Mumbai, and we are reachable on WhatsApp during business hours.",
    metadata: { url: "https://www.voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-deploy-speed",
    title: "How fast can my website be live?",
    content:
      "48 hours from the day we start. That includes the design, the writing, the ability to edit it yourself later, and your own domain name. Bigger projects like apps take longer, and we give you the exact date before you pay anything.",
    metadata: { url: "https://www.voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-rag",
    title: "Can a bot answer questions about our own documents?",
    content:
      "Yes, and this is one of the most common things we build. You give it your policies, price lists, manuals or product information, and it answers staff or customer questions from those files only. Every answer shows which document it came from, so nobody has to take it on trust, and if the answer is not in your files it says so instead of guessing. The technical name for this is RAG, if you have heard it called that. Ready in two to three weeks; the price is quoted for your specific set of documents on a call.",
    metadata: { url: "https://www.voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-cost",
    title: "What does it cost?",
    content:
      "Every build is quoted on its own, so there is no price list. You get one fixed price for the whole thing, agreed in writing before any work starts, never an hourly rate, and 30 days of support after it goes live is included. Tell us what you want built and we come back within the hour with the scope, the price and a start date. Do not give a visitor a rupee figure or a range.",
    metadata: { url: "https://www.voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-best-agency-maharashtra",
    title: "Why should we trust you with this?",
    content:
      "We have shipped 42 products since 2024 for 28 clients across India, Europe and Asia Pacific. You can see real ones on the live projects page at voltairtech.com/live-projects, and we will put you in touch with references after an NDA. We are Mumbai based and serve clients across Maharashtra and the rest of India.",
    metadata: { url: "https://www.voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-whatsapp",
    title: "Do you build WhatsApp chatbots?",
    content:
      "Yes, it is our most requested build. We handle the approval process with Meta, write the conversation, connect payments if you take them, and teach the bot from your own information. The same bot handles Hindi, Marathi and English, replying in whichever language the customer used.",
    metadata: { url: "https://www.voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-integrate-existing",
    title: "Can you add AI to the software we already have?",
    content:
      "Usually yes, without rebuilding what you have. We add things like search, summaries, and assistants to existing websites, apps and internal tools. The usual candidates are your CRM, your support desk, your dashboards, and anything involving paperwork.",
    metadata: { url: "https://www.voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-stack",
    title: "Will it work in Hindi and Marathi?",
    content:
      "Yes. Chatbots and voice agents handle Hindi, Marathi and English on the same number, and reply in whichever language the customer used. If you want the technical detail on what we build with, ask about our stack.",
    metadata: { url: "https://www.voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-nda",
    title: "Do you sign an NDA?",
    content:
      "Yes, before the first call if you want one. It is a standard one page mutual NDA under Indian law, usually signed the same day. We do not subcontract your work or share your code with anyone.",
    metadata: { url: "https://www.voltairtech.com/faq" },
  },
  {
    doc_type: "faq",
    external_id: "faq-after-ship",
    title: "What happens after it goes live?",
    content:
      "You get 30 days of free support: fixes, monitoring, and small changes. After that you can take it over completely or keep us on a monthly retainer for ongoing changes. Either way the code is yours.",
    metadata: { url: "https://www.voltairtech.com/faq" },
  },
];
