import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { FooterCta } from "@/components/FooterCta";
import { ThankYouTracker } from "@/components/ThankYouTracker";
import { Arr } from "@/components/atoms/Arr";
import { CONTENT } from "@/lib/content";

// Confirmation pages carry no search value and would fire the conversion for
// anyone who found them in a SERP, so keep this one out of the index entirely.
export const metadata: Metadata = {
  title: "Thank You - We Got Your Brief",
  description:
    "Thanks for contacting Voltair Tech. We reply within an hour with scope, a fixed price, and a start date.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

const NEXT = [
  {
    b: "We read your brief",
    t: "A real person, usually within the hour during working hours.",
  },
  {
    b: "You get a plan and a price",
    t: `On the channel you picked. ${CONTENT.brand.hours}.`,
  },
  {
    b: "You decide",
    t: "No obligation, no follow-up sequence. Say yes and we start building.",
  },
];

export default function ThankYouPage() {
  return (
    <div className="page">
      <ThankYouTracker />
      <Nav />
      <main>
        <section className="section">
          <div className="container">
            <div className="ty">
              <span className="ty__badge" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12.5 L9.5 18 L20 6.5" />
                </svg>
              </span>

              <h1 className="ty__h">
                Thanks. <em>We&apos;re on it.</em>
              </h1>
              <p className="lead ty__lede">
                Your brief is with our team. We reply within an hour during working
                hours ({CONTENT.brand.hours}) with a plan, a fixed price, and a start
                date. Nothing else to do right now.
              </p>

              <ol className="steps ty__steps">
                {NEXT.map((s, i) => (
                  <li className="step" key={s.b}>
                    <span className="step__n">{`0${i + 1}`}</span>
                    <div>
                      <b className="step__b">{s.b}</b>
                      <span className="step__t">{s.t}</span>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="ty__actions">
                <a
                  className="btn btn-primary"
                  href="https://wa.me/917021000764"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Message us on WhatsApp <Arr />
                </a>
                <a className="btn btn-ghost" href={`mailto:${CONTENT.brand.email}`}>
                  Email us
                </a>
              </div>
              <p className="meta ty__note">
                In a hurry? Call {CONTENT.brand.phone}, {CONTENT.brand.hours}.
              </p>

              <div className="ty__more">
                <span className="mono-lbl">While you wait</span>
                <ul className="ty__links">
                  <li>
                    <Link href="/services">What we build</Link>
                  </li>
                  <li>
                    <Link href="/industries">Work by industry</Link>
                  </li>
                  <li>
                    <Link href="/faq">Pricing &amp; process FAQ</Link>
                  </li>
                  <li>
                    <Link href="/blog">Blog</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterCta />
    </div>
  );
}
