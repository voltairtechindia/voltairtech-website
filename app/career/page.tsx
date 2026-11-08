import type { Metadata } from "next";
import Link from "next/link";

import CareerForm from "@/components/CareerForm";
import { PageLayout } from "@/components/PageLayout";
import { Arr } from "@/components/atoms/Arr";
import { Kicker } from "@/components/atoms/Kicker";
import { listOpenJobs } from "@/lib/careers/db";
import type { JobOpening } from "@/lib/careers/types";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";

// Openings change rarely, and the admin pings /api/revalidate the moment one is
// created, closed or edited — so a 5-minute window is only ever the backstop.

export const metadata: Metadata = {
  title: "Careers: Build AI that ships, from Mumbai",
  description:
    "Open roles at Voltair Tech. We build production AI for Indian businesses: apps, chatbots, retrieval systems and automations. See what we are hiring for and apply with your résumé.",
  alternates: { canonical: `${SITE_URL}/career` },
  openGraph: {
    url: `${SITE_URL}/career`,
    title: "Careers at Voltair Tech",
    description:
      "Open roles at Voltair Tech, a Mumbai company building drones, AI and robotics. Apply with your résumé.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const WHY = [
  {
    n: "01",
    h: "You ship, not slide-deck",
    p: "Websites go live in 48 hours and features land the week they're scoped. Nothing you build here waits two quarters for a launch window.",
  },
  {
    n: "02",
    h: "Small team, real ownership",
    p: "You own a surface end to end: the model, the API, the screen it lands on. No layers of hand-off between you and the person using it.",
  },
  {
    n: "03",
    h: "AI on production, not demos",
    p: "RAG systems, agents and automations running against live business data, with the reliability, cost and privacy work that actually implies.",
  },
  {
    n: "04",
    h: "Built in India, for India",
    p: "Indian operators, Indian constraints, global standards, and DPDP compliance treated as engineering rather than a checkbox.",
  },
];

function Meta({ job }: { job: JobOpening }) {
  const bits = [
    job.location,
    job.employment_type,
    job.experience_level,
    job.salary_range,
  ].filter(Boolean) as string[];
  if (!bits.length) return null;
  return (
    <div className="jobc__meta">
      {bits.map((b, i) => (
        <span key={i} className="jobc__chip">
          {b}
        </span>
      ))}
    </div>
  );
}

export default async function CareerPage() {
  let jobs: JobOpening[] = [];
  try {
    jobs = await listOpenJobs();
  } catch {
    // DB unreachable — the page still renders with the open application form,
    // which is the one thing a candidate can always do.
    jobs = [];
  }

  const jobOptions = jobs.map((j) => ({ slug: j.slug, title: j.title }));
  const seats = jobs.reduce((s, j) => s + (j.positions || 1), 0);

  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Open roles at Voltair Tech",
    itemListElement: jobs.map((j, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/career/${j.slug}`,
      name: j.title,
    })),
  };

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      {/* ---------------- hero ---------------- */}
      <section className="section careers-hero">
        <div className="container">
          <Kicker dot={false}>Careers</Kicker>
          <h1 className="careers-hero__h">
            Build AI that actually <em>ships.</em>
          </h1>
          <p className="lead careers-hero__lede">
            We&apos;re a small Mumbai studio putting production AI in front of real
            Indian businesses: apps, chatbots, retrieval systems, automations. If you like
            owning something end to end and seeing it live the same week, we should
            talk.
          </p>
          <div className="careers-hero__meta">
            {jobs.length > 0 ? (
              <>
                <span className="tag">
                  <span className="pulse" />
                  {jobs.length} open {jobs.length === 1 ? "role" : "roles"}
                  {seats > jobs.length ? ` · ${seats} seats` : ""}
                </span>
                <a className="btn btn-ghost btn-sm" href="#roles">
                  See the roles <Arr />
                </a>
              </>
            ) : (
              <>
                <span className="tag">No open roles right now</span>
                <a className="btn btn-ghost btn-sm" href="#apply">
                  Introduce yourself anyway <Arr />
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- open roles ---------------- */}
      <section className="section careers-roles" id="roles">
        <div className="container">
          <div className="section-head">
            <div className="section-head__left">
              <Kicker dot={false}>Open positions</Kicker>
              <h2>{jobs.length ? "What we're hiring for" : "Nothing open right now"}</h2>
            </div>
            {jobs.length ? (
              <div className="section-head__right">
                <span className="mono-lbl">
                  {jobs.length} {jobs.length === 1 ? "role" : "roles"}
                </span>
              </div>
            ) : null}
          </div>

          {jobs.length === 0 ? (
            <div className="careers-empty">
              <p>
                We hire in bursts, and the best people rarely arrive on a posting.
                Send us your résumé and a line about what you want to build. We keep
                every application and come back to it the moment a role opens.
              </p>
              <a className="btn btn-primary" href="#apply">
                Send an open application <Arr />
              </a>
            </div>
          ) : (
            <div className="job-grid">
              {jobs.map((j) => (
                <Link key={j.slug} href={`/career/${j.slug}`} className="jobc">
                  {j.department ? (
                    <span className="jobc__dept">{j.department}</span>
                  ) : null}
                  <h3 className="jobc__title">{j.title}</h3>
                  <Meta job={j} />
                  {j.skills.length ? (
                    <div className="jobc__skills">
                      {j.skills.slice(0, 5).map((s) => (
                        <span key={s} className="jobc__skill">
                          {s}
                        </span>
                      ))}
                      {j.skills.length > 5 ? (
                        <span className="jobc__skill">+{j.skills.length - 5}</span>
                      ) : null}
                    </div>
                  ) : null}
                  <span className="jobc__cta">
                    View role &amp; apply <Arr />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- why here ---------------- */}
      <section className="section section--ink careers-why">
        <div className="container">
          <div className="section-head">
            <div className="section-head__left">
              <Kicker dot={false}>Why here</Kicker>
              <h2>What working here is actually like</h2>
            </div>
          </div>
          <div className="careers-why__grid">
            {WHY.map((w) => (
              <div key={w.n} className="careers-why__cell">
                <span className="careers-why__n">{w.n}</span>
                <h3>{w.h}</h3>
                <p>{w.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- apply ---------------- */}
      <section className="section careers-apply" id="apply">
        <div className="container">
          <div className="careers-apply__inner">
            <div className="careers-apply__hd">
              <Kicker dot={false}>
                {jobs.length ? "Open application" : "Introduce yourself"}
              </Kicker>
              <h2 className="careers-apply__h">
                Don&apos;t see your role? <em>Write anyway.</em>
              </h2>
              <p className="lead">
                Attach a résumé and tell us what you&apos;d want to build. A person reads
                every one, and you&apos;ll hear back either way.
              </p>
            </div>
            <div className="careers-apply__card">
              <CareerForm jobs={jobOptions} />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
