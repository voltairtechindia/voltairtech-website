/**
 * POST /api/revalidate  (admin-gated, X-Admin-Key)
 *   Body: { "paths": ["/career", "/career/some-slug"] } or { "path": "/blog" }
 *
 * The admin panel pings this after every save. On Vercel it cleared ISR pages;
 * the site is now static on Cloudflare Pages, so it starts a rebuild + deploy
 * instead (about 3 minutes until the change is live).
 */
import { isAdmin } from "@/lib/admin-auth";
import { requestRebuild } from "@/server/rebuild";

import { NextResponse } from "@/server/shims/next-server";

export async function POST(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ detail: "Invalid or missing X-Admin-Key." }, { status: 401 });
  }
  let obj: Record<string, unknown> = {};
  try {
    obj = ((await req.json()) ?? {}) as Record<string, unknown>;
  } catch {
    // An empty or invalid body still means "something changed".
  }
  const raw = Array.isArray(obj.paths) ? obj.paths : typeof obj.path === "string" ? [obj.path] : [];
  const paths = raw.filter((p): p is string => typeof p === "string" && p.startsWith("/"));

  const rebuild = await requestRebuild(`admin: ${paths.join(" ") || "revalidate"}`);
  return NextResponse.json({ ok: rebuild !== "failed", revalidated: paths, rebuild });
}
