"use client";

import { CONTENT } from "@/lib/content";
import { catalogueOptionId, type LeadOption } from "@/lib/lead-form";
import { LeadForm } from "./LeadForm";

const STEPS = [
  { b: "Send your brief", t: "One or two lines is enough." },
  { b: "We reply in under an hour", t: CONTENT.brand.hours + "." },
  { b: "We start building", t: "Websites go live in 48 hours." },
];

/**
 * The /contact hero form. Everything below the steps is the shared LeadForm —
 * the same component the service and industry pages embed, so the two can't
 * drift apart. The picker is the live service catalogue, and a deep link like
 * `/contact?service=ai-websites&industry=d2c-ecommerce` lands pre-ticked.
 */
export function BigInput({
  services = [],
  industries = [],
}: {
  services?: { slug: string; title: string }[];
  industries?: { slug: string; title: string }[];
}) {
  const options: LeadOption[] = services.map((s) => ({
    id: catalogueOptionId(s.slug),
    slug: s.slug,
    title: s.title,
  }));

  return (
    <section className="section section--contact">
      <div className="container">
        <div className="bi">
          <div className="bi__hd">
            <h1 className="bi__h">
              Contact <em>us.</em>
            </h1>
            <p className="lead bi__lede">
              Tell us what you want to build. We reply within an hour with scope, a fixed
              price, and a start date.
            </p>
          </div>

          <ol className="steps bi__steps">
            {STEPS.map((s, i) => (
              <li className="step" key={s.b}>
                <span className="step__n">{`0${i + 1}`}</span>
                <div>
                  <b className="step__b">{s.b}</b>
                  <span className="step__t">{s.t}</span>
                </div>
              </li>
            ))}
          </ol>

          <LeadForm
            variant="page"
            idPrefix="bi"
            context={{ kind: "general" }}
            options={options}
            industries={industries}
            paramPrefill
          />
        </div>
      </div>
    </section>
  );
}
