import Link from "next/link";

import { customServiceSlug } from "@/lib/industries/custom";
import type { IndustryCustomService } from "@/lib/industries/types";
import type { ServiceCard } from "@/lib/services/types";
import { ServiceGlyph } from "./atoms/ServiceGlyph";

/** Shared inner content for a service card (catalogue or custom). */
function CardBody({
  num,
  title,
  bullets,
  summary,
  eta,
  icon,
  coverUrl,
  coverAlt,
  glyphSize,
  compact,
  showArrow,
}: {
  num: number;
  title: string;
  bullets?: string[] | null;
  summary?: string | null;
  eta?: string | null;
  icon?: string | null;
  coverUrl?: string | null;
  coverAlt?: string | null;
  glyphSize: number;
  compact: boolean;
  showArrow: boolean;
}) {
  return (
    <>
      {showArrow ? <span className="svc-card__arrow">↗</span> : null}
      {coverUrl ? (
        <div className="svc-card__cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverUrl} alt={coverAlt ?? title} loading="lazy" decoding="async" />
        </div>
      ) : (
        <div style={{ width: glyphSize, height: glyphSize, marginTop: compact ? 14 : 22 }}>
          <ServiceGlyph kind={icon} />
        </div>
      )}
      <h3 className="svc-card__title">{title}</h3>
      {bullets?.length ? (
        <ul className="svc-card__bullets">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      ) : summary ? (
        <p className="svc-card__bullets">{summary}</p>
      ) : null}
      {eta ? (
        <div className="svc-card__eta">
          ETA: <b>{eta}</b>
        </div>
      ) : null}
    </>
  );
}

/**
 * Presentational grid of service cards. Shared by the /services index
 * (components/Services.tsx) and the /industries/<slug> detail page, which shows
 * the sector's curated subset of catalogue services PLUS any inline `custom`
 * (sector-only) services — both render in the same grid. Catalogue cards link to
 * /services/<slug>; custom cards link to their own detail page under
 * `customBaseHref` (i.e. /industries/<industry>/<service>). The card number uses
 * the service's own `position` when set, else its index in the grid.
 */
export function ServiceCardGrid({
  services,
  custom = [],
  customBaseHref,
  compact = false,
}: {
  services: ServiceCard[];
  custom?: IndustryCustomService[];
  customBaseHref?: string;
  compact?: boolean;
}) {
  const glyphSize = compact ? 40 : 56;
  return (
    <div className={`svc-grid${compact ? " svc-grid--compact" : ""}`}>
      {services.map((s, i) => (
        <Link
          key={s.slug}
          href={`/services/${s.slug}`}
          className={`svc-card${s.cover_image?.url ? " svc-card--media" : ""}`}
          aria-label={s.title}
        >
          <CardBody
            num={s.position || i + 1}
            title={s.title}
            bullets={s.bullets}
            summary={s.summary}
            eta={s.eta}
            icon={s.icon}
            coverUrl={s.cover_image?.url}
            coverAlt={s.cover_image?.alt}
            glyphSize={glyphSize}
            compact={compact}
            showArrow
          />
        </Link>
      ))}

      {custom.map((c, i) => {
        const slug = customServiceSlug(c);
        const href = customBaseHref ? `${customBaseHref}/${slug}` : undefined;
        const body = (
          <CardBody
            num={services.length + i + 1}
            title={c.title}
            bullets={c.bullets}
            summary={c.summary}
            eta={c.eta}
            icon={c.icon}
            coverUrl={c.cover_image?.url}
            coverAlt={c.cover_image?.alt}
            glyphSize={glyphSize}
            compact={compact}
            showArrow={Boolean(href)}
          />
        );

        return href ? (
          <Link
            key={slug}
            href={href}
            className={`svc-card${c.cover_image?.url ? " svc-card--media" : ""}`}
            aria-label={c.title}
          >
            {body}
          </Link>
        ) : (
          <div key={slug} className="svc-card svc-card--static">
            {body}
          </div>
        );
      })}
    </div>
  );
}
