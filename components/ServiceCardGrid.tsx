import Link from "next/link";

import type { ServiceCard } from "@/lib/services/types";
import { ServiceGlyph } from "./atoms/ServiceGlyph";

/**
 * Presentational grid of service cards. Shared by the /services index
 * (components/Services.tsx) and the /industries/<slug> detail page, which shows
 * the sector's curated subset. The card number uses the service's own
 * `position` when set, else its index in the grid.
 */
export function ServiceCardGrid({
  services,
  compact = false,
}: {
  services: ServiceCard[];
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
          <span className="svc-card__num">[ {String(s.position || i + 1).padStart(2, "0")} ]</span>
          <span className="svc-card__arrow">↗</span>
          {s.cover_image?.url ? (
            <div className="svc-card__cover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.cover_image.url}
                alt={s.cover_image.alt ?? s.title}
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : (
            <div style={{ width: glyphSize, height: glyphSize, marginTop: compact ? 14 : 22 }}>
              <ServiceGlyph kind={s.icon} />
            </div>
          )}
          <h3 className="svc-card__title">{s.title}</h3>
          {s.bullets?.length ? (
            <ul className="svc-card__bullets">
              {s.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : s.summary ? (
            <p className="svc-card__bullets">{s.summary}</p>
          ) : null}
          {s.eta ? (
            <div className="svc-card__eta">
              ETA: <b>{s.eta}</b>
            </div>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
