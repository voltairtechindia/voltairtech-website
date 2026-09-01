"use client";

/**
 * Inline photo/video gallery for a service or industry detail page.
 *
 * Same `MediaItem` shape (and the same `toEmbedSrc` rewrite) as the blog and
 * /live-projects, so a clip uploaded in the admin behaves identically wherever
 * it's shown. Unlike the live-projects gallery this one is NOT inside a dialog,
 * so it has to be careful about weight: video and embeds mount only once the
 * visitor selects that slide — arriving on a page with four demos must not boot
 * four players. Images are eager only for the opening slide.
 *
 * A single item renders as one framed figure with no chrome; the strip appears
 * from two items up.
 */

import Image from "next/image";
import { useEffect, useState } from "react";

import { isMovingMedia } from "@/lib/media";
import type { MediaItem } from "@/lib/blog/types";
import { MediaFrame } from "./MediaFrame";

export function MediaGallery({
  media,
  heading,
  lede,
}: {
  media: MediaItem[];
  heading?: string;
  lede?: string;
}) {
  const [at, setAt] = useState(0);

  // A different page reusing the same mounted gallery starts at its own first
  // slide rather than inheriting the previous one's index.
  const key = media[0]?.url ?? "";
  useEffect(() => setAt(0), [key]);

  if (!media.length) return null;
  const item = media[Math.min(at, media.length - 1)];

  return (
    <section className="mg" aria-label={heading ?? "Gallery"}>
      {heading ? (
        <header className="mg__head">
          <h2 className="mg__title">{heading}</h2>
          {lede ? <p className="mg__lede">{lede}</p> : null}
        </header>
      ) : null}

      <figure className="mg__figure">
        <div className={`mg__stage mg__stage--${isMovingMedia(item) ? "motion" : "still"}`}>
          <MediaFrame
            item={item}
            sizes="(max-width: 900px) 94vw, 820px"
            priority={at === 0}
          />
        </div>
        {item.caption ? <figcaption className="mg__caption">{item.caption}</figcaption> : null}
      </figure>

      {media.length > 1 ? (
        <div className="mg__strip" role="tablist" aria-label="Choose a photo or video">
          {media.map((m, i) => (
            <button
              key={`${m.url}-${i}`}
              type="button"
              role="tab"
              className={`mg__thumb${i === at ? " is-on" : ""}`}
              onClick={() => setAt(i)}
              aria-selected={i === at}
              aria-label={
                m.caption ?? `${m.type === "image" ? "Photo" : "Video"} ${i + 1} of ${media.length}`
              }
            >
              {m.type === "image" ? (
                <Image src={m.url} alt="" fill sizes="120px" style={{ objectFit: "cover" }} />
              ) : m.type === "video" && m.poster ? (
                <>
                  <Image src={m.poster} alt="" fill sizes="120px" style={{ objectFit: "cover" }} />
                  <span className="mg__play" aria-hidden="true">▶</span>
                </>
              ) : (
                <span className="mg__play mg__play--solo" aria-hidden="true">▶</span>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
