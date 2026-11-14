/**
 * Admin-gated reorder endpoint for the /services grid.
 *
 * The card order is `services.position` (ascending). The admin panel's list
 * page sends the full slug list in the order it wants, and this rewrites the
 * positions to 1..N in one shot — no need to re-post whole service objects (and
 * therefore no RAG re-embedding for a pure ordering change).
 *
 * Auth: header  X-Admin-Key: <ADMIN_API_KEY>
 * POST /api/services/reorder  { "order": ["ai-websites", "ai-automation", ...] }
 *   -> 200 { ok, count }
 */
import { NextResponse } from "@/server/shims/next-server";
import { revalidatePath } from "@/server/shims/next-cache";

import { isAdmin } from "@/lib/admin-auth";
import { setServicePositions } from "@/lib/services/db";


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
  const order = Array.isArray(raw)
    ? raw.filter((s): s is string => typeof s === "string").map((s) => s.trim()).filter(Boolean)
    : [];
  if (!order.length) {
    return NextResponse.json({ detail: 'Provide { "order": ["slug", ...] }.' }, { status: 400 });
  }

  try {
    await setServicePositions(order);
  } catch (err) {
    console.error("[services] reorder failed", err);
    return NextResponse.json({ detail: "Could not save the order." }, { status: 500 });
  }

  revalidatePath("/services");
  revalidatePath("/");
  return NextResponse.json({ ok: true, count: order.length });
}
