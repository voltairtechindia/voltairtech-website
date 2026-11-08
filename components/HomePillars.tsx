import Link from "next/link";
import { SectionHead } from "./atoms/SectionHead";
import { ServiceGlyph } from "./atoms/ServiceGlyph";
import { Arr } from "./atoms/Arr";
import { ADVISORY_PARTNERS, SIMULATOR } from "@/lib/drones";

/**
 * Home: what Voltair Tech does, weighted the way the business is. Drones lead
 * (the big panel), AI and Robotics & IoT sit beside it.
 */
export function HomePillars() {
  const partner = ADVISORY_PARTNERS[0];
  return (
    <section className="section pillars" aria-labelledby="pillars-h">
      <div className="container">
        <SectionHead
          kicker="What we do"
          title={<span id="pillars-h">Drones first.{" "}<br />AI and robotics alongside.</span>}
          right={<span className="tag"><span className="pulse" />Made in India</span>}
        />

        <div className="pillars__grid">
          {/* ── Drones ── */}
          <article className="pillar pillar--drones">
            <div className="pillar__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SIMULATOR.img("flight")}
                alt="Voltair Drone Simulator: a drone flying a DGCA square circuit on the RPTO training ground"
                width={1600}
                height={900}
                loading="lazy"
              />
            </div>
            <div className="pillar__body">
              <span className="pillar__n">01 · Drones</span>
              <h3 className="pillar__t">Drone technology, made in India.</h3>
              <p className="pillar__d">
                Training, simulation and partnerships that put Indian drones and Indian components in the air.
              </p>
              <ul className="pillar__links">
                <li>
                  <Link href="/drones/simulator">
                    <span>Free RPTO drone simulator</span>
                    <small>Windows and Mac · as per DGCA guidelines</small>
                    <Arr />
                  </Link>
                </li>
                <li>
                  <Link href="/drones/advisory">
                    <span>Advisory: {partner.name.replace(" LLP", "")}</span>
                    <small>{partner.drones.map((d) => d.name).join(", ")}</small>
                    <Arr />
                  </Link>
                </li>
                <li>
                  <Link href="/drones">
                    <span>Coming soon</span>
                    <small>Defence and commercial drones, pilot training, drone labs</small>
                    <Arr />
                  </Link>
                </li>
              </ul>
            </div>
          </article>

          {/* ── AI ── */}
          <Link href="/services" className="pillar pillar--side">
            <span className="pillar__glyph"><ServiceGlyph kind="ai" /></span>
            <span className="pillar__n">02 · AI</span>
            <h3 className="pillar__t">AI that does the work.</h3>
            <p className="pillar__d">
              Chatbots on WhatsApp, voice agents that answer the phone, answers from your own documents, and
              automation for the busywork. Websites live in 48 hours.
            </p>
            <span className="pillar__go">See AI services <Arr /></span>
          </Link>

          {/* ── Robotics & IoT ── */}
          <Link href="/contact" className="pillar pillar--side">
            <span className="pillar__glyph"><ServiceGlyph kind="robot" /></span>
            <span className="pillar__n">03 · Robotics &amp; IoT</span>
            <h3 className="pillar__t">Machines that talk to software.</h3>
            <p className="pillar__d">
              Connecting robots, sensors and devices to dashboards and AI, so you can see and control them from
              anywhere.
            </p>
            <span className="pillar__go">Tell us what to connect <Arr /></span>
          </Link>
        </div>
      </div>
    </section>
  );
}
