/**
 * A project's own page runs on its own type.
 *
 * The rest of the site is Fraunces / Archivo / Plex Mono — an editorial voice
 * for a studio talking about itself. A product page is a different thing: it
 * is the product's page, not the studio's, so these routes get their own
 * pairing (Space Grotesk for headings and UI, Inter Tight for reading) loaded
 * only here and exposed as `--pj-*` variables that the `.pj` scope in
 * globals.css reads. Nothing outside `/live-projects/<slug>` sees them.
 */
import { Inter_Tight, Space_Grotesk } from "next/font/google";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-pj-display",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-pj-text",
  display: "swap",
});

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${grotesk.variable} ${interTight.variable}`}>{children}</div>;
}
