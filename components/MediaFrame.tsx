/**
 * The one renderer for a single `MediaItem`: a photo, a self-hosted clip, or a
 * YouTube/Vimeo embed.
 *
 * Every surface that shows media goes through this — the service, industry and
 * sector sub-service galleries (`MediaGallery`), the /live-projects dialog
 * (`ProjectShowcase`), and blog posts (`BlogMedia`). They each own their own
 * frame and chrome, but the player itself is identical everywhere: the same
 * embed rewrite and parameters, the same `allow` list, the same controls. When
 * these were three separate copies they had already drifted on the embed URL.
 *
 * Not a client component: it has no state. The galleries that mount it decide
 * *when* a video appears, which is what keeps a page from booting several
 * players on arrival.
 */
import Image from "next/image";

import { toEmbedSrc } from "@/lib/embed";
import type { MediaItem } from "@/lib/blog/types";

export function MediaFrame({
  item,
  fit = "cover",
  sizes = "100vw",
  priority = false,
  title,
}: {
  item: MediaItem;
  /** "contain" for mixed shapes (a portrait brochure next to a 16:9 demo). */
  fit?: "cover" | "contain";
  sizes?: string;
  priority?: boolean;
  /** Accessible name for an embed, when the caption is not descriptive. */
  title?: string;
}) {
  if (item.type === "image") {
    return (
      <Image
        src={item.url}
        alt={item.alt ?? ""}
        fill
        sizes={sizes}
        style={{ objectFit: fit }}
        priority={priority}
      />
    );
  }

  if (item.type === "video") {
    return (
      <video controls preload="metadata" poster={item.poster} playsInline controlsList="nodownload">
        <source src={item.url} />
        Your browser does not support embedded video.
      </video>
    );
  }

  return (
    <iframe
      src={toEmbedSrc(item.url, item.provider)}
      title={item.caption ?? title ?? "Video"}
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}
