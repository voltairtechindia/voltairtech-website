import Link from "next/link";
import { VMark } from "./atoms/VMark";
import { Arr } from "./atoms/Arr";
import { NavMenu } from "./NavMenu";
import { getNavGroups, type NavChild } from "@/lib/nav-data";

export type NavLink = {
  label: string;
  href: string;
  /** When present, this top-level item gets a hover dropdown / mobile accordion. */
  children?: NavChild[];
  /** Short heading shown above the dropdown list. */
  menuTitle?: string;
  /** Tints the label vermilion so one item leads the bar. */
  emphasis?: boolean;
};

function Brand({ size = 18 }: { size?: number }) {
  return (
    <span className="brand-word" style={{ fontSize: size }}>
      VOLT<span className="ai-glow">AI</span>R&nbsp;TECH
    </span>
  );
}

function Caret() {
  return (
    <svg
      className="nav__caret"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
    >
      <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DesktopItem({ link }: { link: NavLink }) {
  const accent = link.emphasis ? " nav__item--accent" : "";
  if (!link.children?.length) {
    return (
      <Link className={"nav__item" + accent} href={link.href}>
        {link.label}
      </Link>
    );
  }
  return (
    <div className="nav__item nav__item--menu">
      <Link className={"nav__item nav__item-trigger" + accent} href={link.href}>
        {link.label}
        <Caret />
      </Link>
      <div className="nav__dropdown" role="menu" aria-label={link.label}>
        <div className="nav__dropdown-inner">
          {link.menuTitle ? (
            <span className="nav__dropdown-title">{link.menuTitle}</span>
          ) : null}
          <div className="nav__dropdown-grid">
            {link.children.map((c) => (
              <Link key={c.href} className="nav__dropdown-link" href={c.href} role="menuitem">
                <span className="nav__dropdown-link-label">{c.label}</span>
              </Link>
            ))}
          </div>
          <Link className="nav__dropdown-all" href={link.href} role="menuitem">
            View all {link.label.toLowerCase()} <Arr />
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * `showContactCta` lets /contact drop the header's "Contact us" button — there
 * it links to the page you are already on. Below 981px the button is hidden by
 * CSS regardless, so this only ever changes the desktop header.
 */
export async function Nav({ showContactCta = true }: { showContactCta?: boolean } = {}) {
  const groups = await getNavGroups();

  /**
   * Header order is deliberate and short. Blog and FAQ are off the bar on
   * purpose (the footer still links both, so neither is orphaned) so that
   * "Our Projects" is the one item the eye lands on.
   */
  const navLinks: NavLink[] = [
    { label: "About us", href: "/about" },
    {
      label: "Industries",
      href: "/industries",
      menuTitle: "Sectors we build for",
      children: groups.industries,
    },
    {
      label: "Services",
      href: "/services",
      menuTitle: "What we build",
      children: groups.services,
    },
    { label: "Our Projects", href: "/live-projects", emphasis: true },
    { label: "Career", href: "/career" },
  ];

  return (
    <header className="nav">
      <div className="nav__row">
        <Link className="nav__brand" href="/">
          <VMark size={36} />
          <Brand size={18} />
        </Link>
        <nav className="nav__links">
          {navLinks.map((n) => (
            <DesktopItem key={n.href} link={n} />
          ))}
        </nav>
        <div className="nav__right">
          {showContactCta ? (
            <Link className="btn btn-primary btn-sm" href="/contact">
              Contact us <Arr />
            </Link>
          ) : null}
          <NavMenu links={navLinks} />
        </div>
      </div>
    </header>
  );
}
