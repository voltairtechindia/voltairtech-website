import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you're looking for doesn't exist or has been moved.",
  robots: { index: false, follow: false },
};

// GitHub Pages serves this page (404.html) for any path it has no file for, so
// it also does the two jobs a server used to:
// 1. Cold-email click links on /api/leads/track/* go on to the admin app,
//    which logs the click and forwards to the real destination.
// 2. "/some/page/" (trailing slash) goes to "/some/page", where the file lives.
const ADMIN_ORIGIN = "https://voltairtech-admin.vercel.app";
const RESCUE = `(function(){var p=location.pathname;if(p.indexOf("/api/leads/track/")===0){location.replace("${ADMIN_ORIGIN}"+p+location.search);return;}if(p.length>1&&p.charAt(p.length-1)==="/"){location.replace(p.replace(/\\/+$/,"")+location.search+location.hash);}})();`;

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
      <script dangerouslySetInnerHTML={{ __html: RESCUE }} />
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
