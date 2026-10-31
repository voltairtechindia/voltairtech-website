import type { ServiceCard } from "@/lib/services/types";
import { SectionHead } from "./atoms/SectionHead";
import { ServiceCardGrid } from "./ServiceCardGrid";

export function Services({
  services,
  perPage = 8,
}: {
  services: ServiceCard[];
  perPage?: number;
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
          <ServiceCardGrid
            services={services}
            paged={{ perPage: perPage, basePath: "/services", label: "Services pages" }}
          />
        )}
      </div>
    </section>
  );
}
