/**
 * Admin-gated reorder endpoint for the /faq page.
 *
 * The question order is `site_faqs.position` (ascending). The admin panel's
 * list page sends the full slug list in the order it wants, and this rewrites
 * the positions to 1..N in one shot — no need to re-post whole rows (and
 * therefore no RAG re-embedding for a pure ordering change).
 *
 * Auth: header  X-Admin-Key: <ADMIN_API_KEY>
 * POST /api/faqs/reorder  { "order": ["who-builds-ai-products-in-mumbai", ...] }
 *   -> 200 { ok, count }
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/admin-auth";
import { setSiteFaqPositions } from "@/lib/faq/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    await setSiteFaqPositions(order);
  } catch (err) {
    console.error("[faqs] reorder failed", err);
    return NextResponse.json({ detail: "Could not save the order." }, { status: 500 });
  }

  revalidatePath("/faq");
  revalidatePath("/");
  return NextResponse.json({ ok: true, count: order.length });
}
