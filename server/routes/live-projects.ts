/**
 * Admin-gated live-projects endpoint — the admin-panel target. Writes a row to
 * `live_projects` AND (when published) embeds it into the RAG store (doc_type
 * "live_project") so the chatbot can answer "what have you actually built?".
 * Mirrors /api/services.
 *
 * Auth: header  X-Admin-Key: <ADMIN_API_KEY>
 *
 * POST /api/live-projects
 *   Body: a single project object, or { "projects": [ ... ] } for a batch.
 *   Each: { slug?, name (required), kicker?, tagline?, summary?,
 *           lifecycle?: "live"|"shipped"|"build",
 *           surfaces?: string[], stack?: string[], highlights?: string[],
 *           stats?: { value, label }[], links?: { label, href }[],
 *           media?: ({ type: "image", url, alt?, caption? }
 *                  | { type: "video", url, poster?, caption? }
 *                  | { type: "embed", url, provider?, caption? })[],
 *           cover_image?: { url, alt? } | null,
 *           brochure?: { url, label?, size_bytes?, pages? } | null,
 *           tags?: string[], seo?, position?,
 *           status?: "draft"|"published"|"archived", published_at? }
 *   -> 200 { ok, count, projects: [{ slug, status, url }] }
 *
 * GET  /api/live-projects            -> { total, published, draft, archived }
 * DELETE /api/live-projects?slug=... -> removes the project + its RAG document
 */
import { NextResponse } from "@/server/shims/next-server";

import { isAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/blog/util";
import {
  getProjectPosition,
  nextProjectPosition,
  upsertProject,
} from "@/lib/live-projects/db";
import { LIFECYCLE_LABEL } from "@/lib/live-projects/types";
import type {
  LiveProject,
  LiveProjectUpsert,
  MediaItem,
  ProjectBrochure,
  ProjectCover,
  ProjectLink,
  ProjectStat,
} from "@/lib/live-projects/types";
import { deleteDocument } from "@/lib/rag/db";
import { ingest } from "@/lib/rag/ingest";
import { SITE_URL } from "@/lib/seo";


const VALID_STATUS = new Set(["draft", "published", "archived"]);
const VALID_LIFECYCLE = new Set(["live", "shipped", "build"]);

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function strArray(v: unknown): string[] {
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean)
    : [];
}

function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? Math.round(v) : undefined;
}

function cover(v: unknown): ProjectCover | null {
  if (typeof v !== "object" || v === null) return null;
  const url = str((v as Record<string, unknown>).url);
  if (!url) return null;
  const alt = str((v as Record<string, unknown>).alt);
  return alt ? { url, alt } : { url };
}

function brochure(v: unknown): ProjectBrochure | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  const url = str(o.url);
  if (!url) return null;
  const label = str(o.label);
  const size = num(o.size_bytes);
  const pages = num(o.pages);
  return {
    url,
    ...(label ? { label } : {}),
    ...(size !== undefined && size > 0 ? { size_bytes: size } : {}),
    ...(pages !== undefined && pages > 0 ? { pages } : {}),
  };
}

/** `[{ value, label }]` — both required, so a half-filled row never renders. */
function stats(v: unknown): ProjectStat[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((raw) => {
      if (typeof raw !== "object" || raw === null) return null;
      const o = raw as Record<string, unknown>;
      const value = str(o.value);
      const label = str(o.label);
      return value && label ? { value, label } : null;
    })
    .filter((s): s is ProjectStat => s !== null);
}

/** `[{ label, href }]` — both required; relative hrefs are allowed (/contact). */
function links(v: unknown): ProjectLink[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((raw) => {
      if (typeof raw !== "object" || raw === null) return null;
      const o = raw as Record<string, unknown>;
      const label = str(o.label);
      const href = str(o.href);
      return label && href ? { label, href } : null;
    })
    .filter((l): l is ProjectLink => l !== null);
}

const MEDIA_TYPES = new Set(["image", "video", "embed"]);

/**
 * The gallery: `[{ type, url, … }]`, same MediaItem shape as a blog post's.
 * A row without a recognised type or a URL is dropped rather than stored —
 * the site renders these straight into an <img>/<video>/<iframe>.
 */
function media(v: unknown): MediaItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((raw) => {
      if (typeof raw !== "object" || raw === null) return null;
      const o = raw as Record<string, unknown>;
      const type = str(o.type);
      const url = str(o.url);
      if (!MEDIA_TYPES.has(type) || !url) return null;
      const caption = str(o.caption);
      const base = { url, ...(caption ? { caption } : {}) };
      if (type === "image") {
        const alt = str(o.alt);
        return { type: "image", ...base, ...(alt ? { alt } : {}) } as MediaItem;
      }
      if (type === "video") {
        const poster = str(o.poster);
        return { type: "video", ...base, ...(poster ? { poster } : {}) } as MediaItem;
      }
      const provider = str(o.provider);
      return { type: "embed", ...base, ...(provider ? { provider } : {}) } as MediaItem;
    })
    .filter((m): m is MediaItem => m !== null);
}

function normalize(input: unknown): { row: LiveProjectUpsert } | { error: string } {
  if (typeof input !== "object" || input === null) {
    return { error: "Each project must be an object." };
  }
  const p = input as Record<string, unknown>;

  const name = str(p.name);
  if (!name) return { error: "name is required." };

  const slug = slugify(str(p.slug) || name);
  if (!slug) return { error: `Could not derive a slug for "${name}".` };

  const status = str(p.status) || "draft";
  if (!VALID_STATUS.has(status)) return { error: `Invalid status "${status}".` };

  const lifecycle = str(p.lifecycle) || "build";
  if (!VALID_LIFECYCLE.has(lifecycle)) {
    return { error: `Invalid lifecycle "${lifecycle}": use live, shipped or build.` };
  }

  const seo =
    typeof p.seo === "object" && p.seo !== null
      ? (p.seo as LiveProjectUpsert["seo"])
      : {};

  // Omitted position → the POST handler places it (existing rows keep their
  // slot, new ones append) so nothing collides at 0 and jumps to the top.
  const position = num(p.position);

  const publishedAt = str(p.published_at);
  const published_at =
    status === "published"
      ? publishedAt || new Date().toISOString()
      : publishedAt || null;

  return {
    row: {
      slug,
      name,
      kicker: str(p.kicker) || null,
      tagline: str(p.tagline) || null,
      summary: str(p.summary) || null,
      lifecycle: lifecycle as LiveProjectUpsert["lifecycle"],
      surfaces: strArray(p.surfaces),
      stack: strArray(p.stack),
      highlights: strArray(p.highlights),
      stats: stats(p.stats),
      links: links(p.links),
      media: media(p.media),
      cover_image: cover(p.cover_image),
      brochure: brochure(p.brochure),
      tags: strArray(p.tags),
      seo: seo ?? {},
      position,
      status: status as LiveProjectUpsert["status"],
      published_at,
    },
  };
}

/** Mirror a stored project into the RAG store (or remove it if not published). */
async function syncRag(pr: LiveProject): Promise<void> {
  if (pr.status !== "published") {
    await deleteDocument("live_project", pr.slug);
    return;
  }
  const url = `${SITE_URL}/live-projects/${pr.slug}`;
  // The figures are embedded as prose too — the bot only ever sees `content`,
  // so a stat left in a JSONB column is invisible to it.
  const statLine = pr.stats.length
    ? pr.stats.map((s) => `${s.value} ${s.label}`).join(", ")
    : "";
  const parts = [
    `${pr.name}${pr.kicker ? `, ${pr.kicker}` : ""} (${LIFECYCLE_LABEL[pr.lifecycle]}), a product built and shipped by Voltair Tech.`,
    pr.tagline ?? "",
    pr.summary ?? "",
    statLine,
    pr.highlights.join(" "),
    pr.surfaces.length ? `Runs on: ${pr.surfaces.join(", ")}.` : "",
    pr.stack.length ? `Built with: ${pr.stack.join(", ")}.` : "",
    pr.media.map((m) => m.caption).filter(Boolean).join(" "),
    pr.brochure?.url ? `Feature brochure: ${pr.brochure.url}` : "",
  ].filter(Boolean);

  await ingest([
    {
      doc_type: "live_project",
      external_id: pr.slug,
      title: pr.name,
      content: parts.join("\n\n"),
      metadata: {
        slug: pr.slug,
        url,
        lifecycle: pr.lifecycle,
        surfaces: pr.surfaces,
        stack: pr.stack,
        tags: pr.tags,
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
    body && typeof body === "object" && Array.isArray((body as Record<string, unknown>).projects)
      ? ((body as Record<string, unknown>).projects as unknown[])
      : [body];

  if (!raw.length) {
    return NextResponse.json({ detail: "No projects provided." }, { status: 400 });
  }

  const results: { slug: string; status: string; url: string }[] = [];
  try {
    for (const item of raw) {
      const parsed = normalize(item);
      if ("error" in parsed) {
        return NextResponse.json({ detail: parsed.error }, { status: 400 });
      }
      const row = parsed.row;
      if (row.position === undefined) {
        const existing = await getProjectPosition(row.slug);
        row.position = existing ?? (await nextProjectPosition());
      }
      const stored = await upsertProject(row);
      await syncRag(stored);
      results.push({
        slug: stored.slug,
        status: stored.status,
        url: `${SITE_URL}/live-projects/${stored.slug}`,
      });
    }
  } catch (err) {
    console.error("[live-projects] upsert failed", err);
    return NextResponse.json({ detail: "Could not save the project." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: results.length, projects: results });
}

export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ detail: "Invalid or missing X-Admin-Key." }, { status: 401 });
  }
  try {
    const { getSupabase } = await import("@/lib/rag/supabase");
    const { data, error } = await getSupabase().from("live_projects").select("status");
    if (error) throw error;
    const rows = (data ?? []) as { status: string }[];
    return NextResponse.json({
      total: rows.length,
      published: rows.filter((r) => r.status === "published").length,
      draft: rows.filter((r) => r.status === "draft").length,
      archived: rows.filter((r) => r.status === "archived").length,
    });
  } catch (err) {
    console.error("[live-projects] count failed", err);
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
    const { error } = await getSupabase().from("live_projects").delete().eq("slug", slug);
    if (error) throw error;
    await deleteDocument("live_project", slug);
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    console.error("[live-projects] delete failed", err);
    return NextResponse.json({ detail: "Delete failed." }, { status: 500 });
  }
}
