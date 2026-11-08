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
            <Kicker>Drones · AI · Robotics · Made in India</Kicker>
          </div>
          <h1 className="hero__h">
            <span className="red">Drones</span> &amp; AI{" "}
            <br />
            for India.
          </h1>
          <p className="hero__sub">
            We build <strong>drone technology, AI software and connected devices</strong>{" "}
            in Mumbai, and back drones and parts made in India. Start with our{" "}
            <strong className="red-strong">free RPTO drone simulator</strong>, or tell us
            what you want built.
          </p>
          <HeroPrompt />
          <div className="hero__ctas">
            <Link className="btn btn-primary" href="/drones">
              Explore drones <Arr />
            </Link>
            <Link className="btn btn-ghost" href="/drones/simulator">
              Free drone simulator
            </Link>
          </div>
          <div className="hero__proof">
            <div className="hero__proof-item">
              <b>42+</b>products built since 2024
            </div>
            <div className="hero__proof-item">
              <b>28</b>clients in India &amp; abroad
            </div>
            <div className="hero__proof-item">
              <b>13</b>DGCA exercises in our simulator
            </div>
            <div className="hero__proof-item">
              <b>4</b>Indian drones we advise on
            </div>
          </div>
        </div>
        <HeroHub />
      </div>
    </section>
  );
}
