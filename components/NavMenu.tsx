"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Arr } from "./atoms/Arr";
import type { NavLink } from "./Nav";

export function NavMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
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
      if (window.innerWidth > 980) setOpen(false);
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

  // Collapse any open accordion when the whole drawer closes.
  useEffect(() => {
    if (!open) setExpanded(null);
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
          {links.map((n, i) => {
            const delay = open ? `${70 + i * 45}ms` : "0ms";
            const hasChildren = Boolean(n.children?.length);
            const isOpen = expanded === n.href;

            if (!hasChildren) {
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className="nav__link"
                  style={{ transitionDelay: delay }}
                  onClick={() => setOpen(false)}
                >
                  {n.label}
                  <span className="nav__link-arr" aria-hidden="true">↗</span>
                </Link>
              );
            }

            return (
              <div
                key={n.href}
                className={"nav__group" + (isOpen ? " open" : "")}
                style={{ transitionDelay: delay }}
              >
                <div className="nav__group-head">
                  <Link
                    href={n.href}
                    className="nav__link nav__link--group"
                    onClick={() => setOpen(false)}
                  >
                    {n.label}
                  </Link>
                  <button
                    type="button"
                    className="nav__group-toggle"
                    aria-label={(isOpen ? "Collapse " : "Expand ") + n.label}
                    aria-expanded={isOpen}
                    onClick={() => setExpanded((cur) => (cur === n.href ? null : n.href))}
                  >
                    <span className="nav__group-chev" aria-hidden="true" />
                  </button>
                </div>
                <div className="nav__sub">
                  <div className="nav__sub-inner">
                    {n.children!.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="nav__sublink"
                        onClick={() => setOpen(false)}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
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
