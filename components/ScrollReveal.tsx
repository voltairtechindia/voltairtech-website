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

    return () => {
      io.disconnect();
      document.body.classList.remove("reveal-ready");
    };
  }, []);

  return null;
}
