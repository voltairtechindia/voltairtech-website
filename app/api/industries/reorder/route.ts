/**
 * Admin-gated reorder endpoint for the /industries grid. Mirrors
 * /api/services/reorder — rewrites `industries.position` to 1..N in the given
 * slug order (also the order sectors appear in the homepage proof rail).
 *
 * Auth: header  X-Admin-Key: <ADMIN_API_KEY>
 * POST /api/industries/reorder  { "order": ["real-estate", "healthcare", ...] }
 *   -> 200 { ok, count }
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/admin-auth";
import { setIndustryPositions } from "@/lib/industries/db";

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
    await setIndustryPositions(order);
  } catch (err) {
    console.error("[industries] reorder failed", err);
    return NextResponse.json({ detail: "Could not save the order." }, { status: 500 });
  }

  revalidatePath("/industries");
  revalidatePath("/");
  return NextResponse.json({ ok: true, count: order.length });
}
