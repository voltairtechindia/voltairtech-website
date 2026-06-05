import Link from "next/link";
import { VMark } from "./atoms/VMark";
import { Arr } from "./atoms/Arr";
import { NavMenu } from "./NavMenu";

const NAV_LINKS = [
  { label: "About us", href: "/about" },
  { label: "Industries", href: "/industries" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
];

function Brand({ size = 18 }: { size?: number }) {
  return (
    <span className="brand-word" style={{ fontSize: size }}>
      VOLT<span className="ai-glow">AI</span>R&nbsp;TECH
    </span>
  );
}

export function Nav() {
  return (
    <header className="nav">
      <div className="nav__row">
        <Link className="nav__brand" href="/">
          <VMark size={36} />
          <Brand size={18} />
        </Link>
        <nav className="nav__links">
          {NAV_LINKS.map((n) => (
            <Link key={n.href} href={n.href}>{n.label}</Link>
          ))}
        </nav>
        <div className="nav__right">
          <span className="nav__avail">
            <span className="pulse" />
            Booking · 1 slot this week
          </span>
          <Link className="btn btn-primary btn-sm" href="/contact">
            Contact us <Arr />
          </Link>
          <NavMenu links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
