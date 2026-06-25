"use client";

import { useEffect } from "react";

/**
 * Progressive scroll-reveal. Mounted once in the root layout.
 * Elements opt in with `data-reveal`. The hidden start-state is gated behind
 * `body.reveal-ready` (added here on mount) so content is fully visible when
 * JS is disabled and stays SEO-safe. Honors prefers-reduced-motion.
 */
export function ScrollReveal() {
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

    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    els.forEach((el) => io.observe(el));

    // Safety net: when a page is loaded in a background tab, the observer can
    // mark above-the-fold elements as not-intersecting and never see a "change"
    // once the tab is shown, leaving them stuck hidden. Directly reveal anything
    // already on-screen. rAF resumes when the tab becomes visible; visibilitychange
    // covers any browser that doesn't re-run the rAF.
    const sweep = () => {
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
    };

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
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisible);
      document.body.classList.remove("reveal-ready");
    };
  }, []);

  return null;
}
