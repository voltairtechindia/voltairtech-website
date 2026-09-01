import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

import { Arr } from "./atoms/Arr";
import { breadcrumbLd } from "@/lib/seo";
import type { MediaItem } from "@/lib/blog/types";

type Crumb = { label: string; href?: string };

/** A fact chip in the hero rail: delivery time, price, whatever is true. */
export type HeroFact = { label: string; value: string };

/**
 * The opening band of a service, industry, or sector sub-service page.
 *
 * Replaces the narrow prose masthead these pages used to share with the legal
 * pages, which made every one of them read as an article. The job here is to
 * answer "what is this and what will it cost me" above the fold, then show the
 * thing rather than describe it: the picture sits beside the words instead of
 * arriving eight paragraphs down.
 */
export function DetailHero({
  crumbs,
  kicker,
  title,
  lead,
  facts = [],
  visual,
  visualAlt,
  clips = 0,
  ctaLabel = "Get a price",
  ctaHref = "#enquire",
  glyph,
}: {
  crumbs: Crumb[];
  kicker?: string;
  title: ReactNode;
  lead?: ReactNode;
  facts?: HeroFact[];
  visual?: string | null;
  visualAlt?: string;
  /** Playable items in the gallery below, surfaced as a "2 videos" badge. */
  clips?: number;
  ctaLabel?: string;
  ctaHref?: string;
  glyph?: ReactNode;
}) {
  return (
    <section className="dhero">
      {crumbs.length > 1 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(crumbs)) }}
        />
      ) : null}
      <div className="container">
        <nav className="dhero__crumb" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <span key={c.label}>
              {c.href ? <Link href={c.href}>{c.label}</Link> : c.label}
              {i < crumbs.length - 1 ? <span className="dhero__slash">/</span> : null}
            </span>
          ))}
        </nav>

        <div className="dhero__grid">
          <div className="dhero__copy">
            {kicker ? <p className="dhero__kicker">{kicker}</p> : null}
            <h1 className="dhero__h">{title}</h1>
            {lead ? <p className="dhero__lead">{lead}</p> : null}

            <div className="dhero__ctas">
              <Link className="btn btn-primary" href={ctaHref}>
                {ctaLabel} <Arr />
              </Link>
              <Link className="btn btn-ghost" href="/live-projects">
                See what we have built
              </Link>
            </div>

            {facts.length ? (
              <dl className="dhero__facts">
                {facts.map((f) => (
                  <div key={f.label} className="dhero__fact">
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          <div className="dhero__visual">
            {visual ? (
              <>
                <Image
                  src={visual}
                  alt={visualAlt ?? ""}
                  fill
                  sizes="(max-width: 980px) 94vw, 46vw"
                  style={{ objectFit: "cover" }}
                  priority
                />
                {clips > 0 ? (
                  <span className="dhero__clips">
                    ▶ {clips} {clips === 1 ? "video" : "videos"}
                  </span>
                ) : null}
              </>
            ) : (
              <div className="dhero__glyph">{glyph}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** The first image in a gallery, used as the hero visual when there is no cover. */
export function firstImage(media: MediaItem[]): { url: string; alt?: string } | null {
  for (const m of media) {
    if (m.type === "image") return { url: m.url, alt: m.alt };
    if (m.type === "video" && m.poster) return { url: m.poster };
  }
  return null;
}
