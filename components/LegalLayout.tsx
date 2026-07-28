import type { ReactNode } from "react";
import Link from "next/link";
import { VMark } from "./atoms/VMark";
import { CONTENT } from "@/lib/content";

function Brand({ size = 18 }: { size?: number }) {
  return (
    <span className="brand-word" style={{ fontSize: size }}>
      VOLT<span className="ai-glow">AI</span>R&nbsp;TECH
    </span>
  );
}

export function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--v-paper)" }}>
      {/* Minimal nav */}
      <header className="nav">
        <div className="nav__row">
          <Link className="nav__brand" href="/">
            <VMark size={36} />
            <Brand size={18} />
          </Link>
          <div className="nav__right">
            <Link className="btn btn-primary btn-sm" href="/#footer">
              Contact us →
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="legal-page">
          <div className="container">
            <div className="legal-page__inner">
              <Link href="/" className="legal-page__back">
                ← Back to voltairtech.com
              </Link>
              <h1>{title}</h1>
              <div className="legal-page__meta">
                Last updated: {lastUpdated} · Voltair Tech · Andheri West, Mumbai · India
              </div>
              {children}
            </div>
          </div>
        </section>
      </main>

      {/* Minimal footer */}
      <footer
        style={{
          padding: "32px 0",
          borderTop: "1px solid var(--border)",
          background: "var(--v-ink)",
          color: "var(--v-ink-fg-3)",
        }}
      >
        <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace", fontSize: 12 }}>
          <span>© 2026 VOLTAIR TECH · voltairtech.com</span>
          <span style={{ display: "flex", gap: 18 }}>
            <Link href="/privacy" style={{ color: "inherit" }}>Privacy</Link>
            <Link href="/terms" style={{ color: "inherit" }}>Terms</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
