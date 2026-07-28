import Link from "next/link";

const HUB_ITEMS = [
  {
    n: "03",
    label: "Services",
    desc: "Websites, chatbots, RAG, mobile, automation, custom AI. Pick what you need.",
    eta: "48 hrs to scoped",
    href: "/services",
  },
  {
    n: "04",
    label: "Industries",
    desc: "D2C, healthcare, fintech, real estate, education. AI shaped to your sector.",
    eta: "8+ sectors",
    href: "/industries",
  },
  {
    n: "05",
    label: "Contact us",
    desc: "One line. We reply in under an hour with a 48 hour plan.",
    eta: "under 1 hr reply",
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
