import Link from "next/link";

import type { IndustryCard } from "@/lib/industries/types";
import { SectionHead } from "./atoms/SectionHead";
import { IndustryGlyph } from "./atoms/IndustryGlyph";

/**
 * The /industries index — a grid of sector cards. Each links to
 * /industries/<slug>, which renders the sector's "what you get" copy plus the
 * curated subset of services it links to. /services lists everything; this is
 * the sector lens over it.
 */
export function Industries({
  industries,
  page = 1,
  pageCount = 1,
}: {
  industries: IndustryCard[];
  page?: number;
  pageCount?: number;
}) {
  return (
    <section id="industries" className="section section--ink">
      <div className="container">
        <SectionHead
          kicker="[ 01 ] Industries"
          title={<>Built for your<br />industry.</>}
          right={<span className="tag"><span className="pulse" />sector-shaped AI</span>}
        />
        <p className="lead" style={{ maxWidth: 760 }}>
          Get AI built for your industry — not a generic template. We shape the
          same stack (websites, chatbots, RAG, mobile, automation, custom AI) to
          how your sector actually works, in English, Hindi and Marathi. Pick
          yours to see the services that fit.
        </p>
        {industries.length === 0 ? (
          <p className="meta" style={{ marginTop: 24 }}>No industries published yet.</p>
        ) : (
          <div className="svc-grid" style={{ marginTop: "var(--s-6)" }}>
            {industries.map((it, i) => (
              <Link
                key={it.slug}
                href={`/industries/${it.slug}`}
                className={`svc-card${it.cover_image?.url ? " svc-card--media" : ""}`}
                aria-label={it.title}
              >
                <span className="svc-card__num">[ {String(it.position || i + 1).padStart(2, "0")} ]</span>
                <span className="svc-card__arrow">↗</span>
                {it.cover_image?.url ? (
                  <div className="svc-card__cover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.cover_image.url}
                      alt={it.cover_image.alt ?? it.title}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : (
                  <div style={{ width: 56, height: 56, marginTop: 22 }}>
                    <IndustryGlyph kind={it.icon} />
                  </div>
                )}
                <h3 className="svc-card__title">{it.title}</h3>
                {it.bullets?.length ? (
                  <ul className="svc-card__bullets">
                    {it.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : it.summary ? (
                  <p className="svc-card__bullets">{it.summary}</p>
                ) : null}
                {it.service_slugs?.length ? (
                  <div className="svc-card__eta">
                    <b>{it.service_slugs.length}</b> service{it.service_slugs.length === 1 ? "" : "s"} →
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        )}

        {pageCount > 1 ? (
          <nav className="pagination" aria-label="Industries pages">
            {page > 1 ? (
              <Link className="pagination__btn" href={`/industries?page=${page - 1}`}>← Prev</Link>
            ) : (
              <span className="pagination__btn is-disabled">← Prev</span>
            )}
            <span className="pagination__status">Page {page} of {pageCount}</span>
            {page < pageCount ? (
              <Link className="pagination__btn" href={`/industries?page=${page + 1}`}>Next →</Link>
            ) : (
              <span className="pagination__btn is-disabled">Next →</span>
            )}
          </nav>
        ) : null}
      </div>
    </section>
  );
}
