import Link from "next/link";
import Image from "next/image";

import type { IndustryCard } from "@/lib/industries/types";
import { industryIconSrc } from "@/lib/industries/icons";
import { SectionHead } from "./atoms/SectionHead";
import { PagedGrid } from "./PagedGrid";

/**
 * The /industries index — a grid of sector cards. Each links to
 * /industries/<slug>, which renders the sector's "what you get" copy plus the
 * curated subset of services it links to. /services lists everything; this is
 * the sector lens over it.
 */
export function Industries({
  industries,
  perPage = 8,
}: {
  industries: IndustryCard[];
  perPage?: number;
}) {
  return (
    <section id="industries" className="section">
      <div className="container">
        <SectionHead
          as="h1"
          kicker="Industries"
          title={<>Built for your{" "}<br />industry.</>}
          right={<span className="tag"><span className="pulse" />13 industries</span>}
        />
        <p className="lead" style={{ maxWidth: 720 }}>
          A clinic and a factory both want less admin, but not in the same way.
          Pick your trade to see what we would actually build for it.
        </p>
        {industries.length === 0 ? (
          <p className="meta" style={{ marginTop: 24 }}>
            We are refreshing this list. Tell us your trade and what slows you down, and we
            will reply the same day. <Link href="/contact">Contact us</Link>
          </p>
        ) : (
          <PagedGrid
            className="svc-grid"
            style={{ marginTop: "var(--s-6)" }}
            perPage={perPage}
            basePath="/industries"
            label="Industries pages"
          >
            {industries.map((it) => (
              <Link
                key={it.slug}
                href={`/industries/${it.slug}`}
                className="svc-card svc-card--white"
                aria-label={it.title}
              >
                <span className="svc-card__arrow">↗</span>
                {/* No cover here on purpose. Only some sectors have one, so
                    showing it made a single card in the grid look different
                    from the rest. The cover belongs to /industries/<slug>. */}
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
                <div className="svc-card__cta">See what we build</div>
              </Link>
            ))}
          </PagedGrid>
        )}
      </div>
    </section>
  );
}
