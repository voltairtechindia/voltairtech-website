import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you're looking for doesn't exist or has been moved.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <html lang="en-IN">
      <head>
        <meta name="theme-color" content="#E63946" />
      </head>
      <body
        style={{
          fontFamily: "'Inter Tight', -apple-system, sans-serif",
          background: "#F5F5F0",
          color: "#0A0A0A",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
          margin: 0,
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <div
            style={{
              fontSize: "clamp(4rem, 15vw, 8rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              marginBottom: "0.5rem",
            }}
          >
            4<span style={{ color: "#E63946" }}>0</span>4
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            Page not found.
          </h1>
          <p
            style={{
              color: "#555",
              fontSize: "1rem",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back to building.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "#E63946",
              color: "#F5F5F0",
              padding: "14px 32px",
              borderRadius: 999,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
            }}
          >
            ← Back to Voltair Tech
          </Link>
        </div>
      </body>
    </html>
  );
}
