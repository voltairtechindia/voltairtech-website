"use client";

import { useState } from "react";
import { CONTENT } from "@/lib/content";
import { SectionHead } from "./atoms/SectionHead";

export function Faq() {
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
          title={<>Answers, not<br />brochures.</>}
          right={<span className="meta mono-lbl">FAQPage schema · AEO-ready</span>}
        />
        <div className="faq">
          {CONTENT.faq.map((f, i) => {
            const open = !closed.has(i);
            return (
              <div
                key={i}
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
