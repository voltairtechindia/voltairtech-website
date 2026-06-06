import type { Metadata } from "next";
import { PageLayout } from "@/components/PageLayout";
import { WhyIndia } from "@/components/WhyIndia";
import { Process } from "@/components/Process";
import { SectionHead } from "@/components/atoms/SectionHead";

export const metadata: Metadata = {
  title: "About Voltair Tech - Mumbai's AI Build Studio",
  description:
    "Voltair Tech is a Mumbai-based AI build studio shipping production apps, chatbots, automations and RAG systems. Indian operators, global standards. Websites in 48 hours, Razorpay-native.",
  alternates: { canonical: "https://voltairtech.com/about" },
  openGraph: {
    url: "https://voltairtech.com/about",
    title: "About Voltair Tech - Mumbai's AI Build Studio",
    description:
      "Indian operators, global standards. We ship AI websites in 48 hours and larger products on a fixed timeline. 42+ products shipped since 2024.",
  },
};

const PRINCIPLES = [
  {
    n: "01",
    t: "Fixed price",
    d: "One success metric, one deadline, and a number that doesn't move mid-build. No scope creep, no surprise invoice at the end.",
  },
  {
    n: "02",
    t: "Real builds",
    d: "Real CMS, real auth, real LLM calls from hour one. We don't hand you mock screens and a slide deck you can't actually ship.",
  },
  {
    n: "03",
    t: "You own it",
    d: "Code, docs and dashboards are 100% yours at hand-off. Keep us on a retainer or walk away clean. It's your call, not a contract trap.",
  },
  {
    n: "04",
    t: "We pick up",
    d: "We work on IST and answer on WhatsApp through the day. When something breaks or you have a question, a founder actually picks up.",
  },
];

export default function AboutPage() {
  return (
    <PageLayout footerNum="05">
      <section className="section">
        <div className="container">
          <SectionHead
            kicker="[ 01 ] About Voltair Tech"
            title={<>Mumbai&apos;s AI<br />build studio.</>}
            right={<span className="tag"><span className="pulse" />since 2024</span>}
          />
          <p className="lead" style={{ maxWidth: 760 }}>
            Voltair Tech is an AI services studio in Andheri West, Mumbai. We build
            apps, automations, chatbots, RAG systems and full custom software,
            engineered with AI by a small team that ships on IST and answers on
            WhatsApp.
          </p>
          <p className="body" style={{ maxWidth: 760, marginTop: "20px" }}>
            We started Voltair Tech because building software in India usually meant
            choosing the lesser of two headaches: an agency that wants three months
            and a budget to match, or a freelancer who goes quiet halfway through.
            We&apos;re the third option: senior people who scope tight, build in the
            open, and actually ship. Marketing websites go live in 48 hours. Bigger
            products like apps, RAG systems, chatbots and automations land on a fixed
            timeline with one success metric and one deadline, both agreed up front.
          </p>
          <p className="body" style={{ maxWidth: 760, marginTop: "20px" }}>
            We work with Indian startups, enterprises and global teams that want a
            fast build partner without the agency overhead. Every project is
            Razorpay-native and 100% yours at hand-off, with no lock-in and no licence
            games. 42+ products shipped since 2024 for 28 clients across India, the
            EU and APAC.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead
            kicker="[ 02 ] How we work"
            title={<>A few things we<br />don&apos;t bend on.</>}
            right={<span className="meta mono-lbl">scope tight · ship · hand off</span>}
          />
          <div className="proc-grid">
            {PRINCIPLES.map((p) => (
              <div key={p.n} className="proc-step">
                <div className="proc-step__n">{p.n}</div>
                <div className="proc-step__t">{p.t}.</div>
                <p className="proc-step__d">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhyIndia />
      <Process num="04" />
    </PageLayout>
  );
}
