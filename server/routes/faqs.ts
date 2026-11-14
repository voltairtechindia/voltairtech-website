/**
 * Admin-gated /faq endpoint — the admin-panel / n8n target. Writes a row to
 * `site_faqs` AND (when published) embeds it into the RAG store (doc_type
 * "site_faq") so the chatbot cites it. Mirrors /api/services.
 *
 * These are the standalone questions on voltairtech.com/faq — the ones that
 * belong to the business rather than to one service or article. Per-page FAQs
 * ride along on their own record instead (blog_posts.faq, services.faq,
 * industries.faq).
 *
 * NB the doc_type is "site_faq", not "faq": the latter is owned by the
 * hardcoded core knowledge base (lib/rag/data/knowledge-base.ts) and
 * `npm run kb:check` treats every "faq" document as drift from that file.
 *
 * Auth: header  X-Admin-Key: <ADMIN_API_KEY>
 *
 * POST /api/faqs
 *   Body: a single question object, or { "faqs": [ ... ] } for a batch.
 *   Each: { question (required), answer (required), slug?, category?,
 *           tags?: string[], position?, homepage_featured?,
 *           status?: "draft"|"published"|"archived", published_at? }
 *   -> 200 { ok, count, faqs: [{ slug, status, url }] }
 *
 * GET  /api/faqs            -> { total, published, draft, archived }
 * DELETE /api/faqs?slug=... -> removes the question + its RAG document
 */
import { NextResponse } from "@/server/shims/next-server";

import { isAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/blog/util";
import {
  getSiteFaqPosition,
  nextSiteFaqPosition,
  upsertSiteFaq,
} from "@/lib/faq/db";
import type { SiteFaq, SiteFaqUpsert } from "@/lib/faq/types";
import { deleteDocument } from "@/lib/rag/db";
import { ingest } from "@/lib/rag/ingest";


const SITE_URL = "https://www.voltairtech.com";
const VALID_STATUS = new Set(["draft", "published", "archived"]);

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function strArray(v: unknown): string[] {
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean)
    : [];
}

function bool(v: unknown): boolean {
  return v === true || v === "true" || v === "on";
}

function normalize(input: unknown): { row: SiteFaqUpsert } | { error: string } {
  if (typeof input !== "object" || input === null) {
    return { error: "Each FAQ must be an object." };
  }
  const p = input as Record<string, unknown>;

  const question = str(p.question) || str(p.q);
  if (!question) return { error: "question is required." };
  const answer = str(p.answer) || str(p.a);
  if (!answer) return { error: `answer is required (for "${question}").` };

  // Questions run long, and a 12-word slug is no more useful than a 6-word one.
  const slug = slugify(str(p.slug) || question).split("-").slice(0, 10).join("-");
  if (!slug) return { error: `Could not derive a slug for "${question}".` };

  const status = str(p.status) || "published";
  if (!VALID_STATUS.has(status)) return { error: `Invalid status "${status}".` };

  const position =
    typeof p.position === "number" && Number.isFinite(p.position)
      ? Math.round(p.position)
      : undefined;

  const publishedAt = str(p.published_at);
  const published_at =
    status === "published"
      ? publishedAt || new Date().toISOString()
      : publishedAt || null;

  const row: SiteFaqUpsert = {
    slug,
    question,
    answer,
    category: str(p.category) || null,
    tags: strArray(p.tags),
    position,
    status: status as SiteFaqUpsert["status"],
    published_at,
  };

  // Only set the flag when the caller actually sends it, so an external caller
  // that omits it doesn't silently pull a question off the home page.
  if (p.homepage_featured !== undefined) {
    row.homepage_featured = bool(p.homepage_featured);
  }

  return { row };
}

/** Mirror a stored question into the RAG store (or remove it if not published). */
async function syncRag(faq: SiteFaq): Promise<void> {
  if (faq.status !== "published") {
    await deleteDocument("site_faq", faq.slug);
    return;
  }
  await ingest([
    {
      doc_type: "site_faq",
      external_id: faq.slug,
      title: faq.question,
      content: `Q: ${faq.question}\nA: ${faq.answer}`,
      metadata: {
        slug: faq.slug,
        // Deep-links to the question's own accordion row on /faq.
        url: `${SITE_URL}/faq#faq-${faq.slug}`,
        category: faq.category,
        tags: faq.tags,
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
    body && typeof body === "object" && Array.isArray((body as Record<string, unknown>).faqs)
      ? ((body as Record<string, unknown>).faqs as unknown[])
      : [body];

  if (!raw.length) {
    return NextResponse.json({ detail: "No FAQs provided." }, { status: 400 });
  }

  const results: { slug: string; status: string; url: string }[] = [];
  try {
    for (const item of raw) {
      const parsed = normalize(item);
      if ("error" in parsed) {
        return NextResponse.json({ detail: parsed.error }, { status: 400 });
      }
      const row = parsed.row;
      // No explicit position → keep an existing question's slot, or append a
      // new one so it never collides at 0 and jumps to the top of the page.
      if (row.position === undefined) {
        const existing = await getSiteFaqPosition(row.slug);
        row.position = existing ?? (await nextSiteFaqPosition());
      }
      const stored = await upsertSiteFaq(row);
      await syncRag(stored);
      results.push({
        slug: stored.slug,
        status: stored.status,
        url: `${SITE_URL}/faq#faq-${stored.slug}`,
      });
    }
  } catch (err) {
    console.error("[faqs] upsert failed", err);
    return NextResponse.json({ detail: "Could not save the FAQ." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: results.length, faqs: results });
}

export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ detail: "Invalid or missing X-Admin-Key." }, { status: 401 });
  }
  try {
    const { getSupabase } = await import("@/lib/rag/supabase");
    const { data, error } = await getSupabase().from("site_faqs").select("status");
    if (error) throw error;
    const rows = (data ?? []) as { status: string }[];
    return NextResponse.json({
      total: rows.length,
      published: rows.filter((r) => r.status === "published").length,
      draft: rows.filter((r) => r.status === "draft").length,
      archived: rows.filter((r) => r.status === "archived").length,
    });
  } catch (err) {
    console.error("[faqs] count failed", err);
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
    const { error } = await getSupabase().from("site_faqs").delete().eq("slug", slug);
    if (error) throw error;
    await deleteDocument("site_faq", slug);
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    console.error("[faqs] delete failed", err);
    return NextResponse.json({ detail: "Delete failed." }, { status: 500 });
  }
}
