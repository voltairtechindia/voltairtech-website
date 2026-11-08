/**
 * POST /api/chat  { message, session_id, page_url?, page? }
 *   -> plain-text reply stream + a trailing JSON metadata frame (lib/rag/chat.ts)
 *
 * The AI assistant behind the site's chat widget: embeds the question with
 * Gemini, finds the closest knowledge-base documents in Supabase (pgvector) and
 * streams a grounded reply. Every turn is logged to the `conversations` and
 * `messages` tables, which the admin panel's Chatbot page reads.
 *
 * Three rate limits protect the Gemini bill: a per-IP burst limit, a per-IP
 * daily quota and a global daily ceiling (lib/rate-limit.ts).
 */
import { json, prepare, type PagesContext } from "../_lib/runtime";

type PageInfo = { path?: string | null; title?: string | null; topic?: string | null };

function sanitizePage(page: PageInfo | null | undefined) {
  if (!page || typeof page !== "object") return null;
  const str = (v: unknown, max: number): string | null =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
  const path = str(page.path, 200);
  const title = str(page.title, 300);
  const topic = str(page.topic, 200);
  return path || title || topic ? { path, title, topic } : null;
}

export async function onRequestPost(ctx: PagesContext): Promise<Response> {
  prepare(ctx);
  const { LIMITS, SUPPORT_EMAIL, getClientIp, istDay, retryAfterSeconds, rlHit } = await import(
    "../../lib/rate-limit"
  );
  const { streamChat } = await import("../../lib/rag/chat");
  const req = ctx.request;
  const ip = getClientIp(req);

  const burst = await rlHit(`chat:burst:${ip}`, LIMITS.chatBurst.limit, LIMITS.chatBurst.windowSeconds);
  if (!burst.allowed) {
    return json(
      { detail: "You're sending messages too quickly. Please wait a few seconds and try again." },
      429,
      { "Retry-After": String(retryAfterSeconds(burst.resetAt)) },
    );
  }

  let body: { message?: unknown; session_id?: unknown; page_url?: unknown; page?: PageInfo };
  try {
    body = await req.json();
  } catch {
    return json({ detail: "Invalid JSON body." }, 400);
  }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const sessionId = typeof body.session_id === "string" ? body.session_id.trim() : "";
  const pageUrl = typeof body.page_url === "string" ? body.page_url.slice(0, 500) : null;
  if (!message || message.length > 4000) {
    return json({ detail: "message is required (1 to 4000 characters)." }, 400);
  }
  if (sessionId.length < 6 || sessionId.length > 128) {
    return json({ detail: "session_id is required (6 to 128 characters)." }, 400);
  }

  const daily = await rlHit(`chat:day:${istDay()}:${ip}`, LIMITS.chatDaily.limit, LIMITS.chatDaily.windowSeconds);
  if (!daily.allowed) {
    return json(
      {
        detail: `You've reached today's question limit for the assistant. For more help, email ${SUPPORT_EMAIL} or try again tomorrow.`,
      },
      429,
      { "Retry-After": String(retryAfterSeconds(daily.resetAt)) },
    );
  }
  const global = await rlHit(`chat:global:${istDay()}`, LIMITS.chatGlobal.limit, LIMITS.chatGlobal.windowSeconds);
  if (!global.allowed) {
    return json(
      { detail: `Our assistant is very busy right now. Please try again later, or email ${SUPPORT_EMAIL}.` },
      503,
      { "Retry-After": "3600" },
    );
  }

  try {
    const stream = await streamChat({ message, sessionId, pageUrl, page: sanitizePage(body.page) });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[rag] chat handler failed", err);
    return json({ detail: "The assistant hit a snag. Please try again in a moment." }, 500);
  }
}
