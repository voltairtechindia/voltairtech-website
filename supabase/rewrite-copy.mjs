/**
 * Rewrite the site's DB-backed copy into plain language.
 *
 * The catalogue was written for engineers: "RAG", "pgvector", "n8n workflows",
 * "tool-use agents", "citation-grade answers". The buyer is a business owner
 * who has not heard any of those words. This reads every live row, replaces
 * the reader-facing fields with plain equivalents, and posts the WHOLE row back
 * through the admin-gated API, so:
 *
 *   · nothing else on the row is lost (media, covers, price, position, tags,
 *     SEO overrides, status, custom services, case studies)
 *   · the chatbot is re-embedded from the same text the page shows, so it can
 *     never answer in the old vocabulary after the page has changed
 *
 * Two passes:
 *   1. AUTHORED  — hand-written copy for the 8 services, the 13 sector rows,
 *                  and the /faq questions. Keyed by slug; a slug with no entry
 *                  is left alone.
 *   2. SWEEP     — a mechanical pass over everything else the rows carry
 *                  (sector sub-services, case studies, per-row FAQ answers):
 *                  expands acronyms, unpicks jargon, and replaces em/en dashes.
 *                  This is deliberately conservative: it edits wording, never
 *                  meaning, because that long tail is real detail the team
 *                  wrote and it should not be invented over.
 *
 * Usage (reads .env.local for SUPABASE_URL / SUPABASE_SERVICE_KEY / ADMIN_API_KEY):
 *   node supabase/rewrite-copy.mjs --target=http://localhost:3000
 *   node supabase/rewrite-copy.mjs                  # -> production
 *   node supabase/rewrite-copy.mjs --dry            # print, write nothing
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const ONLY = args.find((a) => a.startsWith("--only="))?.split("=")[1];
/** Pause between rows, so re-embedding stays under Gemini's per-minute quota. */
const GAP_MS = Number(args.find((a) => a.startsWith("--gap="))?.split("=")[1] ?? 12_000);
const SITE = (
  args.find((a) => a.startsWith("--target="))?.split("=")[1] ||
  process.env.SITE ||
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
  if (!res.ok) throw new Error(`Read ${table} failed (${res.status}): ${await res.text()}`);
  return res.json();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Post one payload, retrying when the write trips Gemini's embedding quota.
 *
 * Every published row is re-embedded for the chatbot on save, and a long body
 * is several embed calls, so pushing 8 services at once blows the per-minute
 * limit and the batch dies halfway. Rows are written one at a time with a gap,
 * and a quota error waits and tries again rather than losing the run.
 */
async function postAdmin(path, body, { attempt = 1 } = {}) {
  if (DRY) return "(dry run)";
  const res = await fetch(`${SITE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-key": ADMIN_KEY },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (res.ok) return text;

  const quota = res.status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(text) || res.status === 500;
  if (quota && attempt <= 6) {
    const wait = Math.min(60_000, 8_000 * attempt);
    console.log(`    quota hit, waiting ${wait / 1000}s then retrying (attempt ${attempt + 1})`);
    await sleep(wait);
    return postAdmin(path, body, { attempt: attempt + 1 });
  }
  throw new Error(`POST ${path} failed (${res.status}): ${text}`);
}


// ─────────────────────────────────────────────────────────────────────────────
// PASS 1a — the 8 services.
// Slugs are deliberately untouched: /services/rag-systems is indexed and linked
// from the homepage OfferCatalog. Only what a reader sees changes, and each
// page still names its technical term once so search still matches it.
// ─────────────────────────────────────────────────────────────────────────────

// Per-service Q&A that still answered in the old vocabulary. Merged into the
// SERVICES entries below so the page, the JSON-LD and the chatbot all move
// together (the API re-embeds whatever it stores).
const SERVICE_FAQ = {
  "custom-self-improving-ai-agents": [
    { q: "What makes it \u201clearn\u201d?",
      a: "It keeps a record of every job it ran and whether the result was right, and that record shapes what it does next time. You get a screen showing whether it is improving or getting worse, so it is a number you can check rather than a claim we make." },
    { q: "What kind of work can it take on?",
      a: "Jobs that take several steps and a bit of judgement: researching and filling in details about new leads, sorting and routing incoming queries, processing documents where the answer is not always obvious, and helping your team look things up across several systems at once." },
    { q: "What stops it doing something it should not?",
      a: "You decide what it can do on its own and what needs a person to approve. Anything that cannot be undone, sending money, emailing a customer, deleting records, waits for a human unless you say otherwise. Every action is logged. We agree those limits before we build and enforce them in the software." },
    { q: "What does it cost and how long does it take?",
      a: "From \u20b95L, ready in three to five weeks. That covers the assistant, the things it is allowed to do, the way we measure whether it is working, and the limits above. Fixed price, with 30 days of support after it goes live." },
  ],
  "ai-websites": [
    { q: "What does \u201clive in 48 hours\u201d actually include?",
      a: "The design, the words, a way for you to edit the text and photos yourself, logins if you need them, payments, visitor tracking, and the whole thing running on your own domain. A real site, not a demo. The clock starts once your photos, logo and content are with us, and we agree exactly what it covers on a 30 minute call first." },
  ],
  "rag-systems": [
    { q: "How do you stop it making things up?",
      a: "It only answers from passages found in your own documents, and every answer names the file and page it came from. When nothing relevant turns up, it says so instead of guessing. We also hand over a set of real questions with correct answers, so you can measure how accurate it is yourself rather than take our word for it." },
    { q: "What does it cost and how long does it take?",
      a: "From \u20b94L, ready in two to three weeks. That is a fixed price covering loading your documents, the search, the testing, and putting it live, plus 30 days of support afterwards." },
  ],
  "mobile-apps": [
    { q: "Can the app work without a signal?",
      a: "Yes. Where the job needs it, the app keeps working offline and syncs up once the signal comes back, which matters more in India than most app agencies admit. Some AI features can also run on the phone itself, so the data never leaves the handset." },
  ],
  "custom-ai-software": [
    { q: "Can you add AI to software we already have?",
      a: "Almost always, without rebuilding what you have. We add search, summaries and assistants to existing websites, apps and internal tools. The usual candidates are your CRM, your support desk, your dashboards, and anything involving paperwork." },
    { q: "How is this different from the other things you build?",
      a: "The rest of what we do solves a shape of problem we have solved before: a website, a document assistant, a voice agent. This is for everything else. Internal tools, AI features inside a product you already own, and connections between systems that do not fit a template. We agree the price and the date after one call." },
  ],
};

const SERVICES = {
  "ai-websites": {
    title: "Websites in 48 hours",
    headline: "Your website, live in 48 hours",
    meta: "Website · live in 48 hours · fixed price",
    summary:
      "A fast, good-looking website that takes payments and that you can edit yourself. Live in two days.",
    bullets: [
      "Live in 48 hours, not two months",
      "Takes UPI and card payments from day one",
      "You can edit the text and photos yourself",
      "Loads fast on a phone, on Indian networks",
    ],
    lead:
      "Most agencies take two months and three rounds of approvals to put up a website. We do it in 48 hours, working from one call. You get a real site on your own domain, taking real payments, with a way to change the words and pictures yourself afterwards.",
    body_md: `## What you get

A complete site, not a template with your logo on it. Pages written for what you actually sell, photos placed properly, and a contact form that reaches your phone.

It takes **UPI, cards and net banking** from the first day, through Razorpay or Stripe. If you sell something, people can buy it on day one.

You can **change the words and photos yourself** afterwards, from your phone, without calling us.

It **loads fast on a phone**, which is how nearly all of your customers will see it, and it is set up so Google can find it.

## How the 48 hours go

We talk for 30 minutes and agree exactly what the site says and does. You send us your photos, your logo and your price list. We build it, put it on your domain, and show you. If something is wrong, we fix it before we call it done.

## What it costs

From **₹75,000**, fixed. That price includes the domain setup, the payment connection, and 30 days of changes and fixes after it goes live. No monthly fee to us unless you want one.`,
  },

  "ai-automation": {
    title: "Automate the repetitive work",
    headline: "Stop paying people to copy and paste",
    meta: "Automation · ready in 1 to 2 weeks · fixed price",
    summary:
      "Connect the tools you already use so the boring work happens by itself, day and night.",
    bullets: [
      "New enquiry reaches your team in seconds",
      "Invoices, follow ups and reports send themselves",
      "Works with WhatsApp, Sheets, Slack and your CRM",
      "One price to build it, no charge per task",
    ],
    lead:
      "Somebody on your team is copying information from one screen to another. That is a job a computer should be doing at three in the morning, for free. We connect the tools you already pay for so it happens by itself.",
    body_md: `## Things we take off people's hands

- An enquiry comes in, and within seconds it is in your system, the customer has a reply on WhatsApp, and your salesperson has been told.
- An order is placed, so stock goes down, the customer gets a dispatch message, and a review request follows a week later.
- A bill needs raising, so the invoice is made, sent, and recorded in your accounts.
- A support message arrives, gets sorted into the right pile, and lands with the right person with a draft reply ready.
- Every morning, yesterday's numbers are pulled together and sent to you before you open your laptop.

## Why this is cheap to run

Tools like Zapier charge you every time something happens, which gets expensive fast once it is actually working. We build on **n8n**, which we host for you on a small server. You pay once to have it built, then a few hundred rupees a month to keep it running, no matter how many times it fires.

It also means your data can stay on a server in India, which some of our clients need.

## What you get at the end

The working automation, a simple dashboard so you can see it running, a plain English guide so your team can pause or change things without calling us, and alerts if anything breaks so you find out before your customers do.

## What it costs

From **₹25,000** for one automation, ready in one to two weeks. A full set covering several parts of the business runs ₹75,000 to ₹2L. Fixed price, agreed before we start.`,
  },

  "rag-systems": {
    title: "Answers from your own documents",
    headline: "An assistant that has read everything you have",
    meta: "Document assistant · ready in 2 to 3 weeks · fixed price",
    summary:
      "Ask a question, get the answer from your own files, with the page it came from. No guessing.",
    bullets: [
      "Answers only from your documents, never made up",
      "Shows which file and page each answer came from",
      "Handles PDFs, Word files, spreadsheets and web pages",
      "Your files stay in your own database, in India",
    ],
    lead:
      "Your policies, price lists, manuals and contracts hold the answers your staff and customers keep asking for, but nobody can find them fast enough. We build an assistant that has read all of it and answers in seconds, showing you the exact page it took the answer from. The technical name for this is RAG, if you have heard it called that.",
    body_md: `## What it actually does

You give it your files. Somebody types a question in plain language. It finds the relevant passages, answers from those, and shows a link to the document and page.

If the answer is not in your files, it says so instead of inventing one. That single behaviour is the difference between a tool your team trusts and one they quietly stop using.

## Where people use it

- A support chat that answers from your product documentation rather than a script.
- An HR assistant that answers leave and policy questions from your handbook.
- A legal or accounting team searching contracts and flagging the clauses that matter.
- A clinic answering the same pre and post treatment questions, from approved material only.
- One search box across everything scattered in Drive, Notion and email.

## What we hand over

The assistant itself, wherever you want it: a chat box on your site, a WhatsApp number, or inside a tool you already use. A pipeline that keeps it up to date as your documents change. A test set of real questions and correct answers, so you can measure how well it is doing rather than take our word for it. And a log of everything asked, so you learn what your customers actually want to know.

## Where your files live

In your own database, in the region you choose, usually India. We do not copy your documents anywhere else, and they are never used to train anybody's model.

## What it costs

From **₹4L** for one set of documents, ready in two to three weeks. Larger setups covering several teams, languages or clients run to ₹8L and up. Fixed price, with 30 days of support after it goes live.`,
  },

  "voice-agents-ivr-automation": {
    title: "AI that answers your phone",
    headline: "Nobody gets sent to voicemail again",
    meta: "Phone agent · ready in 2 to 3 weeks · fixed price",
    summary:
      "A voice that picks up every call, speaks Hindi, Marathi or English, and handles the routine ones itself.",
    bullets: [
      "Picks up every call, including nights and Sundays",
      "Speaks Hindi, Marathi and English on the same number",
      "Books, confirms and reschedules without a human",
      "Passes the real ones to your team with the context",
    ],
    lead:
      "Half the calls your office takes are the same four questions: are you open, where are you, how much is it, and can I book. A voice agent answers those instantly, at any hour, and puts the calls that actually need a person straight through to one.",
    body_md: `## What it handles

Opening hours, directions, prices, availability, order and delivery status, and booking or moving an appointment. It talks like a person, waits its turn, and understands somebody switching between Hindi and English mid sentence, which most callers do.

When a call needs a human, it hands over along with everything already said, so your customer does not have to start again.

## Where it plugs in

On your existing number, or a new one. It can also replace the press one for sales, press two for accounts menu that everybody hates, by simply asking what the caller needs and routing accordingly.

Every call is transcribed, so you can read what was said, see what people keep asking, and settle any dispute about what was promised.

## What it costs

From **₹2L**, ready in two to three weeks. That covers the conversation design, the languages you need, connecting it to your booking or order system, and 30 days of tuning after it goes live.`,
  },

  "mobile-apps": {
    title: "Mobile apps",
    headline: "One app, on both iPhone and Android",
    meta: "Mobile app · ready in 4 to 8 weeks · fixed price",
    summary:
      "An app your customers or your staff actually use, built once and published to both stores.",
    bullets: [
      "One build, published to both app stores",
      "Works offline and syncs when the signal returns",
      "Camera, scanning and location built in",
      "We handle the store submissions and approvals",
    ],
    lead:
      "Building separately for iPhone and Android costs twice as much and drifts apart within a year. We build once and publish to both, and we deal with the store review process so you do not have to learn it.",
    body_md: `## What we build

Apps for your customers, and apps for your own staff in the field. The second kind is usually where the money is: delivery runs, site inspections, stock counts, attendance, anything where somebody currently carries paper.

They keep working when the signal drops and sync up once it comes back, which matters more in India than most app agencies admit.

## What comes as standard

Logins, payments, notifications, camera and barcode scanning, location, and a dashboard for you to see what is happening. If the app needs to be smart about something, reading a document, sorting photos, understanding speech, that goes in too.

## Getting it published

We submit to both stores, deal with the review comments, and stay on it until it is actually live. Apple in particular rejects first submissions for reasons that are not obvious the first time you meet them.

## What it costs

From **₹8L**, ready in four to eight weeks depending on how much it does. Larger apps run to ₹15L. Fixed price, agreed after a scoping call, with 30 days of support once it is live.`,
  },

  "custom-ai-software": {
    title: "Software built around your business",
    headline: "When nothing off the shelf fits how you work",
    meta: "Custom software · scoped to your problem · fixed price",
    summary:
      "The tool your business needs that nobody sells, built properly and handed over to you.",
    bullets: [
      "Built for how you actually work, not the other way round",
      "Fits alongside the software you already run",
      "Fixed price and a fixed date before we start",
      "You own the code and the accounts at the end",
    ],
    lead:
      "Sometimes the thing you need does not exist as a product, or the product that exists would force you to change how you work. This is for that: a tool built around your business, with AI doing the parts that need judgement.",
    body_md: `## What this usually turns out to be

An internal tool that replaces a spreadsheet ten people are editing at once. A dashboard that pulls numbers from four systems that do not talk to each other. An assistant that sits inside the software your team already uses and does the tedious half of their job.

We start from what is slow or getting missed today, not from a list of features.

## How we keep it honest

You get a fixed price and a fixed date before you commit. Progress goes on WhatsApp every day, so you are never waiting for a status call. If AI is doing something that matters, we agree in advance what it is allowed to do on its own and what needs a person to approve, and we enforce that in the software rather than in a document.

## What you own afterwards

All of it. The code, the accounts, the documentation, and a walkthrough for whoever will run it. You can keep us on for changes, or not.

## What it costs

From **₹1.5L**, but this one genuinely depends on what it is. We will give you a fixed number after a 30 minute call, free, and you are under no obligation.`,
  },

  "custom-self-improving-ai-agents": {
    title: "AI assistants that learn your work",
    headline: "An assistant that gets better the longer you use it",
    meta: "AI assistant · ready in 3 to 5 weeks · fixed price",
    summary:
      "A capable assistant that does multi step jobs, remembers your business, and improves with use.",
    bullets: [
      "Handles jobs that take several steps, not one question",
      "Remembers your business between conversations",
      "Reachable on WhatsApp, Telegram or Slack",
      "You decide what it can do without asking a person",
    ],
    lead:
      "A chatbot answers a question and forgets you. This is the next thing along: an assistant that takes on a whole job, works through it in steps, remembers what you told it last week, and gets better at it as you correct it.",
    body_md: `## What it is good for

Work that takes several steps and a bit of judgement. Researching and filling in details about new leads. Reading incoming email or documents and deciding where each one goes. Pulling a report together from three systems every Monday morning. Sitting with your team as an assistant that can actually look things up across everything you run.

## What "learns" means here

It keeps a record of what it did and whether it worked, and that record shapes what it does next time. You get a screen showing whether it is getting better or worse, so this is a number you can check rather than a claim we make.

It also remembers your business between conversations: your products, your people, how you like things phrased.

## Keeping it in bounds

You decide what it is allowed to do by itself and what needs a human to press the button. Anything that cannot be undone, sending money, emailing a customer, deleting records, waits for approval unless you say otherwise. Every action it takes is logged.

We agree these limits during scoping and build them in, rather than trusting it to behave.

## What it costs

From **₹5L**, ready in three to five weeks. That covers the assistant, the things it is allowed to do, the way we measure whether it is working, and the limits above. Fixed price, 30 days of support after it goes live.`,
  },

  "ai-compliance-regtech-gst-dpdp-act": {
    title: "GST and data law, handled automatically",
    headline: "Stop missing deadlines and paying penalties",
    meta: "Compliance · ready in 2 to 3 weeks · fixed price",
    summary:
      "GST filing, the new data protection law, and every deadline, tracked and mostly done for you.",
    bullets: [
      "GST returns prepared and mismatches flagged early",
      "Gets you ready for the DPDP data protection law",
      "Deadline reminders on WhatsApp before it is too late",
      "One screen showing what is done and what is not",
    ],
    lead:
      "Compliance is not hard, it is just relentless, and the penalty for forgetting is real money. We automate the repeating parts so the deadlines come to you instead of you chasing them.",
    body_md: `## GST

Your returns get prepared from your own sales and purchase data, and anything that does not match your suppliers' filings is flagged before it becomes your problem at reconciliation time. You approve and file; you stop rebuilding the same spreadsheet every month.

## The DPDP Act

India's data protection law changes what you are allowed to do with customer information. We audit what you currently collect and store, tell you plainly where you are exposed, and build the parts you need: proper consent when you collect data, a record of who agreed to what, and a way to handle it when a customer asks you to delete their information.

## Deadlines

Every filing date you are subject to, tracked, with reminders on WhatsApp and by phone before the date rather than after it.

## The screen you actually look at

One page: what is filed, what is pending, what is at risk, and what needs you this week. Plus an assistant that answers questions about your own compliance position from your own documents.

## What it costs

From **₹3L**, ready in two to three weeks, fixed price with 30 days of support. This is built for Indian small and mid sized businesses, not adapted from something American.`,
  },
};


// ─────────────────────────────────────────────────────────────────────────────
// PASS 1b — the 13 sector rows. `service_slugs`, `custom_services` and
// `case_studies` are left to the sweep; this is the copy a visitor reads first.
// ─────────────────────────────────────────────────────────────────────────────
const INDUSTRIES = {
  "d2c-ecommerce": {
    headline: "AI for shops and online brands",
    meta: "For online shops and D2C brands",
    summary: "Sell on WhatsApp, answer buyers instantly, and win back the carts people abandon.",
    bullets: [
      "Customers order straight from WhatsApp",
      "Instant answers on size, stock and delivery",
      "Abandoned carts chased automatically",
    ],
    lead:
      "Most online shops lose sales in the same two places: nobody answers the question fast enough, and the cart gets abandoned. Both are fixable without hiring anyone.",
    body_md: `## Where the money is going

**Nobody replies fast enough.** A buyer asks whether something is in stock, or which size to take, and gets an answer four hours later. By then they have bought it elsewhere. A bot that knows your catalogue answers in seconds, all night, in Hindi or English.

**Carts get abandoned and stay abandoned.** A reminder on WhatsApp an hour later, a nudge the next day, and a small discount on the third day recovers a meaningful share of them. It runs by itself once it is set up.

**Reviews never get asked for.** A message five days after delivery, asking for a photo and a line, quietly builds the social proof that sells the next order.

## Buying inside WhatsApp

For a lot of Indian buyers, WhatsApp is the internet. We build the whole thing there: browse, ask, order, pay by UPI, track the parcel, and reorder in one tap. It usually converts better than the website does.

## What it costs

A WhatsApp ordering bot starts at ₹1.5L. A full site with payments is ₹75,000 and live in 48 hours. Most brands start with one and add the other later.`,
  },

  "healthcare-clinics": {
    headline: "AI for clinics and hospitals",
    meta: "For clinics, hospitals and diagnostic centres",
    summary: "Bookings and reminders handled automatically, and safe answers from your own protocols only.",
    bullets: [
      "Bookings and reminders run themselves",
      "Answers only from material you approved",
      "Patient data stays in India and stays private",
    ],
    lead:
      "Your front desk spends most of the day on the phone booking appointments and repeating the same instructions. That work can run itself, safely, without anyone being given medical advice by a computer.",
    body_md: `## Booking and reminders

Patients book, confirm and reschedule on WhatsApp, at whatever hour suits them. Reminders go out the day before, which is the single cheapest way to cut no shows. Your desk stops being a call centre and goes back to looking after the person standing in front of them.

If your practice management or records system has a connection available, we sync both ways so nothing gets double booked.

## Answering questions safely

The assistant answers only from documents your doctors have approved: preparation instructions, timings, what to bring, what happens afterwards, your policies. Every answer shows which document it came from.

**It does not give medical advice.** Anything clinical goes to your staff. We scope it that way deliberately, because in healthcare a confident wrong answer is a liability.

## Patient data

It stays in a database you control, hosted in India. Access is logged. It is never used to train anybody's model.

## Languages

Hindi, Marathi and English on the same number, replying in whichever the patient used.`,
  },

  "fintech-payments": {
    headline: "AI for finance and lending",
    meta: "For lenders, brokers, NBFCs and payment companies",
    summary: "Faster customer checks, support that knows the rules, and a record of every decision.",
    bullets: [
      "Customer checks and document reading automated",
      "Support answers from your actual policy",
      "Every AI decision logged for the auditor",
    ],
    lead:
      "In finance the problem is never the idea, it is the paperwork and the audit trail. We automate the repetitive checks and keep a record of everything, so faster does not mean looser.",
    body_md: `## Onboarding customers

Reading identity documents, checking them against the form, spotting the mismatches, and flagging the cases that need a human. What took a day of somebody's attention becomes minutes, and the exceptions get the attention instead.

## Support that knows your rules

Your team answers questions about charges, eligibility and process all day. An assistant trained on your actual policy documents answers those in seconds and shows the clause it came from, so nobody has to trust it blindly.

## Built for the audit

Every answer traceable to a source. Every automated decision logged with what it saw and what it did. Clear limits on what the software may decide alone and what needs a person to sign off. Auditors ask these questions, so we build for them from the start rather than retrofitting.

## Your data

Stays in your own database, in India, and is never used to train anybody's model.`,
  },

  "real-estate": {
    headline: "AI for property and real estate",
    meta: "For builders, brokers and property firms",
    summary: "Every enquiry answered in seconds, and followed up until they book a visit.",
    bullets: [
      "Enquiries answered the moment they arrive",
      "Follow ups continue until they reply",
      "Project sites live in 48 hours",
    ],
    lead:
      "In property the first person to reply usually gets the visit. Portal leads go cold in under an hour and most of them never get called twice. Both problems are software problems.",
    body_md: `## Replying first

An enquiry arrives from a portal, an ad or your site, and gets a reply within seconds on WhatsApp: the price, the location, the floor plan, the availability. Then it asks the two or three questions your salesperson would ask, and books the site visit into a real calendar.

## Following up properly

Most buyers do not decide the first week. The follow ups continue on their own, spaced sensibly, until they respond or ask to stop. Your team gets the ones who are actually ready, with the whole conversation attached.

## A site per project, in 48 hours

Launches will not wait for a two month website. We put up a proper project page with the plans, the gallery, the location and a working enquiry form, in two days, on its own domain.

## Languages

Hindi, Marathi and English, on the same number, which matters more in this business than most.`,
  },

  "education-edtech": {
    headline: "AI for schools, colleges and coaching",
    meta: "For schools, colleges, coaching classes and edtech",
    summary: "Doubts answered at midnight from your own material, and admissions enquiries never missed.",
    bullets: [
      "Student doubts answered from your own notes",
      "Admission enquiries answered instantly",
      "Fee and attendance reminders sent automatically",
    ],
    lead:
      "Students study at night and ask questions when no teacher is awake. Parents enquire about admissions and expect an answer the same day. Neither needs a person sitting there.",
    body_md: `## Doubt solving from your material

Students ask a question and get an explanation drawn from your own notes and textbooks, pointing at the chapter it came from. Not a generic internet answer, and not a different method from the one you teach, which is the thing that actually confuses students.

You also see what the whole batch is stuck on, which tells you what to reteach.

## Admissions

Every enquiry gets an answer immediately: courses, fees, timings, eligibility, what to bring. The ones who are serious get booked in for a call or a visit. Nothing sits unanswered over a weekend.

## The administrative grind

Fee reminders, attendance alerts to parents, timetable changes, exam notices. All of it on WhatsApp, sent automatically, in the language the parent reads.

## Languages

Hindi, Marathi and English, so parents who are not comfortable in English still get answered properly.`,
  },

  "logistics-supply-chain": {
    headline: "AI for logistics and transport",
    meta: "For transporters, warehouses and supply chain teams",
    summary: "Stop answering where is my shipment, and stop typing paperwork into spreadsheets.",
    bullets: [
      "Customers track shipments themselves",
      "Delivery notes and invoices read automatically",
      "Systems that never talked, now connected",
    ],
    lead:
      "Two jobs eat a logistics office: telling people where their shipment is, and typing paper documents into a computer. Both can go.",
    body_md: `## Where is my shipment

Customers ask on WhatsApp and get the answer, with the expected time, without anybody picking up. When something slips, they are told before they ask, which is what actually keeps a customer.

## The paperwork

Delivery notes, invoices, lorry receipts and e way bills get read, checked, and entered into your system. Anything that does not add up gets flagged for a person instead of quietly going in wrong.

This is the highest value automation in the business and the least glamorous.

## Joining up your systems

Your transport system, your warehouse, your customer's portal and your accounts probably do not talk to each other, and somebody is bridging that gap by hand. We connect them so the data moves by itself, with alerts when something fails.

## What it costs

Automation starts at ₹25,000 for one workflow, and one to two weeks. Most operations start with tracking or documents and add the rest once they see it working.`,
  },

  "professional-services": {
    headline: "AI for lawyers, CAs and consultants",
    meta: "For law firms, accountants and consultancies",
    summary: "Find anything in your files in seconds, and stop losing enquiries to slow replies.",
    bullets: [
      "Search every document you have ever filed",
      "New client enquiries handled automatically",
      "First drafts and summaries prepared for you",
    ],
    lead:
      "Your firm's value is in its files, and finding anything in them takes a junior half a day. That is the problem worth fixing first.",
    body_md: `## Searching your own files

Ask a question in plain language and get the answer out of your own contracts, filings, opinions and notes, with the document and page it came from. Every answer is checkable, which is the only way this is usable in a professional practice.

Ten years of matters becomes something you can actually consult.

## Taking on new clients

Enquiries get answered, the basic details collected, conflicts flagged, and the appointment booked, before anybody in the firm has looked at it. Nothing sits in an inbox over a weekend.

## The first draft

Summarising a long document, pulling the key dates and obligations out of a contract, comparing a new agreement against your standard terms, drafting a routine letter. The assistant produces the draft; your professional judgement stays exactly where it is.

## Confidentiality

Your documents stay in your own database, in India. They are never used to train anybody's model, and access is logged. We will sign your NDA before the first call.`,
  },

  "hospitality-travel": {
    headline: "AI for hotels and restaurants",
    meta: "For hotels, restaurants and travel businesses",
    summary: "Take bookings around the clock, answer guests in their language, and reply to every review.",
    bullets: [
      "Bookings taken at any hour, in any language",
      "Guest questions answered instantly",
      "Every review replied to, quickly",
    ],
    lead:
      "Guests book late at night, ask questions in languages your reception does not cover, and judge you on how fast you reply to a review. All three can run themselves.",
    body_md: `## Bookings, all night

Take reservations on WhatsApp and on your site at any hour, with confirmations and reminders going out on their own. Fewer no shows, and no missed booking because it came in at midnight.

## The concierge questions

Timings, directions, parking, what is on the menu, whether you allow dogs, how far the airport is. Answered instantly, in Hindi, Marathi, English or whatever your guests actually speak.

## Reviews

Every review gets a reply, quickly, in your voice. Anything negative reaches your manager within the hour, while it can still be fixed. Review response speed moves your ranking on the booking platforms, and almost nobody keeps up with it by hand.

## Your website

A proper site with photos, menus, rooms and a working booking button, live in 48 hours from ₹75,000.`,
  },

  "manufacturing-industrial": {
    headline: "AI for manufacturing and industry",
    meta: "For factories, industrial and B2B businesses",
    summary: "Answers from the manual on the shop floor, and quotes out the same day.",
    bullets: [
      "Manuals and procedures answerable on a phone",
      "Quotes prepared in hours, not days",
      "Paperwork read and entered automatically",
    ],
    lead:
      "The knowledge that keeps your plant running is in manuals nobody reads and in the heads of people about to retire. Getting it out of both is worth more than any dashboard.",
    body_md: `## The manual, on a phone

An operator or technician asks a question and gets the answer out of your own machine manuals, standard procedures and maintenance history, with the page it came from. Works on a phone, on the floor, in the language they speak.

When your most experienced person retires, what they knew does not walk out with them.

## Quoting faster

Enquiries for custom or configured products take days to price because somebody has to work through specifications by hand. We automate the repeatable part so quotes go out the same day, which in B2B is very often the whole difference.

## Paperwork

Purchase orders, delivery challans, test certificates and invoices, read and entered into your system, with anything that does not match flagged for a person.

## Maintenance

Where you already have sensor or machine data, we watch it for the patterns that come before a failure and warn your team early. Where you do not, the honest answer is to fix the paperwork and the manuals first, and we will tell you so.`,
  },

  "automotive-mobility": {
    headline: "AI for car dealers and workshops",
    meta: "For dealerships, workshops and EV brands",
    summary: "Answer every enquiry in seconds and fill your service bays without phoning anyone.",
    bullets: [
      "Enquiries answered before they call someone else",
      "Service bookings and reminders run themselves",
      "Launch and model sites live in 48 hours",
    ],
    lead:
      "A car buyer enquires with four dealers and buys from whoever replies first with a real answer. Meanwhile your service department is phoning people all day to fill the bays.",
    body_md: `## Sales enquiries

Answered within seconds on WhatsApp, with the variant, the on road price, the finance figure and what is actually in stock. Then it books the test drive into a real calendar and keeps following up until they respond.

## The service department

Service reminders go out when they are due, customers book their own slot, and they get told when the car is ready. Nobody spends the morning on the phone. Bays fill and customers stop drifting to the local garage after the warranty ends.

## Launches

A new model or a new showroom needs a page now, not in two months. We put one up in 48 hours with the gallery, the specifications, the pricing and a working enquiry form.

## Languages

Hindi, Marathi and English on the same number, which is how your customers actually talk.`,
  },

  "saas-b2b-tech": {
    headline: "AI inside your product",
    meta: "For software and technology companies",
    summary: "Add the AI features your customers are asking for, without hiring a team to do it.",
    bullets: [
      "Search and answers over your own documentation",
      "An assistant built into your product",
      "Onboarding that walks new users through it",
    ],
    lead:
      "Your customers are asking for AI features and your roadmap is already full. We build them alongside your team, to your standards, and hand them over.",
    body_md: `## Answers over your documentation

Users ask a question inside your product and get an answer from your own documentation and help articles, with a link to the source. Support volume drops, and you find out what people cannot figure out.

## An assistant in the product

Something that helps users do the thing your product is for, rather than a chat window bolted to the corner. It can read what is on the user's screen, take actions on their behalf where you allow it, and hand over to a human where you do not.

## Onboarding

New users get walked through setup, prompted at the right moments, and helped through the point where they usually give up. Activation is normally the cheapest number in the business to move.

## How we work with you

Your repository, your review process, your deployment. We write the tests and hand over documentation your engineers can maintain. You are not buying a black box you have to come back to us to change.`,
  },

  "travel-tourism": {
    headline: "AI for travel companies",
    meta: "For tour operators, travel agents and DMCs",
    summary: "Plan trips, answer travellers at any hour, and turn enquiries into confirmed bookings.",
    bullets: [
      "Itineraries drafted from a short conversation",
      "Travellers helped while they are away",
      "Enquiries followed up until they book",
    ],
    lead:
      "Travel enquiries arrive at all hours and take days of back and forth before anything is booked. Most of that back and forth is the same questions every time.",
    body_md: `## Planning the trip

A traveller says where they want to go, for how long, with whom and roughly what budget, and gets a sensible draft itinerary back within minutes. Your consultant then adjusts it and adds the judgement, instead of starting from a blank page.

## While they are travelling

Their itinerary, tickets, timings, directions, and somebody to ask at two in the morning in a different timezone. It answers the routine ones and gets a real person for the rest.

## Turning enquiries into bookings

Every enquiry is answered immediately and followed up on its own until they book or say no. In travel, the drop off between enquiry and booking is where the whole margin goes.

## Keeping in touch afterwards

Post trip thank you, review request, and a well timed offer for the next one, sent automatically to the people most likely to travel again.`,
  },

  "recruitment-hr": {
    headline: "AI for recruiters and HR teams",
    meta: "For recruitment agencies and HR teams",
    summary: "Read every application, reply to every candidate, and stop scheduling interviews by hand.",
    bullets: [
      "Every application read and shortlisted",
      "Every candidate gets a reply",
      "Interviews scheduled without the email chain",
    ],
    lead:
      "Four hundred applications arrive, thirty get read properly, and the rest never hear back. That is how a hiring pipeline quietly damages the employer brand it depends on.",
    body_md: `## Reading the applications

Every CV read against what the role actually needs, shortlisted, and summarised with the reasons. You get a ranked list with the reasoning shown, so you can disagree with it.

The screening questions that eat a recruiter's morning, notice period, expected salary, location, work authorisation, get asked and answered on WhatsApp before anybody's time is spent.

## Replying to everyone

Every candidate hears back, including the ones you are not taking forward. It costs nothing and it is most of the difference between a good and bad reputation as an employer.

## Scheduling

Interviews booked against your team's real calendars, with reminders and rescheduling handled automatically, without the eight email chain.

## Onboarding

Offer letter, documents collected, accounts requested, first week arranged, and a checklist that HR can see rather than remember.`,
  },
};


// ─────────────────────────────────────────────────────────────────────────────
// PASS 1c — the /faq page (`site_faqs`). Mirrors CONTENT.faq, which is the
// fallback the page renders if this table is unreachable, so the two stay in
// step. `homepage_featured` picks the six that also show on the home page.
// ─────────────────────────────────────────────────────────────────────────────
const SITE_FAQS = [
  {
    position: 1, category: "About us", homepage_featured: true, tags: ["mumbai", "about"],
    question: "What does Voltair Tech actually do?",
    answer:
      "We build software that uses AI to do work your team is doing by hand. That usually looks like a website, a chatbot that answers customers on WhatsApp, a voice agent that picks up your phone, or a tool that reads your documents and answers questions about them. We are based in Andheri West, Mumbai.",
  },
  {
    position: 2, category: "About us", homepage_featured: false, tags: ["trust", "proof"],
    question: "Why should we trust you with this?",
    answer:
      "We have shipped 42 products since 2024 for 28 clients across India, Europe and Asia Pacific. You can see real ones on our live projects page, and we will put you in touch with references after an NDA.",
  },
  {
    position: 3, category: "Time and money", homepage_featured: true, tags: ["speed", "website"],
    question: "How fast can my website be live?",
    answer:
      "48 hours from the day we start. That includes the design, the writing, the ability to edit it yourself later, and your own domain name. Bigger projects like apps take longer, and we give you the exact date before you pay anything.",
  },
  {
    position: 4, category: "Time and money", homepage_featured: true, tags: ["pricing", "cost"],
    question: "What does it cost?",
    answer:
      "A website starts at ₹75,000. A chatbot starts at ₹1.5L. Larger tools run ₹4L to ₹8L, and mobile apps ₹8L to ₹15L. Every quote is a fixed price agreed before we start, and includes 30 days of support after it goes live.",
  },
  {
    position: 5, category: "Time and money", homepage_featured: false, tags: ["support", "handover"],
    question: "What happens after it goes live?",
    answer:
      "You get 30 days of free support: fixes, monitoring, and small changes. After that you can take it over completely or keep us on a monthly retainer. Either way the code is yours.",
  },
  {
    position: 6, category: "What we build", homepage_featured: true, tags: ["documents", "rag", "search"],
    question: "Can a bot answer questions about our own documents?",
    answer:
      "Yes, and this is one of the most common things we build. You give it your policies, price lists, manuals or product information, and it answers staff or customer questions from those files only. Every answer shows which document it came from, so nobody has to take it on trust. The technical name for this is RAG, if you have heard it called that.",
  },
  {
    position: 7, category: "What we build", homepage_featured: true, tags: ["whatsapp", "chatbot"],
    question: "Do you build WhatsApp chatbots?",
    answer:
      "Yes, it is our most requested build. We handle the approval process with Meta, write the conversation, connect payments if you take them, and teach the bot from your own information. The same bot handles Hindi, Marathi and English.",
  },
  {
    position: 8, category: "What we build", homepage_featured: true, tags: ["integration", "existing"],
    question: "Can you add AI to the software we already have?",
    answer:
      "Usually yes, without rebuilding what you have. We add things like search, summaries, and assistants to existing websites, apps and internal tools. The usual candidates are your CRM, your support desk, your dashboards, and anything involving paperwork.",
  },
  {
    position: 9, category: "What we build", homepage_featured: false, tags: ["languages", "hindi", "marathi"],
    question: "Will it work in Hindi and Marathi?",
    answer:
      "Yes. Chatbots and voice agents handle Hindi, Marathi and English on the same number, and reply in whichever language the customer used.",
  },
  {
    position: 10, category: "Working together", homepage_featured: false, tags: ["nda", "privacy"],
    question: "Do you sign an NDA?",
    answer:
      "Yes, before the first call if you want one. It is a standard one page mutual NDA under Indian law, usually signed the same day. We do not subcontract your work or share your code with anyone.",
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// PASS 2 — the mechanical sweep.
//
// Runs over every remaining string a visitor can read: the 144 sector
// sub-services, the case studies, and per-row FAQ answers. It only rewords; it
// never changes what a line claims. That long tail is real detail the team
// wrote, and inventing over it would lose information.
//
// Order matters: longer phrases first, so "AI-powered RAG" is handled before
// the bare "RAG" rule gets to it.
// ─────────────────────────────────────────────────────────────────────────────
const SAFE_PHRASES = [
  // Acronyms and product names only. Each replacement is a noun phrase filling
  // the same grammatical slot, so it cannot bend a sentence out of shape.
  // Anything that would need the sentence rebuilt lives in EXACT below instead.
  [/\bUGC\b/g, "customer photos and reviews"],
  [/\bRFM\b/g, "how recently and often they buy"],
  [/\bCLV\b/g, "lifetime value"],
  [/\bAOV\b/g, "average order value"],
  [/\bSKUs\b/g, "products"],
  [/\bSKU\b/g, "product"],
  [/\bKPIs\b/g, "key numbers"],
  [/\bKPI\b/g, "key number"],
  [/\bTAT\b/g, "turnaround time"],
  [/\bEMR\b/g, "patient records system"],
  [/\bERP\b/g, "business software"],
  [/\bMES\b/g, "shop-floor system"],
  [/\bSOPs\b/g, "standard procedures"],
  [/\bSOP\b/g, "standard procedure"],
  [/\bPODs\b/g, "delivery notes"],
  [/\bPOD\b/g, "delivery note"],
  [/\bIVR\b/g, "phone menu"],
  [/\bDMCs\b/g, "destination specialists"],
  [/\bNPS\b/g, "satisfaction"],
  [/\bCSAT\b/g, "satisfaction"],
  [/\bCSI\b/g, "customer satisfaction"],
  [/\bLTV\b/g, "lifetime value"],
  [/\bOCR-processed\b/g, "read automatically"],
  [/\bOCR\b/g, "text recognition"],
  [/\bRFQ\b/g, "quote request"],
  [/\bNDR\b/g, "failed delivery"],
  [/\bTMS\b/g, "transport system"],
  [/\bJD\b/g, "job description"],
  [/\bPOs\b/g, "purchase orders"],
  [/\bPO\b/g, "purchase order"],
  [/\bPMS\/POS\b/g, "your booking and billing systems"],
  [/\bHRIS\b/g, "your HR system"],
  [/\bSPOC\b/g, "contact"],
  [/\bRPO\b/g, "recruitment outsourcing"],
  [/\bDEI\b/g, "diversity and inclusion"],
  [/\bCTA\b/g, "a call to action"],
  [/\bon-device ML\b/gi, "AI that runs on the phone itself"],
  [/\bpgvector\b/g, "your own database"],
  [/\bn8n\b/gi, "workflow automation"],
];

/**
 * Sentences that need rebuilding, not find-and-replace. There are 14 of them
 * across 775 strings in the sector sub-services and case studies, so they are
 * written out rather than guessed at by a regex: an earlier mechanical pass
 * turned "grounded in your protocols via RAG" into "answering only from your
 * protocols from your own documents", which is worse than the jargon.
 * Matched on the exact stored string; a miss simply leaves the row alone.
 */
const EXACT = new Map([
  ["Client Testimonial & NPS Engine", "Testimonial & Satisfaction Engine"],
  ["Client NPS & Partnership Review Engine", "Client Satisfaction & Partnership Review"],
  ["Promoters automatically asked for referrals via WhatsApp after positive NPS",
   "Happy clients are asked for a referral on WhatsApp automatically"],
  ["Patient Retention & LTV Dashboard", "Patient Retention & Value Dashboard"],
  ["Document OCR & Archive Digitizer", "Document Reading & Archive Digitiser"],
  ["OCR converts handwritten prescriptions to searchable digital text",
   "Handwritten prescriptions are read and turned into searchable text"],
  ["Invoice & PO Data Extraction Bot", "Invoice & Purchase Order Reading Bot"],
  ["RFQ & Sales Enquiry Capture Bot", "Quote Request & Enquiry Capture Bot"],
  ["NDR & Delivery Failure Predictor", "Failed Delivery Predictor"],
  ["UGC from toppers collected for admission brochures and ad campaigns",
   "Photos and quotes from top scorers, collected for brochures and ads"],
  ["POD & Shipping Document Digitization", "Delivery Note & Shipping Document Capture"],
  ["Turns guest testimonials and UGC photos into shareable Instagram stories",
   "Turns guest testimonials and guest photos into shareable Instagram stories"],
  ["SOP & Technical Manual Assistant", "Procedure & Technical Manual Assistant"],
  ["Review & UGC Collection Engine", "Review & Photo Collection Engine"],
  ["Repurposes customer UGC photos into branded Instagram carousel posts",
   "Turns customer photos into branded Instagram carousel posts"],
  ["Customer Segmentation & CLV Dashboard", "Customer Value & Segments Dashboard"],
  ["Classifies customers by RFM and runs tailored campaigns per segment",
   "Sorts customers by how recently and how often they buy, then runs a different campaign for each group"],
  ["Tracks CLV, AOV & repurchase rate by channel, category & cohort",
   "Tracks lifetime value, average order value and repeat purchase rate by channel and category"],
  ["A copilot that answers from the company's actual policy docs with built-in escalation, PII redaction and prompt-injection defence — every output logged.",
   "An assistant that answers from the company's actual policy documents, hands over to a person when it should, hides personal details, and resists attempts to talk it out of its rules. Every answer is logged."],
  ["Support copilot grounded in real policies", "Support answers from your actual policy"],
  [
    "A RAG assistant grounded strictly in the clinic's treatment protocols, with consent-first data flows and audit-ready logs.",
    "An assistant that answers only from the clinic's approved treatment protocols, asks for consent before storing anything, and keeps a log the practice can audit.",
  ],
  [
    "A RAG copilot over machine manuals, SOPs and past tickets so operators get the cited procedure in seconds, plus automations linking MES, ERP, Sheets and Slack.",
    "An assistant that reads the machine manuals, standard procedures and past tickets, so an operator gets the right procedure in seconds with the page it came from. The shop-floor system, the business software, Sheets and Slack were connected so the data moves by itself.",
  ],
  [
    "A RAG tutor that answers only from the institute's syllabus and cites the chapter and page, delivered inside their mobile app with progress tracking.",
    "A tutor that answers only from the institute's own syllabus and names the chapter and page, built into their mobile app with progress tracking.",
  ],
  [
    "A WhatsApp bot handles booking, confirmations and reminders, while a RAG patient-FAQ assistant answers only from the clinic's approved protocols — every reply cited.",
    "A WhatsApp bot handles booking, confirmations and reminders. A second assistant answers patient questions only from the clinic's approved protocols, showing the source of every reply.",
  ],
  [
    "A WhatsApp tracking bot that answers from live shipment data, plus n8n pipelines that parse PODs and e-way bills and route delay exceptions automatically.",
    "A WhatsApp bot that answers where a shipment is from live data, plus automation that reads delivery notes and e-way bills and flags delays to the right person.",
  ],
  [
    "An in-product copilot and RAG search slotted into their existing auth, data and UI, with an eval harness and guardrails so quality holds as they ship.",
    "An assistant and a search box built into their existing product, using their own logins and data, with a test set and clear limits so quality holds as they keep shipping.",
  ],
  [
    "An n8n pipeline: order placed → inventory updated → dispatch alert → review request, fully hands-off.",
    "One automation: an order is placed, stock goes down, the dispatch alert goes out, and a review request follows. Nobody touches it.",
  ],
  [
    "Document RAG across the firm's matters — ask in plain language, get answers tied to the exact source — plus intake automation that captures and routes new matters.",
    "Search across every matter the firm has handled. Ask in plain language, get an answer tied to the exact document. New enquiries are captured and routed automatically.",
  ],
  ["In-product RAG copilot shipped without a rebuild", "An assistant inside their product, with no rebuild"],
  ["Protocol-grounded patient-FAQ assistant", "Patient answers, from approved protocols only"],
  ["SOP & manual RAG for the shop floor", "Procedures and manuals, searchable on the floor"],
  [
    "Students needed instant doubt-solving, but a tutor that hallucinates erodes trust fast.",
    "Students needed answers at once, but a tutor that makes things up loses their trust fast.",
  ],
  ["Syllabus-grounded doubt-solving tutor", "A tutor that answers from your syllabus"],
]);

/** Dashes read as machine-written, so they go everywhere a reader can see. */
function dedash(s) {
  return s
    // "1–2 weeks" / "20–30%" / "₹4L–₹8L" -> "1 to 2 weeks"
    .replace(/(\d[\d,.]*\s*%?)\s*[–—]\s*(₹?\d)/g, "$1 to $2")
    .replace(/(₹[\d,.]*[A-Za-z]*)\s*[–—]\s*(₹[\d,.]*[A-Za-z]*)/g, "$1 to $2")
    // A MATCHED PAIR of em dashes is a parenthetical ("the person — industry,
    // founders, headcount — and returns one dossier"). Commas turn that into
    // soup, so it becomes brackets; only unpaired dashes become commas.
    .replace(/\s+[–—]\s+([^–—]{3,140}?)\s+[–—]\s+/g, " ($1) ")
    // " — clause" -> ", clause" (an em dash used as punctuation)
    .replace(/\s+[–—]\s+/g, ", ")
    // "word—word" with no spaces -> "word, word"
    .replace(/([a-z])[–—]([a-z])/gi, "$1, $2")
    // Arrows read as a diagram, not a sentence.
    .replace(/\s*→\s*/g, " then ")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;:])/g, "$1");
}

function plain(s) {
  if (typeof s !== "string" || !s) return s;
  const exact = EXACT.get(s.trim());
  if (exact) return exact;
  let out = s;
  for (const [re, to] of SAFE_PHRASES) out = out.replace(re, to);
  out = dedash(out).trim();
  // A line that opened with an acronym ("NPS trends identify...") now opens
  // with its lowercase expansion. Put the capital back rather than adding an
  // EXACT entry per bullet.
  if (/^[A-Z]/.test(s.trim()) && /^[a-z]/.test(out)) {
    out = out[0].toUpperCase() + out.slice(1);
  }
  return out;
}

/**
 * Keys whose contents are deliberately technical and must survive untouched.
 * `tech_stack` is the "Built with" chip list on a case study: a buyer reading
 * it wants the real tool names, and turning "Supabase (pgvector)" into
 * "Supabase (your own database)" destroys the only thing that list is for.
 * `url`, `link` and `slug` are addresses, not prose.
 */
const KEEP_VERBATIM = new Set([
  "tech_stack", "stack", "surfaces",
  "url", "link", "slug", "href", "icon", "provider", "poster",
]);

/** Recursively plain-ify every string in a JSON value, skipping the keys above. */
function plainDeep(v) {
  if (typeof v === "string") return plain(v);
  if (Array.isArray(v)) return v.map(plainDeep);
  if (v && typeof v === "object") {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      out[k] = KEEP_VERBATIM.has(k) ? val : plainDeep(val);
    }
    return out;
  }
  return v;
}


// ─────────────────────────────────────────────────────────────────────────────
// Write
// ─────────────────────────────────────────────────────────────────────────────

// Every column the site's API accepts, so a full-row re-post cannot drop
// anything the admin has set — galleries and covers especially.
const SERVICE_COLUMNS =
  "slug,title,headline,summary,bullets,eta,icon,cover_image,media,lead,meta,body_md,price,tags,seo,faq,position,status,published_at";
const PROJECT_COLUMNS =
  "slug,name,kicker,tagline,summary,lifecycle,surfaces,stack,highlights,stats,links,media,cover_image,brochure,tags,seo,position,status,published_at";
const INDUSTRY_COLUMNS =
  "slug,title,headline,summary,bullets,icon,cover_image,media,icon_image,lead,meta,body_md,tags,service_slugs,custom_services,case_studies,faq,seo,position,homepage_featured,status,published_at";

/** Authored fields win; everything else on the row goes through the sweep. */
function rewriteRow(row, authored, faqMap) {
  const faq = faqMap?.[row.slug];
  // Sweep first so authored copy is never second-guessed by a regex.
  const swept = plainDeep(row);
  return { ...swept, ...(authored ?? {}), ...(faq ? { faq } : {}) };
}

/** True when the sweep or the authored copy actually changed something. */
function changed(before, after) {
  return JSON.stringify(before) !== JSON.stringify(after);
}

async function rewrite({ table, columns, apiPath, batchKey, authoredMap, faqMap, label }) {
  const rows = await sbSelect(table, `select=${columns}&order=position`);
  const payload = [];

  for (const row of rows) {
    const next = rewriteRow(row, authoredMap[row.slug], faqMap);
    if (!changed(row, next)) {
      console.log(`  · ${row.slug}: already plain, left alone`);
      continue;
    }
    const hand = authoredMap[row.slug] ? "rewritten" : "swept";
    const label = next.title ?? next.name;
    const was = row.title ?? row.name;
    console.log(`  ✓ ${row.slug}: ${hand}${label !== was ? `  "${was}" -> "${label}"` : ""}`);
    payload.push(next);
  }

  if (!payload.length) {
    console.log(`  nothing to write\n`);
    return;
  }

  let written = 0;
  for (const row of payload) {
    await postAdmin(apiPath, { [batchKey]: [row] });
    written += 1;
    if (!DRY && written < payload.length) await sleep(GAP_MS);
  }
  console.log(`  wrote ${written} ${label}${DRY ? " (dry run, nothing sent)" : " (re-embedded for the chatbot)"}\n`);
}


// ─────────────────────────────────────────────────────────────────────────────
// Blog posts
//
// Different treatment on purpose. These are articles, and an article about
// document search SHOULD say "RAG" — the reader searched for that word. So the
// jargon rules are skipped here and only the dash rule runs, which changes
// punctuation and never meaning.
//
// Fenced and inline code is masked first: a `→` inside a code sample is part of
// the sample, not prose.
// ─────────────────────────────────────────────────────────────────────────────
function dashOnly(md) {
  if (typeof md !== "string" || !md) return md;
  const stash = [];
  const masked = md
    .replace(/```[\s\S]*?```/g, (m) => `\u0000${stash.push(m) - 1}\u0000`)
    .replace(/`[^`\n]*`/g, (m) => `\u0000${stash.push(m) - 1}\u0000`);
  return dedash(masked).replace(/\u0000(\d+)\u0000/g, (_, i) => stash[Number(i)]);
}

async function rewriteBlog() {
  const rows = await sbSelect(
    "blog_posts",
    "select=slug,title,excerpt,body_md,cover_image,media,tags,author,seo,faq,status,pin_position,reading_minutes,published_at&order=published_at.desc",
  );
  const payload = [];
  for (const row of rows) {
    const next = {
      ...row,
      title: dashOnly(row.title),
      excerpt: dashOnly(row.excerpt),
      body_md: dashOnly(row.body_md),
      faq: (row.faq ?? []).map((f) => ({ q: dashOnly(f.q), a: dashOnly(f.a) })),
    };
    if (changed(row, next)) payload.push(next);
    else console.log(`  · ${row.slug}: already plain, left alone`);
  }
  if (!payload.length) {
    console.log("  nothing to write\n");
    return;
  }
  let written = 0;
  for (const row of payload) {
    console.log(`  ✓ ${row.slug}: dashes swept`);
    await postAdmin("/api/blog", { posts: [row] });
    written += 1;
    if (!DRY && written < payload.length) await sleep(GAP_MS);
  }
  console.log(`  wrote ${written} posts${DRY ? " (dry run, nothing sent)" : " (re-embedded for the chatbot)"}\n`);
}

console.log(`Rewriting copy -> ${SITE}${DRY ? "   [DRY RUN]" : ""}\n`);

if (!ONLY || ONLY === "services") {
  console.log("Services");
  await rewrite({
    table: "services",
    columns: SERVICE_COLUMNS,
    apiPath: "/api/services",
    batchKey: "services",
    authoredMap: SERVICES,
    faqMap: SERVICE_FAQ,
    label: "services",
  });
}

if (!ONLY || ONLY === "industries") {
  console.log("Industries (and their sector sub-services + case studies)");
  await rewrite({
    table: "industries",
    columns: INDUSTRY_COLUMNS,
    apiPath: "/api/industries",
    batchKey: "industries",
    authoredMap: INDUSTRIES,
    label: "industries",
  });
}

if (!ONLY || ONLY === "projects") {
  console.log("Live projects");
  await rewrite({
    table: "live_projects",
    columns: PROJECT_COLUMNS,
    apiPath: "/api/live-projects",
    batchKey: "projects",
    authoredMap: {},
    label: "projects",
  });
}

if (ONLY === "blog") {
  console.log("Blog posts (punctuation only)");
  await rewriteBlog();
}

if (!ONLY || ONLY === "faqs") {
  console.log("The /faq page");
  await postAdmin("/api/faqs", { faqs: SITE_FAQS });
  console.log(`  wrote ${SITE_FAQS.length} questions${DRY ? " (dry run, nothing sent)" : ""}\n`);
}

console.log("Done. Check /services, an /industries/<slug> page, and /faq.");
