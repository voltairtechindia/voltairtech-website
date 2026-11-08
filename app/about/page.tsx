import type { Metadata } from "next";
import { PageLayout } from "@/components/PageLayout";
import { WhyIndia } from "@/components/WhyIndia";
import { Process } from "@/components/Process";
import { SectionHead } from "@/components/atoms/SectionHead";
import { ServiceGlyph } from "@/components/atoms/ServiceGlyph";
import { Arr } from "@/components/atoms/Arr";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Voltair Tech - Drones, AI and Robotics, Made in India",
  description:
    "Voltair Tech is a Mumbai technology company working on drones, AI, and robotics and IoT. Free RPTO drone simulator, advisory for Indian drone makers, AI chatbots and automation.",
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
  { icon: "drone", title: "Drones",                line: "A free RPTO simulator and Indian drone partners." },
  { icon: "chat",  title: "Chat and voice agents", line: "Answering customers at any hour." },
  { icon: "auto",  title: "Automating the busywork", line: "The copy and paste jobs, gone." },
  { icon: "robot", title: "Robotics and IoT",      line: "Machines and sensors that talk to software." },
];

const STEPS = [
  { n: "01", label: "Talk",        text: "One call. One deadline. No upsell." },
  { n: "02", label: "Agree",       text: "Design and plan settled in 24 hours." },
  { n: "03", label: "Build",       text: "Progress every day. Live on the agreed date." },
];

export default function AboutPage() {
  return (
    <PageLayout footerNum="06">

      {/* ── 01 Who We Are ── */}
      <section className="section">
        <div className="container">
          <SectionHead
            as="h1"
            kicker="Who We Are"
            title={<>Drones, AI and{" "}<br />robotics. Made in India.</>}
            right={<span className="tag"><span className="pulse" />Mumbai, India</span>}
          />
          <p className="about-intro">
            Voltair Tech is a Mumbai technology company. Drones come first: we make a free
            RPTO drone simulator and advise Indian drone makers. Alongside, we build AI
            software and connect robots and devices, for teams across India, the EU, and APAC.
          </p>
        </div>
      </section>

      {/* ── 02 The Edge ── */}
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

      {/* ── 04 Mission CTA ── */}
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

      <WhyIndia num="04" />
      <Process num="05" />
    </PageLayout>
  );
}
