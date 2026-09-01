import type { ReactNode } from "react";

import { PageLayout } from "./PageLayout";

/**
 * Page shell for the redesigned service / industry / sector sub-service pages.
 *
 * These used to borrow `ProsePage`, which is built for the legal pages: one
 * narrow column, no visuals, everything at article width. That is the right
 * shape for a privacy policy and the wrong one for a page whose job is to sell
 * a build, so the shell is now full-bleed and each section decides its own
 * width. `ProsePage` stays exactly as it was for /privacy and /terms.
 */
export function DetailShell({ children }: { children: ReactNode }) {
  return (
    <PageLayout footerNum="03">
      <div className="detail">{children}</div>
    </PageLayout>
  );
}

/** Constrains body prose to a readable measure inside the full-bleed shell. */
export function DetailProse({ children }: { children: ReactNode }) {
  return (
    <section className="detail-prose">
      <div className="container">
        <div className="detail-prose__inner">{children}</div>
      </div>
    </section>
  );
}

/** A full-width band; `tone="ink"` inverts it for contrast between sections. */
export function DetailBand({
  children,
  tone = "paper",
  id,
}: {
  children: ReactNode;
  tone?: "paper" | "ink";
  id?: string;
}) {
  return (
    <section id={id} className={`detail-band detail-band--${tone}`}>
      <div className="container">{children}</div>
    </section>
  );
}
