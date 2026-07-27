import type { ReactNode } from "react";
import Link from "next/link";
import { PageLayout } from "./PageLayout";
import { breadcrumbLd } from "@/lib/seo";

type Crumb = { label: string; href?: string };

export function ProsePage({
  crumbs,
  title,
  meta,
  lead,
  wide,
  className,
  children,
}: {
  crumbs: Crumb[];
  title: ReactNode;
  meta?: string;
  lead?: ReactNode;
  wide?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <PageLayout>
      {crumbs.length > 1 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(crumbs)) }}
        />
      ) : null}
      <section className={`legal-page${className ? ` ${className}` : ""}`}>
        <div className="container">
          <div className={`legal-page__inner${wide ? " legal-page__inner--wide" : ""}`}>
            <nav className="legal-page__crumb" aria-label="Breadcrumb">
              {crumbs.map((c, i) => (
                <span key={c.label}>
                  {c.href ? <Link href={c.href}>{c.label}</Link> : c.label}
                  {i < crumbs.length - 1 ? " / " : null}
                </span>
              ))}
            </nav>
            <h1>{title}</h1>
            {meta ? <div className="legal-page__meta">{meta}</div> : null}
            {lead ? <p className="legal-page__lead">{lead}</p> : null}
            {children}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
