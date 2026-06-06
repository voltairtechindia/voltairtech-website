import type { Metadata } from "next";
import { PageLayout } from "@/components/PageLayout";
import { WhyIndia } from "@/components/WhyIndia";
import { Process } from "@/components/Process";
import { SectionHead } from "@/components/atoms/SectionHead";
import { ServiceGlyph } from "@/components/atoms/ServiceGlyph";
import { Arr } from "@/components/atoms/Arr";
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
      "Based in Mumbai, India, VoltairTech is a high-velocity AI development and software engineering firm. We bridge the gap between complex AI and practical business applications.",
  },
};

const SOLUTIONS = [
  {
    n: "01",
    title: "Custom AI & RAG Solutions",
    desc: "We unlock the value of your proprietary data. By implementing advanced Retrieval-Augmented Generation (RAG) and tailoring Large Language Models (LLMs), we build contextual AI systems that understand your specific business logic, data, and workflows.",
    icon: "rag",
  },
  {
    n: "02",
    title: "Rapid Full-Stack Development",
    desc: "We build highly responsive, modern web applications utilizing a premium tech stack (Next.js, React, Node.js). From landing pages to intricate enterprise portals, our applications are engineered for speed, SEO, and flawless user experiences.",
    icon: "web",
  },
  {
    n: "03",
    title: "Intelligent Workflow Automation",
    desc: "We eliminate operational bottlenecks. Our team designs and deploys autonomous AI agents and seamless system integrations that handle repetitive tasks, sync data across platforms, and scale your operations without increasing headcount.",
    icon: "auto",
  },
  {
    n: "04",
    title: "Conversational AI & Agents",
    desc: "We design and train hyper-capable chatbots that go beyond basic script-following. Our conversational agents handle customer support, lead qualification, and internal queries with natural, human-like accuracy.",
    icon: "chat",
  },
];

export default function AboutPage() {
  return (
    <PageLayout footerNum="06">
      {/* SECTION 1: Who We Are */}
      <section className="section">
        <div className="container">
          <SectionHead
            kicker="[ 01 ] Who We Are"
            title={<>Bridging the gap between<br />complex AI &amp; business.</>}
            right={<span className="tag"><span className="pulse" />Mumbai, India</span>}
          />
          <div className="about-grid" style={{ marginTop: "var(--s-6)" }}>
            <div>
              <p className="lead" style={{ marginBottom: "var(--s-4)" }}>
                Based in Mumbai, India, VoltairTech is a high-velocity AI development and software engineering firm.
              </p>
              <p className="body" style={{ fontSize: "16px", lineHeight: "1.65" }}>
                We bridge the gap between complex artificial intelligence and practical business applications.
                Operating at the intersection of speed and precision, we engineer production-ready websites,
                intelligent chatbots, robust RAG (Retrieval-Augmented Generation) systems, and custom workflow
                automations for forward-thinking clients across India, the European Union, and the APAC region.
              </p>
            </div>
            <div style={{
              background: "var(--v-paper-2)",
              border: "1.5px solid var(--border)",
              borderRadius: "var(--r-3)",
              padding: "var(--s-6)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--s-3)",
            }}>
              <span className="mono-lbl" style={{ color: "var(--v-red)" }}>Core Engineering Hub</span>
              <h3 className="h3" style={{ margin: 0 }}>Mumbai, India</h3>
              <p className="body" style={{ fontSize: "14px", margin: 0 }}>
                Andheri West · Maharashtra · 400053<br />
                <span style={{ opacity: 0.6 }}>Coords: 19.1300° N, 72.8300° E</span>
              </p>
              <div style={{ display: "flex", gap: "var(--s-3)", marginTop: "var(--s-2)", flexWrap: "wrap" }}>
                <span className="tag"><span className="pulse" />On-site IST Operators</span>
                <span className="tag">WhatsApp Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: The Voltair Edge: Built for Speed */}
      <section className="section section--ink">
        <div className="container">
          <SectionHead
            kicker="[ 02 ] The Voltair Edge"
            title={<>Built for Speed.<br />Built for Leverage.</>}
            right={<span className="tag"><span className="pulse" style={{ background: "var(--v-lime)" }} />days · not months</span>}
          />
          
          <div className="about-grid" style={{ marginTop: "var(--s-6)" }}>
            <div>
              <p className="lead" style={{ color: "var(--v-ink-fg-2)", marginBottom: "var(--s-5)" }}>
                In a world where technology moves daily, waiting months for software deployment is no longer an option.
              </p>
              <p className="body" style={{ color: "var(--v-ink-fg-2)", marginBottom: "var(--s-4)" }}>
                We pioneer a high-velocity development model designed to get your ideas into production faster than traditional agencies can schedule a second meeting.
              </p>
              <p className="body" style={{ color: "var(--v-ink-fg-2)" }}>
                We don&apos;t just build software; we build leverage. By combining cutting-edge AI frameworks with rapid full-stack architecture, we deliver robust, scalable digital solutions in days, not months.
              </p>
            </div>
            
            <div style={{
              background: "var(--v-ink-3)",
              border: "1.5px solid var(--v-ink-line)",
              borderRadius: "var(--r-3)",
              padding: "var(--s-6)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--s-5)",
            }}>
              <div>
                <span className="mono-lbl" style={{ color: "var(--v-lime)" }}>Voltair Velocity Model</span>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--s-3)", borderBottom: "1px solid var(--v-ink-line)", paddingBottom: "var(--s-2)" }}>
                  <span style={{ fontWeight: 600 }}>Traditional Agencies</span>
                  <span style={{ color: "var(--v-red)", fontWeight: 700 }}>3 - 6 Months</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--s-3)", borderBottom: "1px solid var(--v-ink-line)", paddingBottom: "var(--s-2)" }}>
                  <span style={{ fontWeight: 600 }}>VoltairTech</span>
                  <span style={{ color: "var(--v-lime)", fontWeight: 700 }}>48 Hours - 2 Weeks</span>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
                <span className="mono-lbl">The Velocity Blueprint</span>
                <div style={{ display: "flex", gap: "var(--s-3)", alignItems: "center" }}>
                  <span style={{ background: "var(--v-red)", color: "var(--v-paper)", width: "24px", height: "24px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", flexShrink: 0 }}>1</span>
                  <span style={{ fontSize: "14px", color: "var(--v-ink-fg-2)" }}><b>Scoping:</b> Direct scoping call, one deadline, no upsell</span>
                </div>
                <div style={{ display: "flex", gap: "var(--s-3)", alignItems: "center" }}>
                  <span style={{ background: "var(--v-red)", color: "var(--v-paper)", width: "24px", height: "24px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", flexShrink: 0 }}>2</span>
                  <span style={{ fontSize: "14px", color: "var(--v-ink-fg-2)" }}><b>Token Lock:</b> Design tokens, repos &amp; architecture locked</span>
                </div>
                <div style={{ display: "flex", gap: "var(--s-3)", alignItems: "center" }}>
                  <span style={{ background: "var(--v-red)", color: "var(--v-paper)", width: "24px", height: "24px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", flexShrink: 0 }}>3</span>
                  <span style={{ fontSize: "14px", color: "var(--v-ink-fg-2)" }}><b>Hyper-Ship:</b> Daily Loom builds &amp; instant production launch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: What We Do */}
      <section className="section">
        <div className="container">
          <SectionHead
            kicker="[ 03 ] What We Do"
            title={<>AI-native development.<br />Production-ready systems.</>}
            right={<span className="meta mono-lbl">Custom AI · Web · Automation · Chat</span>}
          />
          <div className="about-solutions-grid" style={{ marginTop: "var(--s-6)" }}>
            {SOLUTIONS.map((s) => (
              <div key={s.n} className="about-card">
                <span className="about-card__num">[ {s.n} ]</span>
                <div className="about-card__icon">
                  <ServiceGlyph kind={s.icon} />
                </div>
                <h3 className="about-card__title">{s.title}</h3>
                <p className="about-card__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Our Global Footprint */}
      <section className="section section--ink">
        <div className="container">
          <SectionHead
            kicker="[ 04 ] Global Footprint"
            title={<>Mumbai core.<br />Global reach.</>}
            right={<span className="tag"><span className="pulse" />India · EU · APAC</span>}
          />
          <div className="about-grid" style={{ marginTop: "var(--s-6)" }}>
            <div>
              <p className="lead" style={{ color: "var(--v-ink-fg-2)", marginBottom: "var(--s-5)" }}>
                From our core engineering hub in Mumbai, we serve a diverse global clientele.
              </p>
              <p className="body" style={{ color: "var(--v-ink-fg-2)" }}>
                Whether you are a fast-growing startup in the APAC region, an established enterprise in the EU navigating strict data guidelines, or an Indian business looking to digitize at scale, VoltairTech provides the localized understanding and technical excellence required to succeed.
              </p>
            </div>
            
            <div style={{
              background: "var(--v-ink-3)",
              border: "1.5px solid var(--v-ink-line)",
              borderRadius: "var(--r-3)",
              padding: "var(--s-6)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--s-4)",
            }}>
              <span className="mono-lbl" style={{ color: "var(--v-red)" }}>Regional Capabilities</span>
              
              <div style={{ borderBottom: "1px solid var(--v-ink-line)", paddingBottom: "var(--s-3)" }}>
                <h4 style={{ color: "var(--v-ink-fg)", margin: "0 0 4px 0", fontSize: "15px", fontWeight: "bold" }}>India</h4>
                <p style={{ color: "var(--v-ink-fg-3)", margin: 0, fontSize: "13px" }}>Razorpay-native builds, UPI integrations, localized scalability.</p>
              </div>
              
              <div style={{ borderBottom: "1px solid var(--v-ink-line)", paddingBottom: "var(--s-3)" }}>
                <h4 style={{ color: "var(--v-ink-fg)", margin: "0 0 4px 0", fontSize: "15px", fontWeight: "bold" }}>European Union</h4>
                <p style={{ color: "var(--v-ink-fg-3)", margin: 0, fontSize: "13px" }}>GDPR-compliant setups, secure data guidelines, self-hosted LLMs.</p>
              </div>
              
              <div>
                <h4 style={{ color: "var(--v-ink-fg)", margin: "0 0 4px 0", fontSize: "15px", fontWeight: "bold" }}>APAC Region</h4>
                <p style={{ color: "var(--v-ink-fg-3)", margin: 0, fontSize: "13px" }}>High-performance streaming apps, multi-language (text &amp; voice) support.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Our Mission */}
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
              To democratize cutting-edge AI technology through hyper-fast, reliable, and production-ready development—helping businesses automate the present and engineer the future.
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Link className="btn btn-primary" href="/contact">
                Start a project <Arr />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* RETAINED SECTIONS: Process & Why India */}
      <WhyIndia />
      <Process num="07" />
    </PageLayout>
  );
}
