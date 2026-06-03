import Link from "next/link";
import type { ServiceCard } from "@/lib/services/types";
import { SectionHead } from "./atoms/SectionHead";
import { ServiceGlyph } from "./atoms/ServiceGlyph";

export function Services({
  services,
  page = 1,
  pageCount = 1,
}: {
  services: ServiceCard[];
  page?: number;
  pageCount?: number;
}) {
  return (
    <section id="services" className="section section--ink">
      <div className="container">
        <SectionHead
          kicker="[ 02 ] What we build"
          title={<>What we<br />build.</>}
          right={<span className="tag"><span className="pulse" />websites ship in 48 hrs</span>}
        />
        {services.length === 0 ? (
          <p className="meta" style={{ marginTop: 24 }}>No services published yet.</p>
        ) : (
          <div className="svc-grid">
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
                  <div style={{ width: 56, height: 56, marginTop: 22 }}>
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
                    ETA — <b>{s.eta}</b>
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        )}

        {pageCount > 1 ? (
          <nav className="pagination" aria-label="Services pages">
            {page > 1 ? (
              <Link className="pagination__btn" href={`/services?page=${page - 1}`}>← Prev</Link>
            ) : (
              <span className="pagination__btn is-disabled">← Prev</span>
            )}
            <span className="pagination__status">Page {page} of {pageCount}</span>
            {page < pageCount ? (
              <Link className="pagination__btn" href={`/services?page=${page + 1}`}>Next →</Link>
            ) : (
              <span className="pagination__btn is-disabled">Next →</span>
            )}
          </nav>
        ) : null}
      </div>
    </section>
  );
}
