import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ApplyModal from "@/components/ApplyModal";
import Markdown from "@/components/Markdown";
import { PageLayout } from "@/components/PageLayout";
import { Arr } from "@/components/atoms/Arr";
import { Kicker } from "@/components/atoms/Kicker";
import { getJob, listOpenJobs } from "@/lib/careers/db";
import { DEFAULT_OG_IMAGE, SITE_URL, breadcrumbLd } from "@/lib/seo";
import { EMPTY_PARAM, orPlaceholder } from "@/lib/static-params";

export const dynamicParams = false;

export async function generateStaticParams() {
  let slugs: string[] = [];
  try {
    slugs = (await listOpenJobs()).map((j) => j.slug);
  } catch {
    // DB unreachable: build the placeholder only.
  }
  return orPlaceholder(slugs.map((slug) => ({ slug })), { slug: EMPTY_PARAM });
}

/** Markdown → a clean one-paragraph description for meta/OG. */
function plain(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_>`[\]()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const job = await getJob(params.slug).catch(() => null);
  if (!job || job.status !== "open") return { title: "Role not found" };

  const description =
    plain(job.description_md).slice(0, 155) ||
    `Apply for ${job.title} at Voltair Tech, a Mumbai AI build studio.`;

  return {
    title: `${job.title} | Careers`,
    description,
    alternates: { canonical: `${SITE_URL}/career/${job.slug}` },
    openGraph: {
      url: `${SITE_URL}/career/${job.slug}`,
      title: `${job.title} at Voltair Tech`,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function JobPage({ params }: { params: { slug: string } }) {
  const job = await getJob(params.slug).catch(() => null);
  // Draft and closed roles are not public — a stale link should 404, not leak
  // a posting we've deliberately taken down.
  if (!job || job.status !== "open") notFound();

  const facts = [
    { k: "Location", v: job.location },
    { k: "Type", v: job.employment_type },
    { k: "Experience", v: job.experience_level },
    { k: "Compensation", v: job.salary_range },
    { k: "Department", v: job.department },
    {
      k: "Openings",
      v: job.positions > 1 ? `${job.positions} positions` : null,
    },
  ].filter((f) => Boolean(f.v)) as { k: string; v: string }[];

  const jobLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description_md || job.title,
    datePosted: job.created_at,
    employmentType: job.employment_type ?? undefined,
    directApply: true,
    hiringOrganization: {
      "@type": "Organization",
      name: "Voltair Tech",
      sameAs: SITE_URL,
      logo: `${SITE_URL}/favicon-dark.png`,
    },
    jobLocation: job.location
      ? {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.location,
            addressCountry: "IN",
          },
        }
      : undefined,
    qualifications: job.requirements.length
      ? job.requirements.join("; ")
      : undefined,
    responsibilities: job.responsibilities.length
      ? job.responsibilities.join("; ")
      : undefined,
    skills: job.skills.length ? job.skills.join(", ") : undefined,
    totalJobOpenings: job.positions > 1 ? job.positions : undefined,
  };

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Careers", href: "/career" },
    { label: job.title },
  ];

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(crumbs)) }}
      />

      <section className="section job-page">
        <div className="container">
          <nav className="legal-page__crumb" aria-label="Breadcrumb">
            <Link href="/career">← All roles</Link>
          </nav>

          <div className="job-page__grid">
            {/* ---------- the role ---------- */}
            <article className="job-page__main">
              <header className="job-page__hd">
                {job.department ? (
                  <Kicker dot={false}>{job.department}</Kicker>
                ) : null}
                <h1 className="job-page__h">{job.title}</h1>
              </header>

              {job.description_md ? (
                <div className="job-page__body">
                  <Markdown>{job.description_md}</Markdown>
                </div>
              ) : null}

              {job.responsibilities.length ? (
                <section className="job-page__sec">
                  <h2>What you&apos;ll do</h2>
                  <ul className="job-page__list">
                    {job.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {job.requirements.length ? (
                <section className="job-page__sec">
                  <h2>What we&apos;re looking for</h2>
                  <ul className="job-page__list">
                    {job.requirements.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {job.skills.length ? (
                <section className="job-page__sec">
                  <h2>Key skills</h2>
                  <div className="jobc__skills">
                    {job.skills.map((s) => (
                      <span key={s} className="jobc__skill">
                        {s}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="job-page__cta">
                <div>
                  <h2>Ready to apply?</h2>
                  <p>
                    A couple of minutes and your résumé. We read every application and
                    reply either way.
                  </p>
                </div>
                <ApplyModal jobSlug={job.slug} jobTitle={job.title} />
              </div>
            </article>

            {/* ---------- the facts rail ---------- */}
            <aside className="job-page__rail">
              <div className="job-page__railcard">
                <span className="mono-lbl">The role at a glance</span>
                <dl className="job-page__facts">
                  {facts.map((f) => (
                    <div key={f.k} className="job-page__fact">
                      <dt>{f.k}</dt>
                      <dd>{f.v}</dd>
                    </div>
                  ))}
                </dl>
                <ApplyModal jobSlug={job.slug} jobTitle={job.title} />
                <p className="job-page__railnote">
                  Prefer email? Send your résumé to{" "}
                  <a href="mailto:business@voltairtech.com">business@voltairtech.com</a>.
                </p>
              </div>
              <Link className="job-page__allroles" href="/career">
                See all open roles <Arr />
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
