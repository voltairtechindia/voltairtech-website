import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { SectionHead } from "@/components/atoms/SectionHead";
import { Kicker } from "@/components/atoms/Kicker";
import { Arr } from "@/components/atoms/Arr";
import { ADVISORY_PARTNERS } from "@/lib/drones";
import { SITE_URL, breadcrumbLd } from "@/lib/seo";

const TITLE = "Advisory - Indian Drone Companies We Work With | Voltair Tech";
const DESCRIPTION =
  "Voltair Tech advises and works alongside Indian drone makers to advance drone technology built in India. Our first partner: Preflight Labs, makers of the TALON-1 and COBRA VTOL, the PFL Trainer and the SHRIKE interceptor.";
const URL = `${SITE_URL}/drones/advisory`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    url: URL,
    title: "Voltair Tech Advisory: backing drones made in India",
    description: DESCRIPTION,
    images: ["/images/drones/preflight/cobra.webp"],
  },
};

const PRINCIPLES = [
  { n: "01", t: "Made in India", d: "We back drones designed and built here, with Indian components wherever possible." },
  { n: "02", t: "Built together", d: "We bring software, AI and training; our partners bring the aircraft. Each side does what it is best at." },
  { n: "03", t: "Shown to more people", d: "We put Indian drones in front of pilots, colleges, industry and defence teams across the country." },
];

export default function AdvisoryPage() {
  const crumbs = breadcrumbLd([
    { label: "Home", href: "/" },
    { label: "Drones", href: "/drones" },
    { label: "Advisory" },
  ]);
  const orgsLd = ADVISORY_PARTNERS.map((p) => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: p.name,
    url: "https://preflightlabs.in/",
    address: { "@type": "PostalAddress", addressLocality: p.location.split(",")[0], addressCountry: "IN" },
    makesOffer: p.drones.map((d) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Product", name: d.name, description: d.role, image: `${SITE_URL}${d.img}` },
    })),
  }));

  return (
    <PageLayout footerNum="03">
      {[crumbs, ...orgsLd].map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      ))}

      {/* ── Intro ── */}
      <section className="section drones-hero">
        <div className="container">
          <nav className="adv-crumbs" aria-label="Breadcrumb">
            <Link href="/drones">Drones</Link> <span aria-hidden="true">/</span> Advisory
          </nav>
          <SectionHead
            as="h1"
            kicker="Advisory"
            title={<>Indian drones,{" "}<br />built together.</>}
            right={<span className="tag"><span className="pulse" />Make in India</span>}
          />
          <p className="about-intro">
            Voltair Tech is an advisor to Indian drone companies. We work alongside them to advance the technology,
            and to get drones and components made in India in front of the people who need them.
          </p>
          <div className="adv-principles">
            {PRINCIPLES.map((p) => (
              <div key={p.n} className="adv-principle">
                <span className="adv-principle__n">{p.n}</span>
                <h2 className="adv-principle__t">{p.t}</h2>
                <p className="adv-principle__d">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {ADVISORY_PARTNERS.map((p) => (
        <section key={p.slug} id={p.slug} className="section section--ink adv-partner">
          <div className="container">
            <div className="adv-partner__head">
              <div>
                <Kicker>Advisory partner</Kicker>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="adv-partner__logo" src={p.logo} alt={p.name} width={844} height={307} />
                <p className="adv-partner__meta">{p.name} · {p.location}</p>
              </div>
              <div className="adv-partner__about">
                <p>{p.about}</p>
                <a className="btn btn-primary" href={p.url} target="_blank" rel="noopener">
                  Visit preflightlabs.in <Arr />
                </a>
              </div>
            </div>

            <div className="adv-drones">
              {p.drones.map((d) => (
                <article key={d.slug} className="adv-drone">
                  <div className="adv-drone__media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.img} alt={`${d.name} by ${p.name}`} width={720} height={543} loading="lazy" />
                  </div>
                  <div className="adv-drone__body">
                    <span className="adv-drone__tag">{d.tag}</span>
                    <h3 className="adv-drone__name">{d.name}</h3>
                    <p className="adv-drone__role">{d.role}</p>
                    <dl className="adv-stats">
                      {d.stats.map((s) => (
                        <div key={s.label} className="adv-stat">
                          <dt>{s.label}</dt>
                          <dd>
                            <strong>{s.value}</strong>
                            <span>{s.note}</span>
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <ul className="adv-uses">
                      {d.uses.map((u) => <li key={u}>{u}</li>)}
                    </ul>
                    <a className="adv-drone__link" href={p.url} target="_blank" rel="noopener">
                      Full details on preflightlabs.in <Arr />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ── More coming ── */}
      <section className="section">
        <div className="container">
          <div className="adv-more">
            <div>
              <span className="drone-status">Coming soon</span>
              <h2 className="adv-more__h">More Indian drone makers are joining.</h2>
              <p className="adv-more__p">
                Do you build drones, motors, flight controllers, cameras or other components in India? We would like to
                work with you and help more people find what you make.
              </p>
            </div>
            <div className="adv-more__cta">
              <Link className="btn btn-primary" href="/contact">Work with us <Arr /></Link>
              <a className="btn btn-ghost" href="https://wa.me/917021000764?text=Hi%2C%20we%20build%20drones%20in%20India%20and%20want%20to%20talk%20about%20Voltair%20advisory" target="_blank" rel="noopener noreferrer">
                WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
