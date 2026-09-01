"use client";

/**
 * The /live-projects showcase — a contact sheet, not a scroll.
 *
 * Two earlier cuts failed for the same reason: they made the reader travel to
 * find out what the studio has built. Ten stacked editorial spreads ran to
 * roughly fifteen screens; turning that sideways into a snap rail only traded
 * vertical distance for a gesture people don't expect on a marketing page.
 *
 * So the whole portfolio is now ONE glance: a grid of cards, each carrying the
 * product's cover, what it is, where it runs and its headline figure. Depth is
 * opt-in — clicking a card opens a detail dialog with that project's media
 * gallery (screenshots and demo videos), the full summary, every figure, the
 * highlights, the stack and the brochure.
 *
 * Details that matter:
 *   · A card is a real <button> so the grid is keyboard-reachable in order.
 *   · Opening a project writes #slug to the URL (replaceState, so it doesn't
 *     stack history entries), and a #slug on load opens that project — the
 *     deep links the old anchored spreads gave us still work.
 *   · Video only ever mounts inside an OPEN dialog, so the page never boots
 *     ten YouTube players on arrival.
 *   · Body scroll locks while the dialog is open, and focus moves to it and
 *     returns to the card that opened it on close.
 */

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { toEmbedSrc } from "@/lib/embed";
import {
  LIFECYCLE_LABEL,
  type LiveProject,
  type MediaItem,
} from "@/lib/live-projects/types";
import { Arr } from "./atoms/Arr";

/** "1.1 MB" — shown on the brochure button when the row records a size. */
function fileSize(bytes?: number): string | null {
  if (!bytes || bytes <= 0) return null;
  const mb = bytes / 1_048_576;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

/** The cover counts as the first slide, so a project always has a gallery. */
function slidesFor(p: LiveProject): MediaItem[] {
  const cover: MediaItem[] = p.cover_image?.url
    ? [
        {
          type: "image",
          url: p.cover_image.url,
          alt: p.cover_image.alt ?? `${p.name} brochure cover`,
        },
      ]
    : [];
  return [...cover, ...p.media];
}

const isMoving = (m: MediaItem) => m.type === "video" || m.type === "embed";

/* ─────────────────────────── card ─────────────────────────── */

function Card({
  project,
  index,
  onOpen,
}: {
  project: LiveProject;
  index: number;
  onOpen: (slug: string, el: HTMLButtonElement) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const videos = project.media.filter(isMoving).length;
  // One figure on the card — the rest wait for the dialog. Any more and the
  // grid stops being scannable, which is the entire point of it.
  const stat = project.stats[0];

  return (
    <button
      ref={ref}
      type="button"
      className="lp-card"
      onClick={() => ref.current && onOpen(project.slug, ref.current)}
      aria-haspopup="dialog"
    >
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
          {project.kicker ? (
            <span className="lp-card__kicker">{project.kicker}</span>
          ) : null}
        </span>

        <span className="lp-card__name">{project.name}</span>
        {project.tagline ? (
          <span className="lp-card__tagline">{project.tagline}</span>
        ) : null}

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
    </button>
  );
}

/* ───────────────────────── dialog gallery ───────────────────────── */

function Gallery({ project }: { project: LiveProject }) {
  const slides = slidesFor(project);
  const [at, setAt] = useState(0);

  // A new project in the same dialog starts at its own first slide.
  useEffect(() => setAt(0), [project.slug]);

  if (!slides.length) return null;
  const item = slides[Math.min(at, slides.length - 1)];

  // A brochure cover is A4 portrait; a demo is 16:9. One fixed stage ratio
  // letterboxes one of them into a sliver, so the stage follows the item.
  const motion = isMoving(item);

  return (
    <div className="lp-gallery">
      <div className={`lp-stage lp-stage--${motion ? "motion" : "still"}`}>
        {item.type === "image" ? (
          <Image
            src={item.url}
            alt={item.alt ?? ""}
            fill
            sizes="(max-width: 900px) 92vw, 46vw"
            style={{ objectFit: "contain" }}
          />
        ) : item.type === "video" ? (
          <video controls autoPlay={false} preload="metadata" poster={item.poster} playsInline>
            <source src={item.url} />
            Your browser does not support embedded video.
          </video>
        ) : (
          <iframe
            src={toEmbedSrc(item.url, item.provider)}
            title={item.caption ?? `${project.name} — video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>

      {item.caption ? <p className="lp-stage__caption">{item.caption}</p> : null}

      {slides.length > 1 ? (
        <div className="lp-thumbs">
          {slides.map((s, i) => (
            <button
              key={`${s.url}-${i}`}
              type="button"
              className={`lp-thumb${i === at ? " is-on" : ""}`}
              onClick={() => setAt(i)}
              aria-label={`${project.name} media ${i + 1} of ${slides.length}`}
              aria-current={i === at}
            >
              {s.type === "image" ? (
                <Image src={s.url} alt="" fill sizes="88px" style={{ objectFit: "cover" }} />
              ) : (
                <span className="lp-thumb__play" aria-hidden="true">▶</span>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ───────────────────────── dialog ───────────────────────── */

function Detail({
  project,
  index,
  total,
  onClose,
  onStep,
}: {
  project: LiveProject;
  index: number;
  total: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const size = fileSize(project.brochure?.size_bytes);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onStep(1);
      else if (e.key === "ArrowLeft") onStep(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, onStep]);

  return (
    <div className="lp-overlay" onClick={onClose} role="presentation">
      <div
        className="lp-detail"
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={project.name}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="lp-detail__bar">
          <span className="lp-detail__pos">
            {String(index + 1).padStart(2, "0")}
            <span className="lp-detail__sep">/</span>
            {String(total).padStart(2, "0")}
          </span>
          <span className={`lp-status lp-status--${project.lifecycle}`}>
            <span className="lp-status__led" aria-hidden="true" />
            {LIFECYCLE_LABEL[project.lifecycle]}
          </span>
          <div className="lp-detail__nav">
            <button
              type="button"
              className="lp-arrow"
              onClick={() => onStep(-1)}
              disabled={index === 0}
              aria-label="Previous project"
            >
              ←
            </button>
            <button
              type="button"
              className="lp-arrow"
              onClick={() => onStep(1)}
              disabled={index >= total - 1}
              aria-label="Next project"
            >
              →
            </button>
            <button
              type="button"
              className="lp-arrow lp-arrow--close"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="lp-detail__grid">
          <div className="lp-detail__media">
            <Gallery project={project} />
            {project.brochure?.url ? (
              <a className="lp-dl" href={project.brochure.url} target="_blank" rel="noopener">
                <span className="lp-dl__icon" aria-hidden="true">↓</span>
                <span>
                  {project.brochure.label ?? `${project.name} brochure`}
                  <span className="lp-dl__meta">
                    PDF
                    {project.brochure.pages ? ` · ${project.brochure.pages} pages` : ""}
                    {size ? ` · ${size}` : ""}
                  </span>
                </span>
              </a>
            ) : null}
          </div>

          <div className="lp-detail__body">
            {project.kicker ? (
              <span className="lp-detail__kicker">{project.kicker}</span>
            ) : null}
            <h2 className="lp-detail__name">{project.name}</h2>
            {project.tagline ? (
              <p className="lp-detail__tagline">{project.tagline}</p>
            ) : null}
            {project.summary ? (
              <p className="lp-detail__summary">{project.summary}</p>
            ) : null}

            {project.stats.length ? (
              <dl className="lp-stats">
                {project.stats.map((s) => (
                  <div key={`${s.value}-${s.label}`} className="lp-stat">
                    <dt className="lp-stat__value">{s.value}</dt>
                    <dd className="lp-stat__label">{s.label}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {project.highlights.length ? (
              <ul className="lp-points">
                {project.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            ) : null}

            <div className="lp-detail__foot">
              {project.surfaces.length ? (
                <div className="lp-meta__row">
                  <span className="mono-lbl">Surfaces</span>
                  <div className="lp-chips">
                    {project.surfaces.map((s) => (
                      <span key={s} className="lp-chip">{s}</span>
                    ))}
                  </div>
                </div>
              ) : null}
              {project.stack.length ? (
                <div className="lp-meta__row">
                  <span className="mono-lbl">Stack</span>
                  <div className="lp-chips">
                    {project.stack.map((s) => (
                      <span key={s} className="lp-chip lp-chip--muted">{s}</span>
                    ))}
                  </div>
                </div>
              ) : null}
              {project.links.length ? (
                <div className="lp-links">
                  {project.links.map((l) => (
                    <a
                      key={l.href}
                      className="lp-link"
                      href={l.href}
                      {...(l.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener" }
                        : {})}
                    >
                      {l.label} <Arr />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── showcase ───────────────────────── */

export function ProjectShowcase({ projects }: { projects: LiveProject[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  const show = useCallback(
    (i: number) => {
      setOpen(i);
      const slug = projects[i]?.slug;
      if (slug) history.replaceState(null, "", `#${slug}`);
    },
    [projects],
  );

  const openBySlug = useCallback(
    (slug: string, el: HTMLButtonElement) => {
      opener.current = el;
      show(projects.findIndex((p) => p.slug === slug));
    },
    [projects, show],
  );

  const close = useCallback(() => {
    setOpen(null);
    history.replaceState(null, "", window.location.pathname);
    opener.current?.focus();
  }, []);

  const step = useCallback(
    (delta: number) => {
      setOpen((cur) => {
        if (cur === null) return cur;
        const next = Math.max(0, Math.min(projects.length - 1, cur + delta));
        const slug = projects[next]?.slug;
        if (slug) history.replaceState(null, "", `#${slug}`);
        return next;
      });
    },
    [projects],
  );

  // A #slug on arrival opens that project — the old anchored spreads' links.
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace("#", ""));
    if (!hash) return;
    const i = projects.findIndex((p) => p.slug === hash);
    if (i >= 0) setOpen(i);
  }, [projects]);

  return (
    <>
      <div className="lp-grid">
        {projects.map((p, i) => (
          <Card key={p.slug} project={p} index={i} onOpen={openBySlug} />
        ))}
      </div>

      {open !== null && projects[open] ? (
        <Detail
          project={projects[open]}
          index={open}
          total={projects.length}
          onClose={close}
          onStep={step}
        />
      ) : null}
    </>
  );
}
