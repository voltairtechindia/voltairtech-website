import Link from "next/link";
import { CONTENT } from "@/lib/content";
import { Kicker } from "./atoms/Kicker";
import { VMark } from "./atoms/VMark";

function Brand({ size = 18 }: { size?: number }) {
  return (
    <span className="brand-word" style={{ fontSize: size }}>
      VOLT<span className="ai-glow">AI</span>R&nbsp;TECH
    </span>
  );
}

export function FooterCta({ num }: { num?: string }) {
  return (
    <section id="footer" className="foot">
      <div className="foot__mesh" />
      <div className="container">
        <div className="foot__grid">
          <div>
            <Kicker>{num ? `[ ${num} ] Start` : "Start"}</Kicker>
            <h2 className="foot__h" style={{ marginTop: 16 }} data-reveal="">
              Pick a channel.<br />We reply <em>in under an hour.</em>
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 28 }}>
              <VMark size={44} bg="#1A1A1A" />
              <div>
                <Brand size={22} />
                <div className="mono-lbl" style={{ marginTop: 4 }}>AI services · Mumbai</div>
              </div>
            </div>
            <p className="foot__sub">
              Mon–Sat, 10:00 to 20:00 IST. WhatsApp is fastest. Email if you want a paper
              trail. Call if you&apos;re in a hurry.
            </p>
            <div className="foot__chans">
              <a className="foot__chan" href="https://wa.me/917021000764">
                <div className="l">
                  <div className="foot__icon">
                    <svg viewBox="0 0 32 32" width="20" height="20" fill="#25D366">
                      <path d="M16 0C7.2 0 0 7.2 0 16c0 2.8.7 5.6 2.1 8L0 32l8-2.1c2.4 1.4 5.2 2.1 8 2.1 8.8 0 16-7.2 16-16S24.8 0 16 0zm0 29.5c-2.5 0-4.9-.6-7.1-1.9l-.5-.3-4.7 1.3 1.3-4.7-.3-.5C3.4 21.5 2.5 18.8 2.5 16 2.5 8.5 8.5 2.5 16 2.5S29.5 8.5 29.5 16 23.5 29.5 16 29.5z" />
                    </svg>
                  </div>
                  <div>
                    <b>WhatsApp</b>
                    <br />
                    <span>fastest · usually &lt; 5 min</span>
                  </div>
                </div>
                <div className="r">+91 70210 00764 →</div>
              </a>
              <a className="foot__chan" href={`mailto:${CONTENT.brand.email}`}>
                <div className="l">
                  <div className="foot__icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#F5F5F0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7 L12 13 L21 7" />
                    </svg>
                  </div>
                  <div>
                    <b>Email</b>
                    <br />
                    <span>paper trail · &lt; 1 hr reply</span>
                  </div>
                </div>
                <div className="r">{CONTENT.brand.email} →</div>
              </a>
              <a className="foot__chan" href={`tel:${CONTENT.brand.phone.replace(/\s/g, "")}`}>
                <div className="l">
                  <div className="foot__icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#F5F5F0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <b>Phone</b>
                    <br />
                    <span>direct line · founder picks up</span>
                  </div>
                </div>
                <div className="r">{CONTENT.brand.phone} →</div>
              </a>
            </div>
            <div className="foot__addr">
              <b>Andheri West, Mumbai</b>
              <span>Maharashtra · 400053 · India</span>
              <span>Mon–Sat · 10:00 – 20:00 IST</span>
            </div>
          </div>
          <div className="foot__map">
            <div className="foot__map-art">
              <div className="foot__pin">
                <div className="ring" />
                <div className="dot" />
              </div>
              <div className="foot__pin-label">VOLTAIR TECH HQ · ANDHERI W</div>
            </div>
            <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between" }}>
              <span className="mono-lbl">19.13°N · 72.83°E</span>
              <span className="mono-lbl">open map →</span>
            </div>
          </div>
        </div>
        <div className="foot__legal">
          <span>© 2026 VOLTAIR TECH · Andheri West, Mumbai · voltairtech.com</span>
          <span style={{ display: "flex", gap: 18 }}>
            <Link href="/privacy">privacy</Link>
            <Link href="/terms">terms</Link>
            <a href="/sitemap.xml">sitemap</a>
          </span>
        </div>
      </div>
    </section>
  );
}
