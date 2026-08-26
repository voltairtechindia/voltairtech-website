/**
 * Chat orchestration: retrieve grounded knowledge → build history → STREAM the
 * reply → persist transcript + cache + analytics after the stream closes.
 *
 * The response is a plain-text stream of the reply, followed by a single record
 * separator (U+001E) and a compact JSON trailer ({ sources }) the widget uses
 * for source deep-links. Retrieval + generation are the core; conversation
 * logging, caching and analytics are all best-effort and run via `runAfter`
 * so they never add latency to (or break) the reply.
 */
import { runAfter } from "@/lib/after";

import { processTurn } from "./analytics";
import {
  bumpCacheHit,
  getCachedReply,
  isCacheable,
  putCachedReply,
  questionHash,
} from "./cache";
import { config } from "./config";
import {
  addMessages,
  getOrCreateConversation,
  getRecentMessages,
} from "./db";
import { FALLBACK_REPLY, generateStream, type ChatTurn } from "./gemini";
import { OFF_TOPIC_REPLY, SYSTEM_PROMPT, buildChatTurn } from "./prompts";
import { buildContext, search } from "./retriever";
import type { PageInfo, SourceDoc } from "./types";

/** Record separator between the streamed reply text and the JSON trailer. */
const RS = "\u001E";

/** Deictic questions ("summarise this", "is it right for me") lean on the page. */
const DEICTIC =
  /\b(this|that|these|those|it|here|the (article|post|page|service|industry))\b/i;

export interface StreamChatArgs {
  message: string;
  sessionId: string;
  pageUrl?: string | null;
  page?: PageInfo | null;
}

function trailer(sources: SourceDoc[]): string {
  return RS + JSON.stringify({ sources });
}

function sourcesOf(
  docs: { doc_type: string; title: string | null; external_id: string | null; similarity: number }[],
): SourceDoc[] {
  return docs.map((d) => ({
    doc_type: d.doc_type,
    title: d.title,
    external_id: d.external_id,
    similarity: Math.round(d.similarity * 1000) / 1000,
  }));
}

/**
 * Build the streamed chat response. Awaits retrieval + history up front (so a
 * hard failure there throws before any bytes are sent and the route can return
 * a clean 500); generation itself streams inside the ReadableStream.
 */
export async function streamChat(
  args: StreamChatArgs,
): Promise<ReadableStream<Uint8Array>> {
  const enc = new TextEncoder();
  const title = args.page?.title?.trim() ?? "";
  const topic = args.page?.topic?.trim() ?? "";
  const path = args.page?.path?.trim() ?? "";

  // 0. Response cache — scoped to the current page so grounded answers don't
  // bleed across pages. Stream the cached reply instantly and log in the
  // background.
  const cacheable = isCacheable(args.message);
  const hash = cacheable ? questionHash(args.message, path) : "";
  if (cacheable) {
    const cached = await getCachedReply(hash);
    if (cached) {
      void bumpCacheHit(hash);
      runAfter(() => persistTurn(args.sessionId, args.message, cached.reply, { cache: "hit" }));
      return oneShot(enc, cached.reply, cached.sources);
    }
  }

  // 1. Retrieve grounded knowledge. For deictic questions, bias the query with
  // the page title/topic so "summarise this" finds the right document.
  const query =
    DEICTIC.test(args.message) && (title || topic)
      ? `${title || topic}. ${args.message}`
      : args.message;
  let docs: Awaited<ReturnType<typeof search>> = [];
  let retrievalFailed = false;
  try {
    docs = await search(query);
  } catch (err) {
    retrievalFailed = true;
    console.error("[rag] retrieval failed", err);
  }

  // 1b. NO-GROUNDING GATE.
  //
  // If retrieval returned NOTHING, we know nothing about the question — so
  // answer from the canned redirect rather than generating. Previously an empty
  // context still went to the model, which is how the sister site's widget ended
  // up writing JavaScript tutorials: an ungrounded generation is both the most
  // expensive call and the one most likely to wander off-brand.
  //
  // This catches only the unambiguous case. It is NOT the off-topic defence —
  // see the measured overlap in config.ragAnswerMinSimilarity: off-topic
  // questions routinely retrieve documents at 0.5-0.7, so "has matches" and "is
  // about Voltair Tech" are not the same question. Scope is enforced by the
  // OFF-TOPIC section of the system prompt.
  //
  // We deliberately do NOT fall back to an ungrounded generation when retrieval
  // errors either — it's honest to say we're having trouble rather than improvise.
  const bestSimilarity = docs.reduce((m, d) => Math.max(m, d.similarity), 0);
  const ungrounded =
    docs.length === 0 || bestSimilarity < config.ragAnswerMinSimilarity;
  if (retrievalFailed || ungrounded) {
    const gatedReply = retrievalFailed ? FALLBACK_REPLY : OFF_TOPIC_REPLY;
    // Still log the turn (Supabase only, no LLM): out-of-scope traffic is worth
    // seeing, and history stays coherent if the visitor then asks something real.
    runAfter(() =>
      persistTurn(args.sessionId, args.message, gatedReply, {
        gated: retrievalFailed ? "retrieval_failed" : "off_topic",
        best_similarity: Math.round(bestSimilarity * 1000) / 1000,
      }),
    );
    return oneShot(enc, gatedReply, []);
  }

  const context = buildContext(docs);
  const sources = sourcesOf(docs);

  // 2. Load conversation history (best-effort).
  let conversationId: string | null = null;
  let history: ChatTurn[] = [];
  try {
    conversationId = await getOrCreateConversation(args.sessionId);
    const recent = await getRecentMessages(conversationId, config.historyWindow);
    history = recent
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        text: m.content,
      }));
    // Gemini requires the conversation to start with a user turn.
    while (history.length && history[0].role === "model") history.shift();
  } catch (err) {
    console.error("[rag] conversation load failed (continuing stateless)", err);
    conversationId = null;
    history = [];
  }

  const visitor = path
    ? `The visitor is currently on the ${path} page${title ? ` ("${title}")` : ""}.`
    : "";
  history.push({ role: "user", text: buildChatTurn(context, args.message, visitor) });

  // 3. Stream the grounded reply, then flush the trailer and run the
  // best-effort persistence/cache/analytics after the bytes are sent.
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = "";
      try {
        for await (const piece of generateStream(SYSTEM_PROMPT, history)) {
          full += piece;
          controller.enqueue(enc.encode(piece));
        }
      } catch (err) {
        console.error("[rag] stream generation failed", err);
        if (!full) {
          full = FALLBACK_REPLY;
          controller.enqueue(enc.encode(full));
        }
      }
      const reply = full.trim() || FALLBACK_REPLY;
      controller.enqueue(enc.encode(trailer(sources)));
      controller.close();

      runAfter(async () => {
        const sourceIds = docs
          .map((d) => d.external_id)
          .filter((id): id is string => Boolean(id));
        if (conversationId) {
          try {
            await addMessages(conversationId, [
              { role: "user", content: args.message },
              { role: "assistant", content: reply, metadata: { source_ids: sourceIds } },
            ]);
          } catch (err) {
            console.error("[rag] message persist failed", err);
          }
        }
        // Never cache a fallback. During the Netlify AI Gateway outage every
        // reply was the apology, and each one was written to chat_cache — so the
        // popular questions kept answering with it even after generation was
        // working again, with no error anywhere to explain why.
        if (cacheable && reply !== FALLBACK_REPLY) {
          await putCachedReply(hash, args.message, { reply, sources });
        }
        if (conversationId) {
          await processTurn({
            conversationId,
            userMessage: args.message,
            assistantReply: reply,
            pageUrl: args.pageUrl ?? null,
          });
        }
      });
    },
  });
}

/** Stream a ready-made reply (cache hit) in one shot, then the trailer. */
function oneShot(
  enc: TextEncoder,
  reply: string,
  sources: SourceDoc[],
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(enc.encode(reply));
      controller.enqueue(enc.encode(trailer(sources)));
      controller.close();
    },
  });
}

/** Best-effort transcript log for the cache-hit path. */
async function persistTurn(
  sessionId: string,
  userMessage: string,
  reply: string,
  assistantMeta: Record<string, unknown>,
): Promise<void> {
  try {
    const conversationId = await getOrCreateConversation(sessionId);
    await addMessages(conversationId, [
      { role: "user", content: userMessage },
      { role: "assistant", content: reply, metadata: assistantMeta },
    ]);
  } catch (err) {
    console.error("[rag] cache-hit persist failed (continuing)", err);
  }
}
