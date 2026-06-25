/**
 * Browser-side helpers shared by the corner ChatWidget and the inline Hero
 * demo so a visitor's conversation threads together server-side (same
 * `session_id`) and both parse the streamed reply the same way.
 */
import type { SourceRef } from "@/lib/site-map";

const SESSION_KEY = "voltair_chat_session";

/** Stable per-browser session id so a conversation threads together server-side. */
export function getChatSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "sess_ephemeral_" + Date.now().toString(36);
  }
}

/** Record separator splitting the streamed reply from its JSON trailer. */
export const RS = "";

/** Split a (possibly partial) stream buffer into the reply text + parsed sources trailer. */
export function splitTrailer(buf: string): { reply: string; sources: SourceRef[] } {
  const i = buf.indexOf(RS);
  if (i < 0) return { reply: buf, sources: [] };
  let sources: SourceRef[] = [];
  try {
    const meta = JSON.parse(buf.slice(i + 1) || "{}") as { sources?: SourceRef[] };
    if (Array.isArray(meta.sources)) sources = meta.sources;
  } catch {
    /* ignore a malformed trailer */
  }
  return { reply: buf.slice(0, i), sources };
}

/**
 * Event the hero launcher fires to open the corner chat widget, optionally with
 * a question to ask immediately: `detail: { ask?: string }`.
 */
export const OPEN_CHAT_EVENT = "voltair:open-chat";
