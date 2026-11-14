import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { SectionHead } from "@/components/atoms/SectionHead";
import { Kicker } from "@/components/atoms/Kicker";
import { Arr } from "@/components/atoms/Arr";
import { DroneHeroStage } from "@/components/DroneHeroStage";
import { ADVISORY_PARTNERS, DRONE_PRODUCTS, SIMULATOR } from "@/lib/drones";
import { SITE_URL, breadcrumbLd } from "@/lib/seo";

const TITLE = "Drones by Voltair Tech - Advisory, R&D, Training Labs and Simulator";
const DESCRIPTION =
  "Voltair Tech's drone division in India: OEM advisory for Indian drone companies, R&D and field flight testing, drone labs and pilot training, defence and commercial UAVs, and the Voltair Drone Simulator Trial Version.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/drones` },
  openGraph: {
    url: `${SITE_URL}/drones`,
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/drones/preflight/cobra.webp"],
  },
};

const DIVISION_PILLARS = [
  {
    n: "01",
    t: "OEM Advisory",
    d: "Technical, workflow, and go-to-market advisory for Indian drone and component makers.",
  },
  {
    n: "02",
    t: "Field R&D & PoC",
    d: "On-site flight testing, SOP validation, calibration, and high-altitude endurance trials.",
  },
  {
    n: "03",
    t: "Labs & Training",
    d: "Complete drone lab setups for colleges alongside DGCA-aligned pilot readiness.",
  },
  {
    n: "04",
    t: "Simulator & AI",
    d: "RPTO flight simulation software plus AI and telemetry links for live operations.",
  },
];

const DRONE_ASPECTS = [
  {
    n: "01",
    badge: "Active",
    title: "Indian Drone OEM Advisory",
    line: "We advise Indian drone startups and manufacturers on aircraft selection, testing workflows, positioning, and reaching defence, commercial, and training buyers.",
  },
  {
    n: "02",
    badge: "Active",
    title: "R&D, PoC & Field Testing",
    line: "Hands-on flight testing, Mission Planner setup, SOP creation and validation, and on-site proof-of-concept deployments across challenging terrain.",
  },
  {
    n: "03",
    badge: "Institutes",
    title: "College Drone Lab Setup",
    line: "End-to-end drone labs for engineering colleges and academies: simulator stations, trainer kits, safety SOPs, and instructor onboarding.",
  },
  {
    n: "04",
    badge: "Training",
    title: "Pilot & Team Training",
    line: "Structured pilot skill development led by DGCA-certified experience, covering pre-flight checks, emergency handling, and field discipline.",
  },
  {
    n: "05",
    badge: "Coming soon",
    title: "Defence & Counter-Drone",
    line: "Surveillance VTOLs and non-kinetic net interceptors built with Indian partners for border security, airfields, and critical installations.",
  },
  {
    n: "06",
    badge: "Coming soon",
    title: "Type-Certified Commercial UAVs",
    line: "Survey, infrastructure inspection, and agriculture drones integrated with live dashboards, automated reporting, and Indian components.",
  },
];

export default function DronesPage() {
  const sim = DRONE_PRODUCTS.find((p) => p.slug === "simulator");
  const partner = ADVISORY_PARTNERS[0];

  return (
    <PageLayout footerNum="03">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd([{ label: "Home", href: "/" }, { label: "Drones" }])),
        }}
      />

      <div className="drones-theme">
        {/* ── 01 Aerospace Hero with Right-Side Drone Stage ── */}
        <section className="section section--ink drones-hero-band">
          <div className="drones-hero-band__gridbg" aria-hidden="true" />
          <div className="container drones-hero-band__inner">
            <div className="drones-hero-split">
              <div className="drones-hero-split__copy">
                <div className="drones-hero-split__top">
                  <Kicker>Voltair Drones Division</Kicker>
                  <span className="tag"><span className="pulse" />Make in India</span>
                </div>

                <h1 className="drones-hero-split__h">
                  Indian drones,{" "}
                  <span className="drones-red">from R&amp;D to flight.</span>
                </h1>

                <p className="drones-hero-split__lead">
                  Drones are our core focus. We advise Indian drone manufacturers, run field R&amp;D and PoC
                  testing, set up college drone labs, and build our RPTO flight simulator.
                </p>

                <div className="drones-hero-split__ctas">
                  <Link className="btn btn-primary" href="/drones/advisory">
                    Explore drone advisory <Arr />
                  </Link>
                  <Link className="btn btn-ghost" href="/drones/simulator">
                    Simulator Trial Version
                  </Link>
                </div>

                <div className="drones-pillars">
                  {DIVISION_PILLARS.map((p) => (
                    <div key={p.n} className="drones-pillar">
                      <span className="drones-pillar__n">{p.n}</span>
                      <h2 className="drones-pillar__t">{p.t}</h2>
                      <p className="drones-pillar__d">{p.d}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="drones-hero-split__visual">
                <DroneHeroStage />
              </div>
            </div>
          </div>
        </section>

        {/* ── 02 Advisory & Indian Drone Partners ── */}
        <section className="section drones-steel-band">
          <div className="container">
            <div className="section-head">
              <div className="section-head__left">
                <Kicker>Advisory &amp; Indian OEMs</Kicker>
                <h2 className="h1" style={{ marginTop: "var(--s-3)" }}>
                  Advising and scaling drones made in India.
                </h2>
                <p className="lead" style={{ marginTop: "var(--s-3)" }}>
                  We work alongside Indian drone makers like {partner.name} ({partner.location}) and emerging UAV startups
                  on product testing, field readiness, and customer reach.
                </p>
              </div>
              <div className="section-head__right">
                <Link className="btn btn-primary" href="/drones/advisory">
                  Explore advisory <Arr />
                </Link>
              </div>
            </div>

            <div className="drones-fleet">
              {partner.drones.map((d) => (
                <Link key={d.slug} href={`/drones/advisory#${partner.slug}`} className="drones-fleet-card">
                  <div className="drones-fleet-card__media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.img} alt={`${d.name} - ${d.role}`} width={720} height={543} loading="lazy" />
                  </div>
                  <div className="drones-fleet-card__body">
                    <span className="drones-fleet-card__tag">{d.tag}</span>
                    <h3 className="drones-fleet-card__name">{d.name}</h3>
                    <p className="drones-fleet-card__role">{d.role}</p>
                    <div className="drones-fleet-card__stat">
                      {d.stats[0].label}: {d.stats[0].value} · {d.stats[1].label}: {d.stats[1].value}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Full Drone Capabilities ── */}
        <section className="section section--ink">
          <div className="container">
            <SectionHead
              kicker="What we do in drones"
              title={<>Advisory, labs,{" "}<br />testing and software.</>}
              right={
                <Link className="btn btn-ghost" href="/contact">
                  Discuss a drone project <Arr />
                </Link>
              }
            />

            <div className="drones-scope-grid">
              {DRONE_ASPECTS.map((item) => (
                <article key={item.n} className="drones-scope-card">
                  <div className="drones-scope-card__head">
                    <span className="drones-scope-card__n">{item.n}</span>
                    <span className={item.badge === "Active" ? "drone-status drone-status--live" : "drone-status"}>
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="drones-scope-card__title">{item.title}</h3>
                  <p className="drones-scope-card__line">{item.line}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 04 Drone Simulator (Trial Version & AV3) ── */}
        {sim ? (
          <section className="section drones-steel-band">
            <div className="container">
              <SectionHead
                kicker="Training Software"
                title={<>Voltair Drone{" "}<br />Simulator.</>}
                right={<span className="tag"><span className="pulse" />Windows &amp; Mac</span>}
              />
              <Link href={sim.href!} className="drone-feature">
                <div className="drone-feature__media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={SIMULATOR.img("v35-home")} alt="Voltair Drone Simulator V3.5 home screen" width={1600} height={748} />
                </div>
                <div className="drone-feature__body">
                  <span className="drone-status drone-status--live">Trial Version</span>
                  <h3 className="drone-feature__title">{sim.title}</h3>
                  <p className="drone-feature__line">{sim.line}</p>
                  <ul className="drone-feature__points">
                    <li>RPTO test with marks, as per DGCA guidelines</li>
                    <li>13 DGCA flying exercises and theory lessons</li>
                    <li>AV3 full edition available for RPTOs, colleges and defence units</li>
                  </ul>
                  <span className="btn btn-primary">See the simulator <Arr /></span>
                </div>
              </Link>
            </div>
          </section>
        ) : null}

        {/* ── 05 Work With Us CTA ── */}
        <section className="section section--ink">
          <div className="container">
            <div className="adv-more">
              <div>
                <span className="drone-status drone-status--live">Make in India</span>
                <h2 className="adv-more__h">Building drones, components, or a training lab?</h2>
                <p className="adv-more__p">
                  Whether you need advisory for an Indian UAV startup, on-site PoC testing, or a complete college
                  drone lab setup, talk directly with our Mumbai team.
                </p>
              </div>
              <div className="adv-more__cta">
                <Link className="btn btn-primary" href="/contact">Contact us <Arr /></Link>
                <Link className="btn btn-ghost" href="/drones/advisory">See advisory work</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
