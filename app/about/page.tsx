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
  title: "About VoltairTech - High-Velocity AI Development & Software Engineering",
  description:
    "Based in Mumbai, India, VoltairTech is a high-velocity AI development and software engineering firm. We bridge the gap between complex AI and practical business applications.",
  alternates: { canonical: "https://voltairtech.com/about" },
  openGraph: {
    url: "https://voltairtech.com/about",
    title: "About VoltairTech - High-Velocity AI Development & Software Engineering",
    description:
      "Based in Mumbai, India, VoltairTech is a high-velocity AI development and practical business applications.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const CAPABILITIES = [
  { icon: "rag",  title: "Custom AI & RAG",        line: "Your data, made intelligent." },
  { icon: "web",  title: "Full-Stack Web",          line: "Fast, modern, production-ready." },
  { icon: "auto", title: "Workflow Automation",     line: "Eliminate bottlenecks at scale." },
  { icon: "chat", title: "Conversational Agents",   line: "Support, qualify, answer — 24/7." },
];

const STEPS = [
  { n: "01", label: "Scoping",     text: "One call. One deadline. No upsell." },
  { n: "02", label: "Token Lock",  text: "Design, repo & architecture locked in 24 h." },
  { n: "03", label: "Hyper-Ship",  text: "Daily builds. Production launch on schedule." },
];

export default function AboutPage() {
  return (
    <PageLayout footerNum="06">

      {/* ── 01 Who We Are ── */}
      <section className="section">
        <div className="container">
          <SectionHead
            as="h1"
            kicker="[ 01 ] Who We Are"
            title={<>Mumbai's AI<br />build studio.</>}
            right={<span className="tag"><span className="pulse" />Mumbai, India</span>}
          />
          <p className="about-intro">
            VoltairTech is a high-velocity AI development firm.
            We turn complex AI into production-ready products — for startups
            and enterprises across India, the EU, and APAC.
          </p>
        </div>
      </section>

      {/* ── 02 The Edge ── */}
      <section className="section section--ink">
        <div className="container">
          <SectionHead
            kicker="[ 02 ] The Voltair Edge"
            title={<>48 hours,<br />not 6 months.</>}
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
            kicker="[ 03 ] What We Build"
            title={<>AI-native.<br />Production-ready.</>}
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
              <span className="dot" style={{ background: "var(--v-lime)", boxShadow: "0 0 0 4px rgba(217,255,0,0.2)" }} />
              Our Mission
            </span>
            <h2 className="mission-box__h">
              Democratizing cutting-edge <em>AI</em>.
            </h2>
            <p className="mission-box__lead">
              Hyper-fast, reliable, production-ready AI development — helping
              businesses automate the present and engineer the future.
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Link className="btn btn-primary" href="/contact">
                Start a project <Arr />
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
