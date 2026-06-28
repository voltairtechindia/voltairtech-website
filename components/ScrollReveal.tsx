"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Progressive scroll-reveal. Mounted once in the root layout.
 * Elements opt in with `data-reveal`. The hidden start-state is gated behind
 * `body.reveal-ready` (added here on mount) so content is fully visible when
 * JS is disabled and stays SEO-safe. Honors prefers-reduced-motion.
 *
 * The App Router keeps this component mounted across client-side navigations,
 * so observing only at mount would miss `[data-reveal]` elements rendered by
 * later soft navigations — leaving them stuck at opacity:0 until a hard reload.
 * We therefore (re)scan on every pathname change: reveal whatever is already
 * on-screen immediately, and observe the rest so they animate in on scroll.
 */
export function ScrollReveal() {
  const pathname = usePathname();
  const ioRef = useRef<IntersectionObserver | null>(null);

  // One-time setup: the observer, the body gate, and a background-tab safety net.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") return;

    document.body.classList.add("reveal-ready");

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    ioRef.current = io;

    // Safety net: a page loaded in a background tab can have the observer mark
    // above-the-fold elements as not-intersecting and never see a change once
    // shown. Directly reveal anything already on-screen when the tab is visible.
    const sweep = () => revealOnscreen(io);
    let raf = requestAnimationFrame(sweep);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(sweep);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      io.disconnect();
      ioRef.current = null;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisible);
      document.body.classList.remove("reveal-ready");
    };
  }, []);

  // (Re)observe reveal targets on first mount and after every client-side
  // navigation. `ioRef` is populated by the setup effect, which React runs
  // before this one. rAF lets the new route's DOM paint before we measure.
  useEffect(() => {
    const io = ioRef.current;
    if (!io) return;
    const raf = requestAnimationFrame(() => {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)")
        .forEach((el) => io.observe(el));
      revealOnscreen(io);
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}

/** Immediately reveal any not-yet-shown `[data-reveal]` already in the viewport. */
function revealOnscreen(io: IntersectionObserver) {
  const vh = window.innerHeight || document.documentElement.clientHeight;
  document
    .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)")
    .forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) {
        el.classList.add("is-visible");
        io.unobserve(el);
      }
    });
}
