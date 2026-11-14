import Link from "next/link";

const HUB_ITEMS = [
  {
    n: "02",
    label: "Drones",
    desc: "Drone simulator (Trial Version), Indian drone partners, and training and drone labs on the way.",
    eta: "made in India",
    href: "/drones",
  },
  {
    n: "03",
    label: "Services",
    desc: "Websites, chatbots, phone agents, apps, and software that runs your busywork.",
    eta: "from 48 hours",
    href: "/services",
  },
  {
    n: "04",
    label: "Industries",
    desc: "Shops, clinics, builders, schools, factories. Built around how your trade works.",
    eta: "13 industries",
    href: "/industries",
  },
  {
    n: "05",
    label: "Contact us",
    desc: "Tell us the problem in one line. We reply within the hour with a plan and a price.",
    eta: "reply within the hour",
    href: "/contact",
    cta: true,
  },
];

export function HomeHub() {
  return (
    <section className="section">
      <div className="container">
        <div className="hub-grid">
          {HUB_ITEMS.map((item, i) => (
            <Link
              key={item.n}
              href={item.href}
              className={"hub-card" + (item.cta ? " hub-card--cta" : "")}
              data-reveal=""
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="hub-card__top">
                <span className="hub-card__arrow">↗</span>
              </div>
              <div className="hub-card__label">{item.label}</div>
              <p className="hub-card__desc">{item.desc}</p>
              <div className="hub-card__eta">{item.eta}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
