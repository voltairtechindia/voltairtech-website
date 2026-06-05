import Link from "next/link";

const HUB_ITEMS = [
  {
    n: "02",
    label: "About",
    desc: "Indian operators, global standards. DPDP Act 2023 · Razorpay-native.",
    eta: "since 2024",
    href: "/about",
  },
  {
    n: "03",
    label: "Industries",
    desc: "D2C, healthcare, fintech, real estate, education — AI shaped to your sector.",
    eta: "8+ sectors",
    href: "/industries",
  },
  {
    n: "04",
    label: "Services",
    desc: "Six services — websites, chatbots, RAG, mobile, automation, custom AI.",
    eta: "48 hrs → scoped",
    href: "/services",
  },
  {
    n: "07",
    label: "Blog",
    desc: "Field notes on RAG, WhatsApp bots, DPDP compliance and shipping fast.",
    eta: "updated weekly",
    href: "/blog",
  },
  {
    n: "08",
    label: "FAQ",
    desc: "Pricing, timelines, NDA, post-ship support. Answers without the brochure.",
    eta: "AEO-ready",
    href: "/faq",
  },
  {
    n: "09",
    label: "Start a project",
    desc: "One line. We reply in under an hour with a 48-hour plan.",
    eta: "< 1 hr reply",
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
                <span className="hub-card__n">[ {item.n} ]</span>
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
