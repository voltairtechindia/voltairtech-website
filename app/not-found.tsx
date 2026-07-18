import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you're looking for doesn't exist or has been moved.",
  robots: { index: false, follow: false },
};

/* Rendered inside the root layout — no <html>/<body> here (nesting them caused
   React "cannot be a child of <body>" hydration errors on every 404). */
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: 520 }}>
        <div
          className="h-mega"
          style={{ marginBottom: "0.5rem" }}
        >
          4<span style={{ color: "var(--v-red)", fontStyle: "italic" }}>0</span>4
        </div>
        <h1 className="h2" style={{ marginBottom: "1rem" }}>
          Page not found.
        </h1>
        <p className="body" style={{ marginBottom: "2rem" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back to building.
        </p>
        <Link className="btn btn-primary" href="/">
          ← Back to Voltair Tech
        </Link>
      </div>
    </main>
  );
}
