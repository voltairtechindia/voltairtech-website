"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Arr } from "./atoms/Arr";

type NavLink = { label: string; href: string };

export function NavMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes (after a link tap).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // While open: lock body scroll, close on Escape, close if resized to desktop.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 820) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="nav__burger"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="nav-mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="nav__burger-lines" aria-hidden="true" />
      </button>

      <div id="nav-mobile-menu" className={"nav__menu" + (open ? " open" : "")}>
        <button
          type="button"
          className="nav__backdrop"
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        />
        <nav className="nav__panel" aria-label="Mobile navigation">
          {links.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              className="nav__link"
              style={{ transitionDelay: open ? `${70 + i * 45}ms` : "0ms" }}
              onClick={() => setOpen(false)}
            >
              {n.label}
              <span className="nav__link-arr" aria-hidden="true">↗</span>
            </Link>
          ))}
          <div className="nav__panel-foot">
            <span className="nav__avail nav__avail--drawer">
              <span className="pulse" />
              Booking · 1 slot this week
            </span>
            <Link
              href="/contact"
              className="btn btn-primary"
              onClick={() => setOpen(false)}
            >
              Start a project <Arr />
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
