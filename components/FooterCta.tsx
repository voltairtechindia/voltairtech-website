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
        <div className="foot__top">
          <div className="foot__lede">
            <Kicker dot={false}>{num ? `[ ${num} ] Start` : "Start"}</Kicker>
            <h2 className="foot__h">
              Pick a channel. <em>We reply in under an hour.</em>
            </h2>
            <p className="foot__top-sub">
              Start your project or scope your idea. WhatsApp is fastest. Email for a paper trail. Direct line is open Mon–Sat, 10:00–20:00 IST.
            </p>
          </div>
          <div className="foot__top-btns">
            <a className="foot__btn foot__btn--whatsapp" href="https://wa.me/917021000764" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 32 32" width="16" height="16" fill="#25D366">
                <path d="M16 0C7.2 0 0 7.2 0 16c0 2.8.7 5.6 2.1 8L0 32l8-2.1c2.4 1.4 5.2 2.1 8 2.1 8.8 0 16-7.2 16-16S24.8 0 16 0zm0 29.5c-2.5 0-4.9-.6-7.1-1.9l-.5-.3-4.7 1.3 1.3-4.7-.3-.5C3.4 21.5 2.5 18.8 2.5 16 2.5 8.5 8.5 2.5 16 2.5S29.5 8.5 29.5 16 23.5 29.5 16 29.5z" />
              </svg>
              <span>WhatsApp Us</span>
            </a>
            <a className="foot__btn" href={`mailto:${CONTENT.brand.email}`}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7 L12 13 L21 7" />
              </svg>
              <span>Email Studio</span>
            </a>
            <a className="foot__btn" href={`tel:${CONTENT.brand.phone.replace(/\s/g, "")}`}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Call Direct</span>
            </a>
          </div>
        </div>
        <div className="foot__grid">
          {/* Column 1: Brand & Office */}
          <div className="foot__col">
            <div className="foot__brandrow">
              <VMark size={36} bg="#1A1A1A" />
              <div>
                <Brand size={18} />
                <div className="mono-lbl" style={{ marginTop: 2, fontSize: 10 }}>AI Studio · Mumbai</div>
              </div>
            </div>
            <p className="foot__sub">
              Mumbai&apos;s AI build studio. Shipping production apps, chatbots, and RAG systems in 48 hours.
            </p>
            <div className="foot__socials">
              <a className="foot__social-link" href="https://www.linkedin.com/company/voltairtech/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a className="foot__social-link" href="https://www.instagram.com/voltairtechindia/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a className="foot__social-link" href="https://www.facebook.com/Voltairtech" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
            </div>
            <div className="foot__addr">
              <b>Voltair Tech</b>
              <span>Andheri West, Mumbai</span>
              <span>Maharashtra · 400053 · India</span>
            </div>
          </div>

          {/* Column 2: Company */}
          <div className="foot__col">
            <div className="foot__col-title">Company</div>
            <ul className="foot__links">
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/timeline">Process &amp; Timeline</Link>
              </li>
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="foot__col">
            <div className="foot__col-title">Resources</div>
            <ul className="foot__links">
              <li>
                <Link href="/work">Case Studies</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/rag">RAG Showcase</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className="foot__col">
            <div className="foot__col-title">Connect</div>
            <ul className="foot__links">
              <li>
                <a href="https://wa.me/917021000764" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <svg viewBox="0 0 32 32" width="14" height="14" fill="#25D366" style={{ flex: "none" }}>
                    <path d="M16 0C7.2 0 0 7.2 0 16c0 2.8.7 5.6 2.1 8L0 32l8-2.1c2.4 1.4 5.2 2.1 8 2.1 8.8 0 16-7.2 16-16S24.8 0 16 0zm0 29.5c-2.5 0-4.9-.6-7.1-1.9l-.5-.3-4.7 1.3 1.3-4.7-.3-.5C3.4 21.5 2.5 18.8 2.5 16 2.5 8.5 8.5 2.5 16 2.5S29.5 8.5 29.5 16 23.5 29.5 16 29.5z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTENT.brand.email}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7 L12 13 L21 7" />
                  </svg>
                  <span>Email</span>
                </a>
              </li>
              <li>
                <a href={`tel:${CONTENT.brand.phone.replace(/\s/g, "")}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>Phone</span>
                </a>
              </li>
            </ul>
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
