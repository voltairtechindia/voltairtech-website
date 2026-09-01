/**
 * Static fallback for /live-projects — the seed the DB table was populated
 * from, and what the page renders if Supabase is unreachable at build time.
 *
 * Every entry is transcribed from that product's own feature brochure (the
 * PDFs under `public/brochures/`, whose page-one artwork is also the cover
 * under `public/assets/live-projects/`), so the page and the PDF a visitor
 * downloads next to it never disagree. Once a row exists in `live_projects`
 * the DB wins — edit it in the admin, not here. This file stays so the page
 * can never render empty, and so `npm run projects:seed` has something to
 * upload.
 *
 * `lifecycle` is deliberately conservative:
 *   live    — running in production, anyone can use it today
 *   shipped — built and in use, but not open self-serve
 *   build   — its own brochure says it is still in development
 */

import type { LiveProject, ProjectLifecycle, ProjectLink, ProjectStat } from "./types";

/** The literal below — the DB row shape minus the columns the DB fills in. */
export interface SeedProject {
  slug: string;
  name: string;
  kicker: string;
  tagline: string;
  lifecycle: ProjectLifecycle;
  surfaces: string[];
  summary: string;
  stats: ProjectStat[];
  highlights: string[];
  stack: string[];
  /** Local cover under /public — replaced by a Supabase URL once seeded. */
  cover: string;
  coverAlt: string;
  /** Local PDF under /public — replaced by a Supabase URL once seeded. */
  brochure: string;
  links?: ProjectLink[];
}

export const SEED: SeedProject[] = [
  {
    slug: "fleetdrop",
    name: "FleetDrop",
    kicker: "Delivery operations",
    tagline:
      "Run your own fleet the way the ten-minute apps run theirs.",
    lifecycle: "shipped",
    surfaces: ["Web console", "iOS", "Android", "Tracking link"],
    summary:
      "Dispatch, live tracking and proof of delivery for companies that employ their own riders. A manager console in the browser, a native app in the rider's pocket, and a tracking link the customer opens without an account — assignment, ETAs, OTP handover, photographic proof and cash reconciliation in one system.",
    stats: [
      { value: "3", label: "Surfaces" },
      { value: "16", label: "Manager screens" },
      { value: "3", label: "Independent proofs" },
      { value: "₹0", label: "Map cost / 10k drops" },
    ],
    highlights: [
      "Dispatch board ranks available riders by real road distance to the pickup, not by list order — two clicks to assign, and the rider's phone knows within a second.",
      "Proof is enforced by the database, not the UI: code, photo, geofence and cash are checked before a delivery is allowed to close.",
      "The rider app keeps working on no signal — an outbox guarantees the day's work survives a dead network.",
      "Four roles travel inside the signed session token, so every query is scoped to one company before it reaches the database.",
      "Review queue surfaces faked GPS and missing evidence with coordinates attached, and the adjudication is itself a logged event.",
    ],
    stack: ["Next.js", "React Native", "Supabase / Postgres", "Realtime", "RLS"],
    cover: "/assets/live-projects/fleetdrop.webp",
    coverAlt: "FleetDrop feature brochure cover",
    brochure: "/brochures/fleetdrop.pdf",
  },
  {
    slug: "kauntech",
    name: "KaunTech",
    kicker: "Sales intelligence · mobile",
    tagline: "Scan the card. Know the company. Close the deal.",
    lifecycle: "live",
    surfaces: ["iOS", "Android"],
    summary:
      "A two-second camera scan becomes a complete sales lead: a clean contact, a researched company dossier, a first-meeting plan and automatic follow-ups. Built for founders and sales teams who work expos, conferences, showrooms and site visits — paper card in, pipeline out.",
    stats: [
      { value: "~2 s", label: "Scan to saved lead" },
      { value: "3", label: "Card formats read" },
      { value: "100%", label: "Offline capable" },
    ],
    highlights: [
      "On-device OCR auto-captures the moment the card is sharp, so it stays fast on weak venue Wi-Fi — and a red-amber-green frame tells you when you are close.",
      "Reads paper, QR (vCard and MeCard) and NFC cards; when a paper card also carries a QR, both are merged into one contact.",
      "Deep Intel Scan researches the company and the person — industry, founders, headcount, funding stage, recent moves — and returns one dossier.",
      "AI deal strategy: openers, deal-breakers and a closing plan, plus deal fit and estimated value as exportable columns.",
      "Works fully offline; scans save locally and sync on their own once signal returns.",
    ],
    stack: ["React Native / Expo", "On-device OCR", "Gemini", "Supabase"],
    cover: "/assets/live-projects/kauntech.webp",
    coverAlt: "KaunTech feature guide cover",
    brochure: "/brochures/kauntech.pdf",
    links: [{ label: "kauntech.com", href: "https://kauntech.com" }],
  },
  {
    slug: "papyr",
    name: "Papyr",
    kicker: "Augmented reality for print",
    tagline: "Everything you print becomes a doorway.",
    lifecycle: "live",
    surfaces: ["Web studio", "WebAR viewer"],
    summary:
      "An AR studio for printed business material. Compose a live scene on every page of a brochure, menu, flyer or catalogue in a real 3D workspace, publish, print — and anyone can point a phone camera at the page and watch it come alive in the browser. No app to install, on either side.",
    stats: [
      { value: "6", label: "Element types" },
      { value: "1 page", label: "= 1 AR target" },
      { value: "2–3 min", label: "Photo → 3D model" },
      { value: "3", label: "Editions incl. free" },
    ],
    highlights: [
      "Most AR tools give you one marker and one scene. Papyr treats a printed piece as the sequence it actually is — every page carries its own image target and its own composition.",
      "Place 3D models, video, images, audio, text and tappable buttons, each with six degrees of placement plus a size multiplier, against the real page at real scale.",
      "Photograph an object and get a textured, AR-ready model back — charged before it runs and refunded automatically if it fails or is cancelled.",
      "Every upload is compressed and mesh-optimised on the way in, so the scene a customer loads on mobile data is a fraction of the file you dropped in.",
      "The editor and the published viewer share one page-relative coordinate space — no drift between what you compose and what the camera resolves.",
    ],
    stack: ["Next.js", "React Three Fiber", "8th Wall WebAR", "gltf-transform", "Supabase"],
    cover: "/assets/live-projects/papyr.webp",
    coverAlt: "Papyr AR studio brochure cover",
    brochure: "/brochures/papyr.pdf",
  },
  {
    slug: "answerline",
    name: "Answerline",
    kicker: "AI front desk",
    tagline: "One agent that answers your calls, WhatsApp, SMS and email.",
    lifecycle: "build",
    surfaces: ["Voice", "WhatsApp", "SMS", "Email", "Web dashboard"],
    summary:
      "An AI front desk for Indian businesses. It books appointments, captures leads and answers questions in the customer's language, round the clock — and escalates to a human with full context when it should. The agent is assembled from modules you switch on, not programmed: behaviour is stored as configuration, so a change at 4 pm reaches the 4:01 pm caller.",
    stats: [
      { value: "4", label: "Channels, one agent" },
      { value: "1", label: "Inbox for everything" },
      { value: "24/7", label: "Answers on ring one" },
    ],
    highlights: [
      "Four modules — FAQ, appointment booking, lead capture, human escalation — toggled per agent, with draft and live states so you test before you ship.",
      "One thread per customer across every channel: the person who called on Tuesday and messaged on Thursday is one contact with one history.",
      "WhatsApp runs on Meta's Cloud API directly with no reseller in the middle, and SMS goes through an Indian route with DLT registration handled.",
      "Speech tuned for Indian English and Hinglish rather than American accents, with low-latency Hindi and regional voices.",
      "Full transcripts, outcomes and a per-minute cost ledger in rupees — billing you can actually audit.",
    ],
    stack: ["LiveKit Agents", "Deepgram", "Cartesia", "Gemini Flash", "Next.js", "Supabase"],
    cover: "/assets/live-projects/answerline.webp",
    coverAlt: "Answerline product brochure cover",
    brochure: "/brochures/answerline.pdf",
  },
  {
    slug: "ai-hr-suite",
    name: "AI HR Suite",
    kicker: "Recruiting desk",
    tagline: "Hiring that tells you what to do next.",
    lifecycle: "shipped",
    surfaces: ["Careers page", "Recruiter console"],
    summary:
      "A complete AI-native recruiting desk, from the careers page a candidate applies on to the offer email you send. Résumés read themselves, candidates are scored against the real role with evidence attached, and every screen answers one question: who is owed an action, and what is it?",
    stats: [
      { value: "7", label: "Surfaces shipped" },
      { value: "768-dim", label: "Semantic search" },
      { value: "1", label: "Action per candidate" },
    ],
    highlights: [
      "A work queue, not a funnel: each candidate resolves to exactly one recommended action with a plain-English reason, ranked by what actually costs the business.",
      "PDFs are read natively — columns, tables and layout survive — then structured into name, title, years, skills and education, with parse failures flagged and retryable rather than silent.",
      "Fit scoring returns 0–100, a verdict, matched versus missing skills and two to four concrete pieces of evidence.",
      "Résumés upload to a private bucket, never a public URL, behind explicit consent, a honeypot and per-IP burst and daily caps.",
      "Interview scheduling with .ics, AI-drafted invites, passes and offers, and a talent bank that auto-files every CV against your open roles.",
    ],
    stack: ["Next.js", "Gemini multimodal", "pgvector", "Supabase", "Resend"],
    cover: "/assets/live-projects/ai-hr-suite.webp",
    coverAlt: "Voltair AI HR Suite brochure cover",
    brochure: "/brochures/ai-hr-suite.pdf",
  },
  {
    slug: "lead-gen",
    name: "Lead Gen",
    kicker: "Outbound pipeline",
    tagline: "A pipeline that fills itself.",
    lifecycle: "shipped",
    surfaces: ["Admin module", "MCP tools"],
    summary:
      "Describe the customer you want in plain English. Lead Gen finds real businesses that match, checks whether they can actually be reached, writes the email, sends the follow-ups, and stops the moment someone replies. Discovery, ranking and supply cost nothing — you spend only where a lead can turn into money.",
    stats: [
      { value: "42.4M", label: "MSME units reachable" },
      { value: "3.67M", label: "MCA companies" },
      { value: "10 min", label: "Cron cadence" },
      { value: "₹0", label: "Discovery + scoring" },
    ],
    highlights: [
      "One board, four states — found → verified → contacted → replied — and every screen exists to move rows to the right. No export step, no second tool.",
      "A free quick check (crawl, MX, liveness) runs on import, so paid verification is only ever offered on what came back contactable.",
      "The whole follow-up sequence is drafted at enrolment, each nudge threading on that lead's actual opener with a fresh angle.",
      "The inbox is polled before sends go out, so a reply cancels the rest of the sequence instead of triggering a fourth nudge after they said yes.",
      "The module is exposed as MCP tools with per-admin, scoped, expiring tokens — point your own agent at the book from a terminal or an editor.",
    ],
    stack: ["Next.js", "Gemini", "Supabase", "MCP", "Cron"],
    cover: "/assets/live-projects/lead-gen.webp",
    coverAlt: "Voltair Lead Gen brochure cover",
    brochure: "/brochures/lead-gen.pdf",
  },
  {
    slug: "kauntech-admin",
    name: "KaunTech Admin",
    kicker: "Operator console",
    tagline: "The control room for everything KaunTech ships.",
    lifecycle: "shipped",
    surfaces: ["Web console"],
    summary:
      "One signed-in surface that runs a marketing site, a hiring desk and a mobile app business — traffic, leads, content, candidates, subscriptions, AI cost and store performance — on live first-party data, with a three-way context switch and every panel degrading to a labelled no-signal state instead of a blank screen.",
    stats: [
      { value: "33", label: "Operator screens" },
      { value: "3", label: "Product contexts" },
      { value: "9", label: "Live data sources" },
      { value: "24", label: "Server endpoints" },
    ],
    highlights: [
      "Replaces a CMS, a spreadsheet, an ATS, an analytics tab and a billing dashboard with one console that answers “what needs me right now?” before it shows a chart.",
      "Publishing a post updates the page, the search index and the chatbot's RAG store together — the support surface can't drift out of date with the marketing one.",
      "Token economics measured live from the ledger: what each AI feature costs versus what it charges, on a gross-margin dial in rupees.",
      "Real device telemetry with true day-N retention cohorts, plus Play and App Store installs, ratings, crashes and version spread.",
      "Server-rendered instruments with zero client-side secrets, and a per-source liveness rail where a dead feed says so.",
    ],
    stack: ["Next.js 15", "React 19", "TypeScript", "GA4 + Search Console", "Supabase"],
    cover: "/assets/live-projects/kauntech-admin.webp",
    coverAlt: "KaunTech Admin control panel brochure cover",
    brochure: "/brochures/kauntech-admin.pdf",
  },
  {
    slug: "drone-ops",
    name: "Drone Ops",
    kicker: "Flight-weather intelligence",
    tagline: "Know before you launch.",
    lifecycle: "build",
    surfaces: ["iOS", "Android"],
    summary:
      "Fifteen live readings, a flyability verdict that always names the profile behind it, and every number traceable to the source that published it. Built for Indian pilots — DGCA ceilings, Indian hosting, Indian conditions — on one screen that never scrolls.",
    stats: [
      { value: "15", label: "Live readings" },
      { value: "4", label: "Threshold profiles" },
      { value: "4", label: "Wind altitudes" },
      { value: "7 days", label: "Forecast horizon" },
    ],
    highlights: [
      "“Not good to fly” never appears alone — it appears over the active profile's name and the exact readings outside its limits, passing checks included.",
      "Wind aloft at 10 m, 80 m, 120 m and 180 m: a calm surface reading can sit under a 40 km/h gradient at the legal ceiling, and no consumer weather app ships that view.",
      "A tile colours only when the profile has a limit for that reading and the reading is outside it — untinted means “not checked”, never “checked and fine”.",
      "Readings the model publishes only for now get no sparkline and no chart. A drawn trend the model never published is fiction that looks identical to the real thing.",
      "Unavailable is printed as unavailable. The app never guesses a number.",
    ],
    stack: ["React Native / Expo", "Skia", "Open-Meteo", "NOAA SWPC", "ap-south-1"],
    cover: "/assets/live-projects/drone-ops.webp",
    coverAlt: "Drone Ops feature brochure cover",
    brochure: "/brochures/drone-ops.pdf",
  },
  {
    slug: "nfc-vcard",
    name: "NFC vCard",
    kicker: "Digital business card",
    tagline: "Tap. Save. Done.",
    lifecycle: "live",
    surfaces: ["Web dashboard", "NFC tag", "QR"],
    summary:
      "Build a virtual card in a browser, write one permanent link onto any blank NFC tag, and let a single tap hand over your contact details — no app on your phone, and none on theirs. Change jobs, number, photo or template and the printed tag keeps working.",
    stats: [
      { value: "12", label: "Card templates" },
      { value: "0", label: "Apps to install" },
      { value: "1", label: "Permanent tap link" },
      { value: "∞", label: "Edits after printing" },
    ],
    highlights: [
      "Save Contact downloads a real vCard 3.0 .vcf — correct line endings and folding, served as a genuine download, so strict parsers don't reject it.",
      "The card never scrolls: every size is calculated from the height of the phone it lands on, so nobody hunts below the fold for your number.",
      "The tag stores a short permanent link, never your details — so a tag can even be reassigned to a different person without reprinting anything.",
      "Public cards are served pre-rendered from the edge, so a stranger's tap never waits on a database waking up.",
      "Twelve palettes, contrast-checked in light and dark, with six built for a trade — blueprint, terracotta, meridian, clinic, copper, vault.",
    ],
    stack: ["Next.js", "Drizzle", "Supabase", "Edge rendering", "vCard 3.0"],
    cover: "/assets/live-projects/nfc-vcard.webp",
    coverAlt: "NFC vCard feature overview cover",
    brochure: "/brochures/nfc-vcard.pdf",
    links: [{ label: "kauntech.in/services/vcard", href: "https://kauntech.in/services/vcard" }],
  },
  {
    slug: "sendzap",
    name: "SendZap",
    kicker: "Utility app",
    tagline: "Message anyone on WhatsApp — without saving their number.",
    lifecycle: "live",
    surfaces: ["Android", "iOS"],
    summary:
      "Type a number, pick a saved template, tap send. SendZap opens the WhatsApp chat instantly and keeps your contact list clean. No account, no login, no server — numbers, messages and templates never leave the device.",
    stats: [
      { value: "62", label: "Country codes" },
      { value: "6", label: "Message templates" },
      { value: "0", label: "Data collected" },
      { value: "₹0", label: "Forever free" },
    ],
    highlights: [
      "No sign-up, no SendZap server, no contact permission and no chat access — privacy you can verify rather than take on trust.",
      "A native whatsapp:// deep link opens the chat without internet, with an automatic wa.me fallback and a clear message if WhatsApp isn't installed.",
      "Six reusable template slots: tap to select, press and hold to edit, delete behind a confirm prompt.",
      "Under ten seconds from opening the app to a sent message, on one screen with no menus to hunt through.",
      "Android and iOS from the same codebase, with a Google UMP consent flow that runs before any ad loads.",
    ],
    stack: ["React Native / Expo", "On-device storage", "Google UMP"],
    cover: "/assets/live-projects/sendzap.webp",
    coverAlt: "SendZap product brochure cover",
    brochure: "/brochures/sendzap.pdf",
    links: [{ label: "Privacy policy", href: "/sendzap/privacy" }],
  },
];
/** Widen a seed entry into the full row shape the page renders. */
function toLiveProject(s: SeedProject, i: number): LiveProject {
  const now = new Date(0).toISOString();
  return {
    id: s.slug,
    slug: s.slug,
    name: s.name,
    kicker: s.kicker,
    tagline: s.tagline,
    summary: s.summary,
    lifecycle: s.lifecycle,
    surfaces: s.surfaces,
    stack: s.stack,
    highlights: s.highlights,
    stats: s.stats,
    links: s.links ?? [],
    media: [],
    cover_image: { url: s.cover, alt: s.coverAlt },
    brochure: { url: s.brochure, label: `${s.name} brochure` },
    tags: [],
    seo: {},
    position: i + 1,
    status: "published",
    published_at: now,
    created_at: now,
    updated_at: now,
  };
}

export const FALLBACK_PROJECTS: LiveProject[] = SEED.map(toLiveProject);
