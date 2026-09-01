/**
 * Public contact-form endpoint consumed by components/LeadForm.tsx.
 *
 * POST /api/contact
 *   { name, email, message, company?, phone?, channel?, page_url?, website?,
 *     services?: [{ slug, title, custom? }], context?: { kind, industry_*, service_* } }
 *   -> 200 { ok: true }
 *
 * `services` and `context` are what the visitor ticked and which page they were
 * on. They're advisory sales context, not validation input: anything malformed
 * is dropped rather than 400'd, so a picker change can never break the form.
 *
 * Submissions land in the `contact_submissions` table via the server-side
 * service-role client (RLS-protected; the browser never touches Supabase).
 * `website` is a honeypot — real users never see it, so a filled value is a bot
 * and we accept-and-drop (return 200 without storing) to avoid tipping it off.
 */
import { NextResponse } from "next/server";

import { insertContactSubmission } from "@/lib/contact";
import {
  LIMITS,
  SUPPORT_EMAIL,
  getClientIp,
  istDay,
  retryAfterSeconds,
  rlHit,
} from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mirrors MAX_SELECTED_SERVICES in lib/lead-form.ts. */
const MAX_SERVICES = 20;
const MAX_LABEL = 200;

const CONTEXT_KINDS = new Set(["general", "service", "industry", "industry-service"]);

interface SelectedService {
  slug: string;
  title: string;
  custom: boolean;
}

/** Ticked picker entries, trimmed, deduped by slug, and capped. */
function parseServices(raw: unknown): SelectedService[] {
  if (!Array.isArray(raw)) return [];
  const out: SelectedService[] = [];
  const seen = new Set<string>();
  for (const item of raw.slice(0, MAX_SERVICES)) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const title = str(rec.title).slice(0, MAX_LABEL);
    const slug = str(rec.slug).slice(0, MAX_LABEL);
    if (!title) continue;
    const key = `${rec.custom ? "custom" : "service"}:${slug || title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ slug, title, custom: rec.custom === true });
  }
  return out;
}

/** Where the form was submitted from, as the site describes itself. */
function parseContext(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const rec = raw as Record<string, unknown>;
  const out: Record<string, string> = {};
  const kind = str(rec.kind);
  if (CONTEXT_KINDS.has(kind) && kind !== "general") out.source = kind;
  for (const key of [
    "industry_slug",
    "industry_title",
    "service_slug",
    "service_title",
  ] as const) {
    const v = str(rec[key]).slice(0, MAX_LABEL);
    if (v) out[key] = v;
  }
  return out;
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body." }, { status: 400 });
  }

  // Honeypot: silently accept bots without storing.
  if (str(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const name = str(body.name);
  const company = str(body.company);
  const phone = str(body.phone);
  const email = str(body.email);
  const message = str(body.message);
  // Reply channel drives which contact field is required. Default to WhatsApp.
  const channel = str(body.channel) === "email" ? "email" : "whatsapp";
  const pageUrl = str(body.page_url) || null;
  const services = parseServices(body.services);
  const context = parseContext(body.context);

  if (!name || name.length > 200) {
    return NextResponse.json(
      { detail: "name is required (1 to 200 characters)." },
      { status: 400 },
    );
  }
  if (channel === "whatsapp") {
    if (!phone || phone.length > 50) {
      return NextResponse.json(
        { detail: "A valid WhatsApp number is required." },
        { status: 400 },
      );
    }
    // Email is optional on WhatsApp; validate only if provided.
    if (email && (email.length > 320 || !EMAIL_RE.test(email))) {
      return NextResponse.json(
        { detail: "Please provide a valid email or leave it blank." },
        { status: 400 },
      );
    }
  } else {
    if (!email || email.length > 320 || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { detail: "A valid email is required." },
        { status: 400 },
      );
    }
    if (phone.length > 50) {
      return NextResponse.json({ detail: "phone too long." }, { status: 400 });
    }
  }
  if (!message || message.length > 5000) {
    return NextResponse.json(
      { detail: "message is required (1 to 5000 characters)." },
      { status: 400 },
    );
  }
  if (company.length > 200) {
    return NextResponse.json(
      { detail: "company too long." },
      { status: 400 },
    );
  }

  // Both windows are per-IP and only valid submissions count, so they're checked
  // together once the body is known good. Two things fall out of that ordering:
  // a bot or a malformed post is now rejected without touching the database at
  // all, and the two limiter round trips overlap instead of running back to
  // back — the submit path was three sequential Supabase hops, and is now two.
  // A burst-denied request still consumes a daily slot; that only ever penalises
  // an IP that is already flooding us.
  const ip = getClientIp(req);
  const [burst, daily] = await Promise.all([
    rlHit(
      `contact:burst:${ip}`,
      LIMITS.contactBurst.limit,
      LIMITS.contactBurst.windowSeconds,
    ),
    rlHit(
      `contact:day:${istDay()}:${ip}`,
      LIMITS.contactDaily.limit,
      LIMITS.contactDaily.windowSeconds,
    ),
  ]);

  if (!burst.allowed) {
    return NextResponse.json(
      {
        detail:
          "You're submitting too quickly. Please wait a moment and try again.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds(burst.resetAt)) },
      },
    );
  }
  if (!daily.allowed) {
    return NextResponse.json(
      {
        detail: `You've sent several messages today. Please email ${SUPPORT_EMAIL} directly, or try again tomorrow.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds(daily.resetAt)) },
      },
    );
  }

  try {
    await insertContactSubmission({
      name,
      company: company || null,
      phone: phone || null,
      email,
      message,
      page_url: pageUrl,
      user_agent: req.headers.get("user-agent"),
      metadata: {
        reply_channel: channel,
        ...context,
        ...(services.length
          ? {
              // Titles are what the admin panel and the notification email
              // read; the slugs sit alongside so a rename never orphans them.
              services: services.map((s) => s.title),
              service_refs: services.map((s) => ({
                slug: s.slug,
                custom: s.custom,
              })),
            }
          : {}),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] insert failed", err);
    return NextResponse.json(
      { detail: `Could not submit. Please email ${SUPPORT_EMAIL}.` },
      { status: 500 },
    );
  }
}
