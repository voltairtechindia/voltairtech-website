import Link from "next/link";
import Image from "next/image";

import { Kicker } from "./atoms/Kicker";
import { getFeaturedCaseStudies, type FeaturedCaseStudy } from "@/lib/industries/db";

/** Real, DB-backed proof: one case study per top sector. Renders nothing if none. */
export async function HomeProof() {
  let studies: FeaturedCaseStudy[] = [];
  try {
    studies = await getFeaturedCaseStudies(3);
  } catch {
    studies = [];
  }
  if (studies.length === 0) return null;

  return (
    <section className="section section--ink" id="proof">
      <div className="container">
        <div className="section-head">
          <div className="section-head__left">
            <Kicker>[&nbsp;02&nbsp;] Proof · shipped work</Kicker>
            <h2 className="proof__title">How we&apos;ve put AI to work.</h2>
            <p className="proof__lead">
              Real builds across sectors. The problem, what we shipped, and the result.
            </p>
          </div>
          <div className="section-head__right">
            <Link className="btn btn-ghost" href="/industries">
              All sectors
            </Link>
          </div>
        </div>

        <div className="proof-grid">
          {studies.map((s) => (
            <Link
              key={s.industrySlug}
              href={`/industries/${s.industrySlug}`}
              className="proof-card"
              data-reveal=""
            >
              <span className="proof-card__sector">{s.industryTitle}</span>
              <div className="proof-card__media">
                <Image
                  src={`/images/cases/${s.industrySlug}.png`}
                  alt={s.title}
                  width={320}
                  height={180}
                  className="proof-card__img"
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>
              <h3 className="proof-card__title">{s.title}</h3>
              {s.challenge && (
                <p className="proof-card__line">
                  <span className="proof-card__line-k">Challenge</span>
                  {s.challenge}
                </p>
              )}
              {s.outcome && (
                <p className="proof-card__line">
                  <span className="proof-card__line-k">Outcome</span>
                  {s.outcome}
                </p>
              )}
              {s.metrics.length > 0 && (
                <div className="proof-card__metrics">
                  {s.metrics.map((m) => (
                    <div key={m.label} className="proof-card__metric">
                      <b>{m.value}</b>
                      <span>{m.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {s.tech_stack.length > 0 && (
                <div className="proof-card__stack">
                  {s.tech_stack.slice(0, 4).map((t) => (
                    <span key={t} className="proof-card__tech">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
