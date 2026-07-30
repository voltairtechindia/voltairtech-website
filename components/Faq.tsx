"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/faq/types";
import { SectionHead } from "./atoms/SectionHead";

/** One accordion row. `slug` anchors it (#faq-<slug>); `category` heads its run. */
export interface FaqEntry extends FaqItem {
  slug?: string;
  category?: string | null;
}

/**
 * The /faq accordion. Rows come from the DB (`site_faqs`, managed in the admin
 * panel) — the page passes them in so the FAQPage JSON-LD it renders is built
 * from exactly the same array, which is both a Google rich-results requirement
 * and the basis for AI answer-engine citations.
 *
 * Every row is open by default and closes on click: the answers must be in the
 * DOM on first paint for crawlers, so "closed" is a CSS max-height rather than
 * a conditional render.
 */
export function Faq({ items }: { items: FaqEntry[] }) {
  const [closed, setClosed] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <section id="faq" className="section section--ink">
      <div className="container">
        <SectionHead
          as="h1"
          kicker="Frequently asked"
          title={<>Answers, not{" "}<br />brochures.</>}
          right={<span className="meta mono-lbl">FAQPage schema · AEO-ready</span>}
        />
        <div className="faq">
          {items.map((f, i) => {
            const open = !closed.has(i);
            // A category heading rides on the first row of its run so the
            // groups stay one flat list (unbroken rules between the rows).
            const heading =
              f.category && f.category !== items[i - 1]?.category ? f.category : null;
            return (
              <div key={f.slug ?? `${f.q}-${i}`} className="faq__row">
                {heading ? <h2 className="faq__group">{heading}</h2> : null}
                <div
                  id={f.slug ? `faq-${f.slug}` : undefined}
                  className="faq__item"
                  aria-expanded={open}
                  onClick={() => toggle(i)}
                >
                  <div className="faq__q">
                    <div className="faq__q-text">{f.q}</div>
                    <div className="faq__q-mark">+</div>
                  </div>
                  <p className="faq__a">{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
