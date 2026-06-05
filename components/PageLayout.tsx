import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { FooterCta } from "./FooterCta";

export function PageLayout({
  children,
  footerNum,
}: {
  children: ReactNode;
  footerNum?: string;
}) {
  return (
    <div className="page">
      <Nav />
      <main>{children}</main>
      <FooterCta num={footerNum} />
    </div>
  );
}
