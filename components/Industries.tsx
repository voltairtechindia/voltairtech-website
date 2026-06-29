import Link from "next/link";
import Image from "next/image";

import type { IndustryCard } from "@/lib/industries/types";
import { industryIconSrc } from "@/lib/industries/icons";
import { SectionHead } from "./atoms/SectionHead";
import { CoverImage } from "./atoms/CoverImage";

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
    <section id="industries" className="section">
      <div className="container">
        <SectionHead
          as="h1"
          kicker="Industries"
          title={<>Built for your<br />industry.</>}
          right={<span className="tag"><span className="pulse" />sector-shaped AI</span>}
        />
        <p className="lead" style={{ maxWidth: 760 }}>
          Every sector runs a little differently, so we don&apos;t ship the same
          build twice. We take what we already do well (fast websites, chatbots,
          RAG search, and workflow automation) and shape it around how your
          industry actually works. Pick yours to see the services that fit.
        </p>
        {industries.length === 0 ? (
          <p className="meta" style={{ marginTop: 24 }}>No industries published yet.</p>
        ) : (
          <div className="svc-grid" style={{ marginTop: "var(--s-6)" }}>
            {industries.map((it) => (
              <Link
                key={it.slug}
                href={`/industries/${it.slug}`}
                className={`svc-card svc-card--white${it.cover_image?.url ? " svc-card--media" : ""}`}
                aria-label={it.title}
              >
                <span className="svc-card__arrow">↗</span>
                {it.cover_image?.url ? (
                  <div className="svc-card__cover">
                    <CoverImage
                      src={it.cover_image.url}
                      alt={it.cover_image.alt ?? it.title}
                    />
                  </div>
                ) : null}
                <h3 className="svc-card__title">{it.title}</h3>
                <div className="svc-card__body">
                  {it.bullets?.length ? (
                    <ul className="svc-card__bullets">
                      {it.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  ) : it.summary ? (
                    <p className="svc-card__bullets">{it.summary}</p>
                  ) : null}
                  <div className="svc-card__icon">
                    {/* Per-industry badge override, else the bucket-served default
                        for the icon key (both Supabase URLs, optimised via
                        next/image now that the host is in remotePatterns). */}
                    <Image
                      src={it.icon_image?.url ?? industryIconSrc(it.icon)}
                      alt={it.icon_image?.alt ?? ""}
                      width={96}
                      height={96}
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="svc-card__cta">Click to know more →</div>
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
