/**
 * The /live-projects contact sheet.
 *
 * Two earlier cuts failed for the same reason: they made the reader travel to
 * find out what the studio has built. Ten stacked editorial spreads ran to
 * roughly fifteen screens; turning that sideways into a snap rail only traded
 * vertical distance for a gesture people don't expect on a marketing page.
 *
 * So the index is ONE glance: a grid of cards, each carrying the product's
 * cover, what it is, where it runs and its headline figure. Depth is opt-in —
 * a card is a link to that product's own page (`/live-projects/<slug>`), which
 * replaced the detail dialog: a real URL that can be shared, indexed and
 * linked, rather than a modal that only existed while the index was open.
 *
 * Server component: nothing here has state any more.
 */

import Image from "next/image";
import Link from "next/link";

import { LIFECYCLE_LABEL, type LiveProject, type MediaItem } from "@/lib/live-projects/types";

const isMoving = (m: MediaItem) => m.type === "video" || m.type === "embed";

function Card({ project, index }: { project: LiveProject; index: number }) {
  const videos = project.media.filter(isMoving).length;
  // One figure on the card — the rest wait for the project's own page. Any
  // more and the grid stops being scannable, which is the entire point of it.
  const stat = project.stats[0];

  return (
    <Link className="lp-card" href={`/live-projects/${project.slug}`}>
      <span className="lp-card__thumb">
        {project.cover_image?.url ? (
          <Image
            src={project.cover_image.url}
            alt=""
            fill
            sizes="(max-width: 620px) 92vw, (max-width: 1000px) 46vw, 24vw"
            style={{ objectFit: "cover", objectPosition: "top center" }}
            priority={index < 4}
          />
        ) : null}
        {videos ? (
          <span className="lp-card__play" aria-hidden="true">
            ▶ {videos}
          </span>
        ) : null}
        <span className={`lp-card__led lp-card__led--${project.lifecycle}`} aria-hidden="true" />
      </span>

      <span className="lp-card__body">
        <span className="lp-card__head">
          <span className="lp-card__num">{String(index + 1).padStart(2, "0")}</span>
          {project.kicker ? <span className="lp-card__kicker">{project.kicker}</span> : null}
        </span>

        <span className="lp-card__name">{project.name}</span>
        {project.tagline ? <span className="lp-card__tagline">{project.tagline}</span> : null}

        <span className="lp-card__foot">
          {stat ? (
            <span className="lp-card__stat">
              <b>{stat.value}</b> {stat.label}
            </span>
          ) : (
            <span className="lp-card__stat" />
          )}
          <span className="lp-card__status">{LIFECYCLE_LABEL[project.lifecycle]}</span>
        </span>
      </span>
    </Link>
  );
}

export function ProjectShowcase({ projects }: { projects: LiveProject[] }) {
  return (
    <div className="lp-grid">
      {projects.map((p, i) => (
        <Card key={p.slug} project={p} index={i} />
      ))}
    </div>
  );
}
