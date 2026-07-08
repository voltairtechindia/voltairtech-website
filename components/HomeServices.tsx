import Link from "next/link";

import { Kicker } from "./atoms/Kicker";
import { ServiceCardGrid } from "./ServiceCardGrid";
import { listPublishedServices } from "@/lib/services/db";
import { listPublishedIndustries } from "@/lib/industries/db";
import type { ServiceCard } from "@/lib/services/types";
import type { IndustryCard } from "@/lib/industries/types";

/**
 * DB-backed internal-link hub on the home page: the published service catalogue
 * (deep links to /services/<slug>) plus the sectors we serve (links to
 * /industries/<slug>). Anchors use the real DB titles, so they can never point
 * at a slug that isn't published. Mirrors HomeProof's resilient pattern —
 * renders nothing if the DB is unreachable at build/ISR time.
 */
export async function HomeServices() {
  let services: ServiceCard[] = [];
  let industries: IndustryCard[] = [];
  try {
    services = (await listPublishedServices(1, 8)).items;
  } catch {
    services = [];
  }
  try {
    industries = (await listPublishedIndustries(1, 8)).items;
  } catch {
    industries = [];
  }
  if (services.length === 0) return null;

  return (
    <section className="section" id="services" aria-label="AI services we build">
      <div className="container">
        <div className="section-head">
          <div className="section-head__left">
            <Kicker>What we build · Mumbai</Kicker>
            <h2 className="h-display" style={{ marginTop: "16px" }}>
              Production AI apps, automations &amp; RAG systems.
            </h2>
            <p className="lead" style={{ marginTop: "16px" }}>
              AI, RAG &amp; chatbot development in Mumbai — pick the build that fits your
              business, or ask us to scope a custom one.
            </p>
          </div>
          <div className="section-head__right">
            <Link className="btn btn-ghost" href="/services">
              All services
            </Link>
          </div>
        </div>

        <ServiceCardGrid services={services} compact />

        {industries.length ? (
          <p className="home-sectors meta">
            <span className="home-sectors__label">
              AI services for Indian businesses, by sector:
            </span>{" "}
            {industries.map((ind, i) => (
              <span key={ind.slug}>
                <Link href={`/industries/${ind.slug}`}>{ind.title}</Link>
                {i < industries.length - 1 ? " · " : ""}
              </span>
            ))}
            {" · "}
            <Link href="/industries">all sectors →</Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
