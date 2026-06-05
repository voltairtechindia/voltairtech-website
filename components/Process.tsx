import type { ReactNode } from "react";
import { CONTENT } from "@/lib/content";
import { SectionHead } from "./atoms/SectionHead";

export function Process({
  num = "06",
  title = <>Four steps. No buzzwords.</>,
  right = <span className="meta mono-lbl">scope → lock → ship → hand off</span>,
  lead,
}: {
  num?: string;
  title?: ReactNode;
  right?: ReactNode;
  lead?: ReactNode;
}) {
  return (
    <section className="section">
      <div className="container">
        <SectionHead kicker={`[ ${num} ] Process`} title={title} right={right} />
        {lead ? (
          <p className="lead" style={{ maxWidth: 720 }}>
            {lead}
          </p>
        ) : null}
        <div className="proc-grid" style={lead ? { marginTop: "var(--s-6)" } : undefined}>
          {CONTENT.process.map((p) => (
            <div key={p.n} className="proc-step">
              <div className="proc-step__n">{p.n}</div>
              <div className="proc-step__t">{p.t}.</div>
              <p className="proc-step__d">{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
