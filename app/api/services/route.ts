/**
 * Admin-gated services endpoint — the admin-panel / n8n target. Writes a row to
 * `services` AND (when published) embeds it into the RAG store (doc_type
 * "service") so the chatbot cites it. Mirrors /api/blog.
 *
 * Auth: header  X-Admin-Key: <ADMIN_API_KEY>
 *
 * POST /api/services
 *   Body: a single service object, or { "services": [ ... ] } for a batch.
 *   Each: { slug, title (required), summary?, bullets?: string[], eta?, icon?,
 *           lead?, meta?, body_md?, price?, tags?: string[], seo?, position?,
 *           cover_image?: { url, alt }, faq?: { q, a }[],
 *           media?: [ { type:"image"|"video"|"embed", url, alt?, caption?, poster?, provider? } ],
 *           status?: "draft"|"published"|"archived", published_at? }
 *   `icon` may be a glyph key, or "" / "auto" to derive it from title/tags.
 *   -> 200 { ok, count, services: [{ slug, status, url }] }
 *
 * GET  /api/services            -> { total, published, draft, archived }
 * DELETE /api/services?slug=... -> removes the service + its RAG document
 */
import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin-auth";
import { markdownToPlainText, slugify } from "@/lib/blog/util";
import { faqToPlainText, normalizeFaq } from "@/lib/faq/normalize";
import { normalizeMedia } from "@/lib/media";
import { getServicePosition, nextServicePosition, upsertService } from "@/lib/services/db";
import { resolveServiceIcon } from "@/lib/services/icons";
import type { Service, ServiceCover, ServiceUpsert } from "@/lib/services/types";
import { deleteDocument } from "@/lib/rag/db";
import { ingest } from "@/lib/rag/ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = "https://www.voltairtech.com";
const VALID_STATUS = new Set(["draft", "published", "archived"]);

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean) : [];
}

/** Accept a { url, alt? } object (or null) for the cover image. */
function cover(v: unknown): ServiceCover | null {
  if (typeof v !== "object" || v === null) return null;
  const url = str((v as Record<string, unknown>).url);
  if (!url) return null;
  const alt = str((v as Record<string, unknown>).alt);
  return alt ? { url, alt } : { url };
}

function normalize(input: unknown): { row: ServiceUpsert } | { error: string } {
  if (typeof input !== "object" || input === null) {
    return { error: "Each service must be an object." };
  }
  const p = input as Record<string, unknown>;

  const title = str(p.title);
  if (!title) return { error: "title is required." };

  const slug = slugify(str(p.slug) || title);
  if (!slug) return { error: `Could not derive a slug for "${title}".` };

  const status = str(p.status) || "published";
  if (!VALID_STATUS.has(status)) return { error: `Invalid status "${status}".` };

  const tags = strArray(p.tags);
  const icon = resolveServiceIcon(typeof p.icon === "string" ? p.icon : null, title, tags);

  const seo =
    typeof p.seo === "object" && p.seo !== null ? (p.seo as ServiceUpsert["seo"]) : {};

  // Position is optional: when omitted, the POST handler places the service
  // (new ones append to the end, existing ones keep their slot) so nothing
  // collides at 0 and jumps to the top of the grid.
  const position =
    typeof p.position === "number" && Number.isFinite(p.position)
      ? Math.round(p.position)
      : undefined;

  const publishedAt = str(p.published_at);
  const published_at =
    status === "published"
      ? publishedAt || new Date().toISOString()
      : publishedAt || null;

  return {
    row: {
      slug,
      title,
      headline: str(p.headline) || null,
      summary: str(p.summary) || null,
      bullets: strArray(p.bullets),
      eta: str(p.eta) || null,
      icon,
      cover_image: cover(p.cover_image),
      media: normalizeMedia(p.media),
      lead: str(p.lead) || null,
      meta: str(p.meta) || null,
      body_md: typeof p.body_md === "string" ? p.body_md : "",
      price: str(p.price) || null,
      tags,
      seo: seo ?? {},
      faq: normalizeFaq(p.faq),
      position,
      status: status as ServiceUpsert["status"],
      published_at,
    },
  };
}

/** Mirror a stored service into the RAG store (or remove it if not published). */
async function syncRag(svc: Service): Promise<void> {
  if (svc.status !== "published") {
    await deleteDocument("service", svc.slug);
    return;
  }
  const url = `${SITE_URL}/services/${svc.slug}`;
  // The `price` column is NOT embedded. The chatbot must not quote a figure
  // (it scopes on a call instead), and the pages don't show one either — the
  // column survives only as schema.org Offer data for Google.
  const pricingLine = svc.eta ? `Typical delivery: ${svc.eta}. Fixed price, agreed on a call before work starts.` : "";
  const parts = [
    svc.title,
    svc.summary ?? "",
    svc.lead ?? "",
    svc.bullets.join(". "),
    pricingLine,
    markdownToPlainText(svc.body_md),
    faqToPlainText(svc.faq),
  ].filter(Boolean);
  await ingest([
    {
      doc_type: "service",
      external_id: svc.slug,
      title: svc.title,
      content: parts.join("\n\n"),
      metadata: {
        slug: svc.slug,
        url,
        eta: svc.eta,
        price: svc.price,
        tags: svc.tags,
        icon: svc.icon,
      },
    },
  ]);
}

export async function POST(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ detail: "Invalid or missing X-Admin-Key." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body." }, { status: 400 });
  }

  const raw =
    body && typeof body === "object" && Array.isArray((body as Record<string, unknown>).services)
      ? ((body as Record<string, unknown>).services as unknown[])
      : [body];

  if (!raw.length) {
    return NextResponse.json({ detail: "No services provided." }, { status: 400 });
  }

  const results: { slug: string; status: string; url: string }[] = [];
  try {
    for (const item of raw) {
      const parsed = normalize(item);
      if ("error" in parsed) {
        return NextResponse.json({ detail: parsed.error }, { status: 400 });
      }
      const row = parsed.row;
      // No explicit position → keep an existing service's slot, or append a new
      // one to the end so it never collides at 0 and leapfrogs the grid.
      if (row.position === undefined) {
        const existing = await getServicePosition(row.slug);
        row.position = existing ?? (await nextServicePosition());
      }
      const stored = await upsertService(row);
      await syncRag(stored);
      results.push({
        slug: stored.slug,
        status: stored.status,
        url: `${SITE_URL}/services/${stored.slug}`,
      });
    }
  } catch (err) {
    console.error("[services] upsert failed", err);
    return NextResponse.json({ detail: "Could not save the service." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: results.length, services: results });
}

export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ detail: "Invalid or missing X-Admin-Key." }, { status: 401 });
  }
  try {
    const { getSupabase } = await import("@/lib/rag/supabase");
    const { data, error } = await getSupabase().from("services").select("status");
    if (error) throw error;
    const rows = (data ?? []) as { status: string }[];
    return NextResponse.json({
      total: rows.length,
      published: rows.filter((r) => r.status === "published").length,
      draft: rows.filter((r) => r.status === "draft").length,
      archived: rows.filter((r) => r.status === "archived").length,
    });
  } catch (err) {
    console.error("[services] count failed", err);
    return NextResponse.json({ detail: "Count failed." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ detail: "Invalid or missing X-Admin-Key." }, { status: 401 });
  }
  const slug = slugify(new URL(req.url).searchParams.get("slug") ?? "");
  if (!slug) {
    return NextResponse.json({ detail: "Provide ?slug=<slug> to delete." }, { status: 400 });
  }
  try {
    const { getSupabase } = await import("@/lib/rag/supabase");
    const { error } = await getSupabase().from("services").delete().eq("slug", slug);
    if (error) throw error;
    await deleteDocument("service", slug);
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    console.error("[services] delete failed", err);
    return NextResponse.json({ detail: "Delete failed." }, { status: 500 });
  }
}
