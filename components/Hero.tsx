import Link from "next/link";
import { Kicker } from "./atoms/Kicker";
import { Arr } from "./atoms/Arr";
import { HeroPrompt } from "./HeroPrompt";
import { HeroHub } from "./HeroHub";

export function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero__mesh" />
      <div className="hero__grain" />
      <div className="hero__grid">
        <div className="hero__copy">
          <div className="hero__eyebrow">
            <Kicker>AI build studio · Mumbai</Kicker>
          </div>
          <h1 className="hero__h">
            Build <span className="red">AI</span>{" "}
            <br />
            for India.
          </h1>
          <p className="hero__sub">
            We build the <strong>websites, chatbots and software</strong> that answer
            your customers and do your repetitive work.{" "}
            <strong className="red-strong">Websites go live in 48 hours.</strong> Bigger
            builds get a fixed price and a fixed date.
          </p>
          <HeroPrompt />
          <div className="hero__ctas">
            <Link className="btn btn-primary" href="/contact">
              Contact us <Arr />
            </Link>
            <Link className="btn btn-ghost" href="/services">
              See what we build
            </Link>
          </div>
          <div className="hero__proof">
            <div className="hero__proof-item">
              <b>42+</b>built since 2024
            </div>
            <div className="hero__proof-item">
              <b>28</b>clients in India &amp; abroad
            </div>
            <div className="hero__proof-item">
              <b>99.9%</b>uptime, last 90 days
            </div>
            <div className="hero__proof-item">
              <b>10+</b>languages, typed or spoken
            </div>
          </div>
        </div>
        <HeroHub />
      </div>
    </section>
  );
}
