import type { Metadata } from "next";
import { PageLayout } from "@/components/PageLayout";
import { WhyIndia } from "@/components/WhyIndia";
import { Process } from "@/components/Process";
import { SectionHead } from "@/components/atoms/SectionHead";
import { Kicker } from "@/components/atoms/Kicker";
import { ServiceGlyph } from "@/components/atoms/ServiceGlyph";
import { Arr } from "@/components/atoms/Arr";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Voltair Tech - Drones, AI and Robotics, Made in India",
  description:
    "Voltair Tech is a Mumbai technology company working on drones, AI, and robotics and IoT. Advisory for Indian drone makers, AI chatbots and automation.",
  alternates: { canonical: "https://www.voltairtech.com/about" },
  openGraph: {
    url: "https://www.voltairtech.com/about",
    title: "About Voltair Tech - Drones, AI and Robotics, Made in India",
    description:
      "A Mumbai technology company working on drones, AI, and robotics and IoT, and backing drones made in India.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const CAPABILITIES = [
  { icon: "drone", title: "Drones",                line: "Indian drone partners and drone systems." },
  { icon: "chat",  title: "Chat and voice agents", line: "Answering customers at any hour." },
  { icon: "auto",  title: "Automating the busywork", line: "The copy and paste jobs, gone." },
  { icon: "robot", title: "Robotics and IoT",      line: "Machines and sensors that talk to software." },
];

const STEPS = [
  { n: "01", label: "Talk",        text: "One call. One deadline. No upsell." },
  { n: "02", label: "Agree",       text: "Design and plan settled in 24 hours." },
  { n: "03", label: "Build",       text: "Progress every day. Live on the agreed date." },
];

const FOUNDER_STATS = [
  { v: "5+ yrs", l: "Across India's UAV & drone industry" },
  { v: "DGCA", l: "Certified Remote Pilot (Micro & Small)" },
  { v: "Advisor", l: "Drone Consultant for past 1 year" },
  { v: "DRI Expert", l: "Detection, Recognition & Identification optics" },
];

const FOUNDER_EXPERIENCE = [
  "Led drone R&D, component procurement, calibration, and field test flights across Nano, Micro, Small, and FPV platforms",
  "DRI specialist: turning drones from mere flying toys into mission-ready tools with HD optics for Detection, Recognition, and Identification across civil and defence use",
  "Advisor to Indian drone OEMs including Preflight Labs LLP (Goa) and several emerging Indian drone startups",
  "Set up SOPs, PoC testing workflows, pilot training programmes, and drone labs for colleges and innovation hubs",
  "Built the Voltair Drone Simulator from hands-on field and DGCA training experience",
  "Applies real-world hardware and robotics engineering discipline to practical AI and connected systems",
];

export default function AboutPage() {
  return (
    <PageLayout footerNum="07">

      {/* ── 01 Who We Are ── */}
      <section className="section">
        <div className="container">
          <div className="about-hero-split">
            <div className="about-hero-split__copy">
              <div className="about-hero-split__top">
                <Kicker>Who We Are</Kicker>
                <span className="tag"><span className="pulse" />Mumbai, India</span>
              </div>
              <h1 className="h-display about-hero-split__h">
                Drones, AI and robotics. Made in India.
              </h1>
              <p className="about-intro">
                Voltair Tech is a Mumbai technology company. Drones come first: we build drone
                technology and advise Indian drone makers. Alongside, we build AI
                software and connect robots and devices, for teams across India, the EU, and APAC.
              </p>
              <div className="about-hero-split__ctas">
                <Link className="btn btn-primary" href="/drones">
                  Explore drones <Arr />
                </Link>
                <Link className="btn btn-ghost" href="/contact">
                  Contact us
                </Link>
              </div>
            </div>

            <div className="about-trio">
              <Link href="/drones" className="about-trio__card about-trio__card--lead">
                <div className="about-trio__media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/drones/preflight/talon.webp"
                    alt="TALON-1 Indian hybrid VTOL drone and radio controller"
                    width={720}
                    height={543}
                  />
                </div>
                <div className="about-trio__bar">
                  <span className="about-trio__k">01 · Drones</span>
                  <span className="about-trio__t">OEM advisory, R&amp;D, labs &amp; simulator</span>
                </div>
              </Link>

              <Link href="/contact" className="about-trio__card">
                <div className="about-trio__media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/about-robotics.webp"
                    alt="Autonomous mobile rover and robotic arm with telemetry tablet"
                    width={1000}
                    height={750}
                  />
                </div>
                <div className="about-trio__bar">
                  <span className="about-trio__k">02 · Robotics</span>
                  <span className="about-trio__t">Sensors, rovers &amp; hardware</span>
                </div>
              </Link>

              <Link href="/services" className="about-trio__card">
                <div className="about-trio__media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/about-ai.webp"
                    alt="Business AI tools on phone and laptop"
                    width={1000}
                    height={750}
                  />
                </div>
                <div className="about-trio__bar">
                  <span className="about-trio__k">03 · AI Software</span>
                  <span className="about-trio__t">Chatbots, voice &amp; automation</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 About the Founder ── */}
      <section className="section section--ink" id="founder">
        <div className="container">
          <SectionHead
            kicker="About the Founder"
            title={<>Started in drones.{" "}<br />Built for the field.</>}
            right={<span className="tag"><span className="pulse" />Harshal Vadgama</span>}
          />

          <div className="founder-grid">
            <aside className="founder-card">
              <div className="founder-card__photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/founder-harshal.webp"
                  alt="Harshal Vadgama, Founder of Voltair Tech"
                  width={900}
                  height={900}
                />
              </div>
              <div className="founder-card__meta">
                <h3 className="founder-card__name">Harshal Vadgama</h3>
                <span className="founder-card__role">Founder · Drone Advisor &amp; DGCA Pilot</span>
                <a
                  className="btn btn-ghost btn-sm founder-card__link"
                  href="https://www.linkedin.com/in/harshal-vadgama/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn profile <Arr />
                </a>
              </div>
            </aside>

            <div className="founder-body">
              <blockquote className="founder-quote">
                &ldquo;Turned my hobby into my profession. Said yes to the fun builds, and money followed.
                The script is already written; we are just here for the ride.&rdquo;
              </blockquote>

              <p className="founder-copy">
                With over 5 years across India&apos;s unmanned aviation ecosystem, Harshal has worked hands-on across
                drone R&amp;D, flight testing, DRI (Detection, Recognition, and Identification) camera payloads, and drone
                consulting. Today he leads Voltair Tech in Mumbai and advises Indian drone manufacturers, startups, and
                college drone labs on building, testing, and scaling Make-in-India UAV systems.
              </p>

              <div className="founder-stats">
                {FOUNDER_STATS.map((s) => (
                  <div key={s.v} className="founder-stat">
                    <strong>{s.v}</strong>
                    <span>{s.l}</span>
                  </div>
                ))}
              </div>

              <ul className="founder-points">
                {FOUNDER_EXPERIENCE.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 03 What We Build ── */}
      <section className="section">
        <div className="container">
          <SectionHead
            kicker="What We Build"
            title={<>What we{" "}<br />build.</>}
          />
          <div className="about-caps">
            {CAPABILITIES.map((c) => (
              <div key={c.icon} className="about-cap">
                <div className="about-cap__icon"><ServiceGlyph kind={c.icon} /></div>
                <h3 className="about-cap__title">{c.title}</h3>
                <p className="about-cap__line">{c.line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 The Edge ── */}
      <section className="section section--ink">
        <div className="container">
          <SectionHead
            kicker="The Voltair Edge"
            title={<>48 hours,{" "}<br />not 6 months.</>}
            right={<span className="tag"><span className="pulse" style={{ background: "var(--v-lime)" }} />days · not months</span>}
          />

          <div className="about-steps">
            {STEPS.map((s) => (
              <div key={s.n} className="about-step">
                <span className="about-step__n">{s.n}</span>
                <div>
                  <span className="about-step__label">{s.label}</span>
                  <p className="about-step__text">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission CTA ── */}
      <section className="section">
        <div className="container">
          <div className="mission-box">
            <span className="kicker" style={{ color: "var(--v-ink-fg-3)", marginBottom: "var(--s-4)" }}>
              <span className="dot" style={{ background: "var(--v-lime)", borderRadius: 1, boxShadow: "0 0 0 4px rgba(46,69,216,0.16)" }} />
              Our Mission
            </span>
            <h2 className="mission-box__h">
              Make <em>AI</em> useful to ordinary businesses.
            </h2>
            <p className="mission-box__lead">
              Most of what AI is good at is work people are doing by hand today.
              We build the software that takes it off them.
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Link className="btn btn-primary" href="/contact">
                Contact us <Arr />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <WhyIndia num="05" />
      <Process num="06" />
    </PageLayout>
  );
}
