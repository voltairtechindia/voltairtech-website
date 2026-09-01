/**
 * One normaliser for the `MediaItem` galleries that blog posts, services,
 * industries and their sector sub-pages all store.
 *
 * Every write path (POST /api/blog, /api/services, /api/industries) runs the
 * caller's JSON through this before it reaches Supabase, so a malformed item
 * can never reach a page — `BlogMedia` / `MediaGallery` render on `type`
 * alone and would otherwise have to defend themselves. Keeps the accepted
 * shape in one place rather than once per route.
 */
import type { MediaItem } from "@/lib/blog/types";

const VALID_TYPE = new Set(["image", "video", "embed"]);

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Keep only well-formed items: a known type and a non-empty url. */
export function normalizeMedia(v: unknown): MediaItem[] {
  if (!Array.isArray(v)) return [];
  return v.filter((m): m is MediaItem => {
    if (typeof m !== "object" || m === null) return false;
    const item = m as Record<string, unknown>;
    return VALID_TYPE.has(str(item.type)) && Boolean(str(item.url));
  });
}

/** True when an item plays rather than sits still — drives the "▶ n" card badge. */
export function isMovingMedia(m: MediaItem): boolean {
  return m.type === "video" || m.type === "embed";
}
