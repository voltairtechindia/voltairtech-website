import Link from "next/link";
import type { ServiceCard } from "@/lib/services/types";
import { SectionHead } from "./atoms/SectionHead";
import { ServiceCardGrid } from "./ServiceCardGrid";

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
          as="h1"
          kicker="What we build"
          title={<>What we{" "}<br />build.</>}
          right={<span className="tag"><span className="pulse" />websites go live in 48 hours</span>}
        />
        {services.length === 0 ? (
          <p className="meta" style={{ marginTop: 24 }}>Nothing here yet.</p>
        ) : (
          <ServiceCardGrid services={services} />
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
