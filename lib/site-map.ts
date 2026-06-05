/**
 * Client-safe site map for the chat widget.
 *
 * Two jobs:
 *  1. `detectPages()` turns free text (the user's question + the bot's reply)
 *     into a short list of REAL pages to surface as navigation buttons. It only
 *     ever returns paths that exist here — the bot can't send people to a route
 *     that doesn't exist.
 *  2. `pageContext()` derives a page-aware greeting, quick-question presets and a
 *     proactive "peek" line from the current path + document title, so the
 *     assistant can offer help about whatever the visitor is currently reading.
 *
 * Pure data + string ops only — no server imports, safe in a client component.
 */

export interface SitePage {
  href: string;
  /** Label shown on the in-chat navigation button. */
  label: string;
  /** Lowercase words/phrases that imply this page is relevant. */
  keywords: string[];
}

export const SITE_PAGES: SitePage[] = [
  {
    href: "/services",
    label: "See services",
    keywords: [
      "services",
      "service",
      "what you build",
      "what do you build",
      "what can you build",
      "capabilities",
      "offerings",
      "build a website",
      "build an app",
      "web development",
      "app development",
    ],
  },
  {
    href: "/industries",
    label: "Browse industries",
    keywords: [
      "industries",
      "industry",
      "sector",
      "sectors",
      "vertical",
      "fintech",
      "healthcare",
      "ecommerce",
      "e-commerce",
      "d2c",
      "real estate",
      "education",
      "logistics",
    ],
  },
  {
    href: "/blog",
    label: "Read the blog",
    keywords: [
      "blog",
      "article",
      "articles",
      "post",
      "posts",
      "case study",
      "case studies",
      "insights",
      "read more",
    ],
  },
  {
    href: "/faq",
    label: "Open the FAQ",
    keywords: ["faq", "faqs", "frequently asked", "common questions"],
  },
  {
    href: "/about",
    label: "About Voltair",
    keywords: [
      "about you",
      "about voltair",
      "who are you",
      "who is behind",
      "your team",
      "your story",
      "where are you based",
      "located",
      "mumbai office",
    ],
  },
  {
    href: "/contact",
    label: "Contact us",
    keywords: [
      "contact",
      "contact us",
      "connect",
      "connect with",
      "connect with you",
      "connect with your team",
      "connect with the team",
      "get in touch",
      "in touch",
      "reach you",
      "reach out",
      "reach the team",
      "talk to",
      "talk to you",
      "talk to your team",
      "talk to someone",
      "speak to",
      "speak with",
      "your team",
      "the team",
      "meet the team",
      "work together",
      "work with you",
      "collaborate",
      "partner with",
      "let's talk",
      "lets talk",
      "book a call",
      "scoping call",
      "start a project",
      "get started",
      "hire you",
      "get a quote",
      "quote",
      "pricing",
      "cost",
      "how much",
      "demo",
      "schedule a call",
      "email you",
    ],
  },
  {
    href: "/privacy",
    label: "Privacy policy",
    keywords: ["privacy policy", "privacy"],
  },
  {
    href: "/terms",
    label: "Terms of service",
    keywords: ["terms of service", "terms"],
  },
];

/** Word-boundary-ish match so "service" doesn't fire inside "disservice". */
function hit(haystack: string, needle: string): boolean {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(haystack);
}

/**
 * Pick the pages most relevant to `text`, ranked by how many keywords match.
 * `exclude` drops the page the visitor is already on; `limit` caps the buttons.
 */
export function detectPages(
  text: string,
  opts: { exclude?: string; limit?: number } = {},
): SitePage[] {
  const hay = ` ${text.toLowerCase()} `;
  return SITE_PAGES.filter((p) => p.href !== opts.exclude)
    .map((p) => ({
      page: p,
      score: p.keywords.reduce((n, k) => (hit(hay, k) ? n + 1 : n), 0),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.limit ?? 2)
    .map((s) => s.page);
}

export interface PageContext {
  /** Human topic for the current page, or null on home/unknown. */
  topic: string | null;
  /** First bot bubble — may contain Markdown. */
  greeting: string;
  /** Quick-question chips tuned to the page. */
  presets: string[];
  /** Proactive reach-out line, or null where a peek isn't useful. */
  peek: string | null;
  /** How long to dwell before peeking, in ms. */
  peekDelayMs: number;
}

const DEFAULT_GREETING =
  "Hi! I'm the **Voltair AI Specialist**. Ask me about what we build — AI sites in 48 hours, RAG, chatbots, automation or pricing. Pick one below or type a question.";

const HOME_PRESETS = [
  "What can you build in 48 hours?",
  "How does a RAG system work?",
  "What does a WhatsApp chatbot cost?",
  "What's your tech stack?",
];

/** Strip the "| Voltair Tech" template + any "— Voltair Tech" fallback suffix. */
function cleanTitle(raw: string): string {
  if (!raw) return "";
  let t = raw.split("|")[0];
  t = t.replace(/\s*[—–-]\s*Voltair Tech.*$/i, "");
  return t.trim();
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

/** Page-aware copy for the current route + document title. */
export function pageContext(pathname: string, rawTitle: string): PageContext {
  const p = (pathname || "/").replace(/\/+$/, "") || "/";
  const title = cleanTitle(rawTitle);

  // --- Dynamic detail pages (topic comes from the page title) --------------
  if (p.startsWith("/blog/")) {
    const t = title || "this article";
    return {
      topic: t,
      greeting: `I see you're reading **${t}**. Want the gist, or have a question about building something like it?`,
      presets: [
        `Give me the gist of "${t}"`,
        "Can Voltair build something like this?",
        "What would a project like this cost?",
      ],
      peek: `Enjoying "${truncate(t, 40)}"? I can summarise it or answer questions.`,
      peekDelayMs: 16000,
    };
  }
  if (p.startsWith("/services/")) {
    const t = title || "this service";
    return {
      topic: t,
      greeting: `Looking at **${t}**? Ask me what's included, how fast we ship it, or what it costs.`,
      presets: [
        `What's included in ${t}?`,
        `How fast can you ship ${t}?`,
        `What does ${t} cost?`,
      ],
      peek: `Questions about ${truncate(t, 40)}? I can break it down.`,
      peekDelayMs: 16000,
    };
  }
  if (p.startsWith("/industries/")) {
    const t = title || "this industry";
    const name = t.replace(/^AI for\s+/i, "");
    return {
      topic: t,
      greeting: `Exploring **${t}**? I can show what Voltair builds for ${name} teams.`,
      presets: [
        `How does Voltair help ${name} teams?`,
        `Which services fit ${name}?`,
        `What would you build for ${name}?`,
      ],
      peek: `Building for ${truncate(name, 34)}? I can suggest where to start.`,
      peekDelayMs: 16000,
    };
  }

  // --- Section pages -------------------------------------------------------
  switch (p) {
    case "/services":
      return {
        topic: "our services",
        greeting:
          "Browsing what we build? Tell me your idea and I'll match it to the right service.",
        presets: [
          "What can you build in 48 hours?",
          "How does pricing work?",
          "Which service fits my idea?",
        ],
        peek: "Want help picking the right service? Just ask.",
        peekDelayMs: 24000,
      };
    case "/industries":
      return {
        topic: "the sectors we serve",
        greeting:
          "Looking for your sector? Tell me your industry and I'll show what we build for it.",
        presets: [
          "Which sectors do you build for?",
          "Do you work with fintech?",
          "What can you build for my industry?",
        ],
        peek: "Want to see what we build for your sector? Ask away.",
        peekDelayMs: 24000,
      };
    case "/blog":
      return {
        topic: "the Voltair blog",
        greeting:
          "Looking for something to read? Tell me a topic and I'll point you to the right post.",
        presets: [
          "What should I read first?",
          "Got anything on RAG?",
          "How does Voltair build AI apps?",
        ],
        peek: "Looking for a specific topic? I can find the right post.",
        peekDelayMs: 26000,
      };
    case "/faq":
      return {
        topic: "our FAQs",
        greeting: "Can't find your answer below? Ask me directly.",
        presets: [
          "How much does an AI app cost?",
          "How does the 48-hour build work?",
          "What's your tech stack?",
        ],
        peek: "Didn't find your answer below? Ask me directly.",
        peekDelayMs: 22000,
      };
    case "/about":
      return {
        topic: "Voltair Tech",
        greeting:
          "Curious about Voltair? Ask about the team, the process, or how we ship so fast.",
        presets: [
          "Who's behind Voltair?",
          "How do you ship in 48 hours?",
          "Where are you based?",
        ],
        peek: "Want the story behind Voltair? Ask me anything.",
        peekDelayMs: 24000,
      };
    case "/contact":
      return {
        topic: "starting a project",
        greeting:
          "Ready to start? I can tell you exactly what to expect from a scoping call.",
        presets: [
          "What happens on a scoping call?",
          "What do you need from me to start?",
          "How fast can we begin?",
        ],
        peek: "Ready to start? I can walk you through the first step.",
        peekDelayMs: 22000,
      };
    case "/privacy":
    case "/terms":
      return {
        topic: "our policies",
        greeting:
          "Questions about how we handle data, or about our terms? Ask away.",
        presets: [
          "How do you handle my data?",
          "Where is my data stored?",
          "Do you sign NDAs?",
        ],
        peek: "Questions about data or our terms? I can help.",
        peekDelayMs: 28000,
      };
    case "/":
      return {
        topic: null,
        greeting: DEFAULT_GREETING,
        presets: HOME_PRESETS,
        peek: "New here? I can show you what Voltair ships in 48 hours.",
        peekDelayMs: 34000,
      };
    default:
      return {
        topic: title || null,
        greeting: DEFAULT_GREETING,
        presets: HOME_PRESETS,
        peek: null,
        peekDelayMs: 30000,
      };
  }
}

export interface NavLink {
  href: string;
  label: string;
}

/** A document the assistant cited — shape mirrors the server's SourceDoc. */
export interface SourceRef {
  doc_type: string;
  title: string | null;
  external_id: string | null;
  similarity: number;
}

const SOURCE_BASE: Record<string, { base: string; verb: string }> = {
  blog: { base: "/blog", verb: "Read" },
  service: { base: "/services", verb: "Explore" },
  industry: { base: "/industries", verb: "See" },
};

/**
 * Turn the documents an answer actually used into precise deep-link buttons —
 * e.g. a cited blog post becomes "Read: {title}" → /blog/{slug}. Only confident,
 * non-current pages, capped to keep the reply tidy.
 */
export function sourceLinks(
  sources: SourceRef[],
  currentPath: string,
  limit = 2,
): NavLink[] {
  const out: NavLink[] = [];
  const seen = new Set<string>();
  for (const s of sources) {
    const map = SOURCE_BASE[s.doc_type];
    if (!map || !s.external_id) continue;
    if ((s.similarity ?? 0) < 0.45) continue;
    const href = `${map.base}/${s.external_id}`;
    if (href === currentPath || seen.has(href)) continue;
    seen.add(href);
    out.push({ href, label: `${map.verb}: ${truncate(s.title || map.base, 26)}` });
    if (out.length >= limit) break;
  }
  return out;
}

/** Topic-keyed next questions — drives the "keep exploring" chips, zero LLM cost. */
const FOLLOWUP_RULES: { test: RegExp; qs: string[] }[] = [
  {
    test: /\b(price|pricing|cost|costs|quote|budget|rupees?|₹)\b/i,
    qs: ["What's included in the price?", "How do you decide a fixed quote?", "Can we start with a smaller scope?"],
  },
  {
    test: /\b(48[\s-]?hour|two days|timeline|how long|deliver|turnaround|weeks?)\b/i,
    qs: ["What can you really ship in 48 hours?", "What happens after launch?", "How do revisions work?"],
  },
  {
    test: /\brag\b|retrieval|knowledge base|hallucinat/i,
    qs: ["How do you stop it hallucinating?", "Can it use our private docs?", "What does a RAG build cost?"],
  },
  {
    test: /whatsapp|\bvoice\b|chatbot|\bbot\b/i,
    qs: ["Can it handle payments?", "Can it answer in Hindi & Marathi?", "How fast can a chatbot launch?"],
  },
  {
    test: /automat|workflow|\bn8n\b|integrat/i,
    qs: ["What could you automate for us?", "Do you connect to our tools?", "What does automation cost?"],
  },
  {
    test: /complian|privacy|data protection|\bsecurity\b/i,
    qs: ["Where is our data stored?", "Do you sign a DPA?", "How do you secure the build?"],
  },
  {
    test: /\bstack\b|\btech\b|next\.?js|supabase|framework|own the code/i,
    qs: ["Do you work with our existing stack?", "Who owns the code and IP?", "Do you offer ongoing support?"],
  },
  {
    test: /website|web app|landing|\bsite\b/i,
    qs: ["What goes into an AI website?", "How fast can it go live?", "Do you handle SEO?"],
  },
];

/**
 * Suggest up to `limit` tailored next questions from the turn, topping up from
 * the page's presets. Deterministic — costs no extra tokens.
 */
export function suggestFollowups(
  userMsg: string,
  botReply: string,
  pc: PageContext,
  limit = 3,
): string[] {
  const hay = `${userMsg} ${botReply}`;
  const asked = userMsg.trim().toLowerCase();
  const out: string[] = [];
  const add = (q: string) => {
    const k = q.toLowerCase();
    if (k !== asked && !out.some((o) => o.toLowerCase() === k)) out.push(q);
  };
  for (const r of FOLLOWUP_RULES) {
    if (out.length >= limit) break;
    if (r.test.test(hay)) r.qs.forEach(add);
  }
  for (const p of pc.presets) {
    if (out.length >= limit) break;
    add(p);
  }
  return out.slice(0, limit);
}

const GET_STARTED =
  /\b(get started|getting started|start (a|my) project|begin a project|work with you|work together|hire you|book a (call|demo)|schedule a (call|demo)|let'?s (do|build|start|talk)|ready to (start|begin|build|go)|sign up|onboard|kick ?off|connect with (you|your team|the team)|talk to (your team|the team|someone)|get in touch)\b/i;

/** Strong buying intent → worth offering an inline lead form. */
export function isGetStarted(text: string): boolean {
  return GET_STARTED.test(text);
}

/**
 * Any "I want to reach the team" signal — connect, contact, quote, book a call,
 * start a project. Used to guarantee a one-tap /contact button under the reply,
 * even when cited-source deep-links would otherwise fill every button slot.
 */
const CONTACT_INTENT =
  /\b(contact|connect|connect with (you|your team|the team)|get in touch|in touch|reach (you|out|the team)|talk to (you|your team|the team|someone)|speak (to|with)|your team|the team|work (with you|together)|collaborate|partner with|book a (call|demo)|scoping call|hire you|get a quote|let'?s talk)\b/i;

export function isContactIntent(text: string): boolean {
  return CONTACT_INTENT.test(text);
}
