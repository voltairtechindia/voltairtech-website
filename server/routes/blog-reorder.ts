/**
 * Admin-gated pin order for the /blog index.
 *
 * The blog is chronological by default. This endpoint sets `pin_position` to
 * 1..N for the given slugs (1 = first card) and clears the pin on every other
 * post, so pinned articles lead the grid and the rest stay newest-first.
 * Sending an empty list is how the admin unpins everything.
 *
 * Auth: header  X-Admin-Key: <ADMIN_API_KEY>
 * POST /api/blog/reorder  { "order": ["ai-voice-agents", "gst-deadlines"] }
 *   -> 200 { ok, count }
 */
import { NextResponse } from "@/server/shims/next-server";
import { revalidatePath } from "@/server/shims/next-cache";

import { isAdmin } from "@/lib/admin-auth";
import { setPostPins } from "@/lib/blog/db";


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

  const raw = (body as Record<string, unknown> | null)?.order;
  if (!Array.isArray(raw)) {
    return NextResponse.json({ detail: 'Provide { "order": ["slug", ...] }.' }, { status: 400 });
  }
  const order = raw
    .filter((s): s is string => typeof s === "string")
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    await setPostPins(order);
  } catch (err) {
    console.error("[blog] reorder failed", err);
    return NextResponse.json({ detail: "Could not save the order." }, { status: 500 });
  }

  revalidatePath("/blog");
  return NextResponse.json({ ok: true, count: order.length });
}
