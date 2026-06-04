import type { Metadata } from "next";
import { PageLayout } from "@/components/PageLayout";
import { WhyIndia } from "@/components/WhyIndia";
import { Process } from "@/components/Process";
import { SectionHead } from "@/components/atoms/SectionHead";

export const metadata: Metadata = {
  title: "About Voltair Tech — Mumbai's AI Build Studio",
  description:
    "Voltair Tech is a Mumbai-based AI build studio shipping production apps, chatbots, automations and RAG systems. Indian operators, global standards — websites in 48 hours, DPDP Act 2023 compliant, Razorpay-native.",
  alternates: { canonical: "https://voltairtech.com/about" },
  openGraph: {
    url: "https://voltairtech.com/about",
    title: "About Voltair Tech — Mumbai's AI Build Studio",
    description:
      "Indian operators, global standards. We ship AI websites in 48 hours and larger products on a fixed timeline. 42+ products shipped since 2024.",
  },
};

export default function AboutPage() {
  return (
    <PageLayout>
      <section className="section">
        <div className="container">
          <SectionHead
            kicker="[ 01 ] About Voltair Tech"
            title={<>Mumbai&apos;s AI<br />build studio.</>}
            right={<span className="tag"><span className="pulse" />since 2024</span>}
          />
          <p className="lead" style={{ maxWidth: 760 }}>
            Voltair Tech is an AI services studio in Andheri West, Mumbai. We build
            apps, automations, chatbots, RAG systems and full custom software —
            engineered with AI by a team that ships on IST and answers on WhatsApp.
          </p>
          <p className="body" style={{ maxWidth: 760, marginTop: "20px" }}>
            We work with Indian startups, enterprises and global teams that need a
            fast build partner without the agency overhead. Marketing websites go
            live in 48 hours; larger products land on a fixed timeline with a single
            success metric and a single deadline. Every project is DPDP Act 2023
            compliant, Razorpay-native, and 100% yours at hand-off. 42+ products
            shipped since 2024.
          </p>
        </div>
      </section>
      <WhyIndia />
      <Process />
    </PageLayout>
  );
}
