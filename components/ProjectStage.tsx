"use client";

/**
 * The media stage on a project's own page (`/live-projects/<slug>`).
 *
 * Same contract as `MediaGallery`, but centred and sized for a page rather
 * than a column: one stage, a centred strip of thumbnails under it, and a
 * caption. Video and embeds mount only once the visitor picks that slide, so
 * a project with three demos still arrives with zero players running.
 */

import Image from "next/image";
import { useState } from "react";

import { isMovingMedia } from "@/lib/media";
import type { MediaItem } from "@/lib/live-projects/types";
import { MediaFrame } from "./MediaFrame";

export function ProjectStage({ media, name }: { media: MediaItem[]; name: string }) {
  const [at, setAt] = useState(0);

  if (!media.length) return null;
  const item = media[Math.min(at, media.length - 1)];

  return (
    <figure className="pj-gallery">
      <div className={`pj-stage pj-stage--${isMovingMedia(item) ? "motion" : "still"}`}>
        <MediaFrame
          item={item}
          fit="contain"
          sizes="(max-width: 900px) 94vw, 900px"
          priority={at === 0}
          title={`${name} video`}
        />
      </div>

      {item.caption ? <figcaption className="pj-stage__caption">{item.caption}</figcaption> : null}

      {media.length > 1 ? (
        <div className="pj-thumbs">
          {media.map((s, i) => (
            <button
              key={`${s.url}-${i}`}
              type="button"
              className={`pj-thumb${i === at ? " is-on" : ""}`}
              onClick={() => setAt(i)}
              aria-label={`${name} media ${i + 1} of ${media.length}`}
              aria-current={i === at}
            >
              {s.type === "image" ? (
                <Image src={s.url} alt="" fill sizes="96px" style={{ objectFit: "cover" }} />
              ) : (
                <span className="pj-thumb__play" aria-hidden="true">▶</span>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </figure>
  );
}
