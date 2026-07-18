import Link from "next/link";
import { Kicker } from "./atoms/Kicker";
import { Arr } from "./atoms/Arr";
import { HeroPrompt } from "./HeroPrompt";
import { BuildLog } from "./BuildLog";

export function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero__mesh" />
      <div className="hero__grain" />
      <div className="hero__grid">
        <div className="hero__copy">
          <div className="hero__eyebrow">
            <Kicker>AI Services Providers · Mumbai</Kicker>
          </div>
          <h1 className="hero__h">
            Build <span className="red">AI</span>
            <br />
            for India.
          </h1>
          <p className="hero__sub">
            <strong>Apps, automations, chatbots, RAG, full software</strong>, engineered
            with AI by a Mumbai team.{" "}
            <strong className="red-strong">Websites ship in 48 hours.</strong> Larger
            products on a fixed timeline.
          </p>
          <HeroPrompt />
          <div className="hero__ctas">
            <Link className="btn btn-primary" href="/contact">
              Start a project <Arr />
            </Link>
            <Link className="btn btn-ghost" href="/services">
              See what we build
            </Link>
          </div>
          <div className="hero__proof">
            <div className="hero__proof-item">
              <b>42+</b>shipped since 2024
            </div>
            <div className="hero__proof-item">
              <b>28</b>clients · IN / EU / APAC
            </div>
            <div className="hero__proof-item">
              <b>99.9%</b>uptime · last 90d
            </div>
            <div className="hero__proof-item">
              <b>10+</b>languages · voice + text
            </div>
          </div>
        </div>
        <BuildLog />
      </div>
    </section>
  );
}
