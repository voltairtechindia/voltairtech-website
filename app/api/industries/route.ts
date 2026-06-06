/**
 * Admin-gated industries endpoint — the admin-panel / n8n target. Writes a row
 * to `industries` AND (when published) embeds it into the RAG store (doc_type
 * "industry") so the chatbot cites it. Mirrors /api/services.
 *
 * An industry is a sector lens over the catalogue: `service_slugs` links it to a
 * curated, ordered subset of services. /industries/<slug> renders that subset;
 * /services still lists everything.
 *
 * Auth: header  X-Admin-Key: <ADMIN_API_KEY>
 *
 * POST /api/industries
 *   Body: a single industry object, or { "industries": [ ... ] } for a batch.
 *   Each: { slug, title (required), summary?, bullets?: string[], icon?,
 *           lead?, meta?, body_md?, tags?: string[], service_slugs?: string[],
 *           custom_services?: { title, summary?, bullets?, eta?, icon?, link? }[],
 *           seo?, position?, status?: "draft"|"published"|"archived", published_at? }
 *   `icon` may be a glyph key, or "" / "auto" to derive it from title/tags.
 *   -> 200 { ok, count, industries: [{ slug, status, url }] }
 *
 * GET  /api/industries            -> { total, published, draft, archived }
 * DELETE /api/industries?slug=...  -> removes the industry + its RAG document
 */
import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin-auth";
import { markdownToPlainText, slugify } from "@/lib/blog/util";
import {
  getIndustryPosition,
  nextIndustryPosition,
  upsertIndustry,
} from "@/lib/industries/db";
import { resolveIndustryIcon } from "@/lib/industries/icons";
import type {
  Industry,
  IndustryCaseStudy,
  IndustryCover,
  IndustryCustomService,
  IndustryUpsert,
} from "@/lib/industries/types";
import { getPublishedServiceCardsBySlugs } from "@/lib/services/db";
import { deleteDocument } from "@/lib/rag/db";
import { ingest } from "@/lib/rag/ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = "https://voltairtech.com";
const VALID_STATUS = new Set(["draft", "published", "archived"]);

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function strArray(v: unknown): string[] {
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean)
    : [];
}

/** Accept a { url, alt? } object (or null) for the cover image. */
function cover(v: unknown): IndustryCover | null {
  if (typeof v !== "object" || v === null) return null;
  const url = str((v as Record<string, unknown>).url);
  if (!url) return null;
  const alt = str((v as Record<string, unknown>).alt);
  return alt ? { url, alt } : { url };
}

/** Normalise the case-studies array — each entry needs at least a title to count. */
function caseStudies(v: unknown): IndustryCaseStudy[] {
  if (!Array.isArray(v)) return [];
  const out: IndustryCaseStudy[] = [];
  for (const raw of v) {
    if (typeof raw !== "object" || raw === null) continue;
    const p = raw as Record<string, unknown>;
    const title = str(p.title);
    if (!title) continue;

    const metrics = Array.isArray(p.metrics)
      ? p.metrics
          .map((m) => {
            if (typeof m !== "object" || m === null) return null;
            const mm = m as Record<string, unknown>;
            const label = str(mm.label);
            const value = str(mm.value);
            return label || value ? { label, value } : null;
          })
          .filter((m): m is { label: string; value: string } => m !== null)
      : [];

    const cs: IndustryCaseStudy = {
      title,
      tech_stack: strArray(p.tech_stack),
      metrics,
    };
    const client = str(p.client);
    const challenge = str(p.challenge);
    const approach = str(p.approach);
    const outcome = str(p.outcome);
    const link = str(p.link);
    if (client) cs.client = client;
    if (challenge) cs.challenge = challenge;
    if (approach) cs.approach = approach;
    if (outcome) cs.outcome = outcome;
    if (link) cs.link = link;
    out.push(cs);
  }
  return out;
}

/** Normalise the inline custom-services array — each entry needs at least a title. */
function customServices(v: unknown): IndustryCustomService[] {
  if (!Array.isArray(v)) return [];
  const out: IndustryCustomService[] = [];
  for (const raw of v) {
    if (typeof raw !== "object" || raw === null) continue;
    const p = raw as Record<string, unknown>;
    const title = str(p.title);
    if (!title) continue;

    const cs: IndustryCustomService = { title, bullets: strArray(p.bullets) };
    const summary = str(p.summary);
    const eta = str(p.eta);
    const icon = str(p.icon);
    const link = str(p.link);
    if (summary) cs.summary = summary;
    if (eta) cs.eta = eta;
    if (icon) cs.icon = icon;
    if (link) cs.link = link;
    out.push(cs);
  }
  return out;
}

function normalize(input: unknown): { row: IndustryUpsert } | { error: string } {
  if (typeof input !== "object" || input === null) {
    return { error: "Each industry must be an object." };
  }
  const p = input as Record<string, unknown>;

  const title = str(p.title);
  if (!title) return { error: "title is required." };

  const slug = slugify(str(p.slug) || title);
  if (!slug) return { error: `Could not derive a slug for "${title}".` };

  const status = str(p.status) || "published";
  if (!VALID_STATUS.has(status)) return { error: `Invalid status "${status}".` };

  const tags = strArray(p.tags);
  const icon = resolveIndustryIcon(typeof p.icon === "string" ? p.icon : null, title, tags);

  // Linked service slugs — normalise + de-dupe, preserving the admin's order.
  const serviceSlugs = Array.from(
    new Set(strArray(p.service_slugs).map((s) => slugify(s)).filter(Boolean)),
  );

  const seo =
    typeof p.seo === "object" && p.seo !== null ? (p.seo as IndustryUpsert["seo"]) : {};

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
      icon,
      cover_image: cover(p.cover_image),
      lead: str(p.lead) || null,
      meta: str(p.meta) || null,
      body_md: typeof p.body_md === "string" ? p.body_md : "",
      tags,
      service_slugs: serviceSlugs,
      custom_services: customServices(p.custom_services),
      case_studies: caseStudies(p.case_studies),
      seo: seo ?? {},
      position,
      status: status as IndustryUpsert["status"],
      published_at,
    },
  };
}

/** Mirror a stored industry into the RAG store (or remove it if not published). */
async function syncRag(ind: Industry): Promise<void> {
  if (ind.status !== "published") {
    await deleteDocument("industry", ind.slug);
    return;
  }
  const url = `${SITE_URL}/industries/${ind.slug}`;

  // Enrich the embedding with the names of the linked, published services so
  // the bot connects "do you work with <sector>?" to the right offerings.
  let serviceLine = "";
  try {
    const cards = await getPublishedServiceCardsBySlugs(ind.service_slugs);
    if (cards.length) {
      serviceLine = `Services for this industry: ${cards.map((c) => c.title).join(", ")}.`;
    }
  } catch {
    // best-effort — the page still works without the enrichment
  }

  // Fold the inline custom (sector-only) services into the embedding too, so the
  // bot can cite offerings that aren't in the global /services catalogue.
  const customServiceLines = (ind.custom_services ?? []).map((cs) => {
    const bits = [
      `Sector-specific service: ${cs.title}.`,
      cs.summary ? cs.summary : "",
      cs.bullets.length ? `What you get: ${cs.bullets.join("; ")}.` : "",
      cs.eta ? `Typical timeline: ${cs.eta}.` : "",
    ].filter(Boolean);
    return bits.join(" ");
  });

  // Fold each case study into the embedding so the bot can answer
  // "how have you used AI in <sector>?" and "what stack do you use for <sector>?".
  const caseStudyLines = (ind.case_studies ?? []).map((cs) => {
    const bits = [
      `Case study: ${cs.title}${cs.client ? ` (${cs.client})` : ""}.`,
      cs.challenge ? `Challenge: ${cs.challenge}` : "",
      cs.approach ? `How we applied AI: ${cs.approach}` : "",
      cs.outcome ? `Outcome: ${cs.outcome}` : "",
      cs.tech_stack.length ? `Tech stack: ${cs.tech_stack.join(", ")}.` : "",
      cs.metrics.length
        ? `Results: ${cs.metrics.map((m) => `${m.value} ${m.label}`.trim()).join("; ")}.`
        : "",
    ].filter(Boolean);
    return bits.join(" ");
  });

  const parts = [
    ind.title,
    ind.summary ?? "",
    ind.lead ?? "",
    ind.bullets.join(". "),
    markdownToPlainText(ind.body_md),
    serviceLine,
    ...customServiceLines,
    ...caseStudyLines,
  ].filter(Boolean);

  await ingest([
    {
      doc_type: "industry",
      external_id: ind.slug,
      title: ind.title,
      content: parts.join("\n\n"),
      metadata: {
        slug: ind.slug,
        url,
        tags: ind.tags,
        icon: ind.icon,
        service_slugs: ind.service_slugs,
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
    body && typeof body === "object" && Array.isArray((body as Record<string, unknown>).industries)
      ? ((body as Record<string, unknown>).industries as unknown[])
      : [body];

  if (!raw.length) {
    return NextResponse.json({ detail: "No industries provided." }, { status: 400 });
  }

  const results: { slug: string; status: string; url: string }[] = [];
  try {
    for (const item of raw) {
      const parsed = normalize(item);
      if ("error" in parsed) {
        return NextResponse.json({ detail: parsed.error }, { status: 400 });
      }
      const row = parsed.row;
      // No explicit position → keep an existing industry's slot, or append a new
      // one to the end so it never collides at 0 and leapfrogs the grid.
      if (row.position === undefined) {
        const existing = await getIndustryPosition(row.slug);
        row.position = existing ?? (await nextIndustryPosition());
      }
      const stored = await upsertIndustry(row);
      await syncRag(stored);
      results.push({
        slug: stored.slug,
        status: stored.status,
        url: `${SITE_URL}/industries/${stored.slug}`,
      });
    }
  } catch (err) {
    console.error("[industries] upsert failed", err);
    return NextResponse.json({ detail: "Could not save the industry." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: results.length, industries: results });
}

export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ detail: "Invalid or missing X-Admin-Key." }, { status: 401 });
  }
  try {
    const { getSupabase } = await import("@/lib/rag/supabase");
    const { data, error } = await getSupabase().from("industries").select("status");
    if (error) throw error;
    const rows = (data ?? []) as { status: string }[];
    return NextResponse.json({
      total: rows.length,
      published: rows.filter((r) => r.status === "published").length,
      draft: rows.filter((r) => r.status === "draft").length,
      archived: rows.filter((r) => r.status === "archived").length,
    });
  } catch (err) {
    console.error("[industries] count failed", err);
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
    const { error } = await getSupabase().from("industries").delete().eq("slug", slug);
    if (error) throw error;
    await deleteDocument("industry", slug);
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    console.error("[industries] delete failed", err);
    return NextResponse.json({ detail: "Delete failed." }, { status: 500 });
  }
}
