/**
 * One blog media item: a photo, a self-hosted clip, or a YouTube/Vimeo embed.
 *
 * Video and embeds are the shared `MediaFrame`, the same player behind the
 * service/industry galleries and the /live-projects dialog. This component owns
 * only the blog's own frame: a full-width figure with a centred caption, and a
 * padded-box wrapper for embeds since `MediaFrame` renders those to fill.
 * Photos stay a plain <img> here (no fixed stage, so they keep their own
 * height and the article flows around them).
 */
import type { MediaItem } from "@/lib/blog/types";
import { MediaFrame } from "./MediaFrame";

export default function BlogMedia({ item }: { item: MediaItem }) {
  if (item.type === "image") {
    return (
      <figure className="blog-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt={item.alt ?? ""} loading="lazy" decoding="async" />
        {item.caption ? <figcaption>{item.caption}</figcaption> : null}
      </figure>
    );
  }

  if (item.type === "video") {
    return (
      <figure className="blog-media">
        <MediaFrame item={item} />
        {item.caption ? <figcaption>{item.caption}</figcaption> : null}
      </figure>
    );
  }

  return (
    <figure className="blog-media">
      <div className="blog-embed">
        <MediaFrame item={item} title="Embedded video" />
      </div>
      {item.caption ? <figcaption>{item.caption}</figcaption> : null}
    </figure>
  );
}
