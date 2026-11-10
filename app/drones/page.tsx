import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { SectionHead } from "@/components/atoms/SectionHead";
import { Arr } from "@/components/atoms/Arr";
import { ADVISORY_PARTNERS, DRONE_PRODUCTS, SIMULATOR } from "@/lib/drones";
import { SITE_URL, breadcrumbLd } from "@/lib/seo";

const TITLE = "Drones by Voltair Tech - Simulator, Training and Drone Labs in India";
const DESCRIPTION =
  "Drone products made in India by Voltair Tech: a free RPTO drone simulator for Windows and Mac, advisory partnerships with Indian drone makers, plus defence and commercial drones, pilot training and drone labs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/drones` },
  openGraph: {
    url: `${SITE_URL}/drones`,
    title: TITLE,
    description: DESCRIPTION,
    images: [SIMULATOR.img("v35-home")],
  },
};

export default function DronesPage() {
  const live = DRONE_PRODUCTS.filter((p) => p.status === "live");
  const soon = DRONE_PRODUCTS.filter((p) => p.status === "soon");
  const partner = ADVISORY_PARTNERS[0];

  return (
    <PageLayout footerNum="03">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd([{ label: "Home", href: "/" }, { label: "Drones" }])),
        }}
      />

      <section className="section drones-hero">
        <div className="container">
          <SectionHead
            as="h1"
            kicker="Voltair Drones"
            title={<>Drones, made{" "}<br />in India.</>}
            right={<span className="tag"><span className="pulse" />Make in India</span>}
          />
          <p className="about-intro">
            We build drone products for pilots, training schools, colleges and defence teams.
            Start with our drone simulator: it is free, and it trains you for the RPTO test on your own computer.
          </p>
        </div>
      </section>

      <section className="section drones-products">
        <div className="container">
          {live.map((p) => (
            <Link key={p.slug} href={p.href!} className="drone-feature">
              <div className="drone-feature__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={SIMULATOR.img("v35-home")} alt="Voltair Drone Simulator V3.5 home screen" width={1600} height={748} />
              </div>
              <div className="drone-feature__body">
                <span className="drone-status drone-status--live">Free download</span>
                <h2 className="drone-feature__title">{p.title}</h2>
                <p className="drone-feature__line">{p.line}</p>
                <ul className="drone-feature__points">
                  <li>RPTO test with marks, as per DGCA guidelines</li>
                  <li>13 DGCA flying exercises and theory lessons</li>
                  <li>Works with your RC radio, a gamepad or the keyboard</li>
                </ul>
                <span className="btn btn-primary">See the simulator <Arr /></span>
              </div>
            </Link>
          ))}

          <Link href="/drones/advisory" className="drones-adv">
            <div>
              <span className="drones-adv__k">Advisory</span>
              <h2 className="drones-adv__h">Indian drones, built together.</h2>
              <p className="drones-adv__p">
                We advise and work alongside Indian drone makers. First partner: {partner.name}, with the
                TALON-1, COBRA VTOL, PFL Trainer and SHRIKE. More coming soon.
              </p>
              <span className="drones-adv__go">See the drones <Arr /></span>
            </div>
            <div className="drones-adv__thumbs">
              {partner.drones.map((d) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={d.slug} src={d.img} alt={d.name} width={720} height={543} loading="lazy" />
              ))}
            </div>
          </Link>

          <div className="drones-soon">
            <span className="drones-soon__label">Coming soon</span>
            <div className="drones-soon__grid">
              {soon.map((p) => (
                <div key={p.slug} className="drone-soon-card">
                  <span className="drone-status">Coming soon</span>
                  <h3 className="drone-soon-card__title">{p.title}</h3>
                  <p className="drone-soon-card__line">{p.line}</p>
                </div>
              ))}
            </div>
            <p className="drones-soon__cta">
              Need one of these now? <Link href="/contact">Tell us what you need</Link> and we will call you back.
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
