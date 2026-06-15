import type { ReactNode } from "react";
import { Kicker } from "./Kicker";

export function SectionHead({
  kicker,
  title,
  right,
  as: As = "h2",
}: {
  kicker?: string;
  title: ReactNode;
  right?: ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div className="section-head">
      <div className="section-head__left">
        {kicker ? <Kicker>{kicker}</Kicker> : null}
        <As className="h-display" style={{ marginTop: "16px" }}>{title}</As>
      </div>
      {right ? <div className="section-head__right">{right}</div> : null}
    </div>
  );
}
