"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * Site-wide motion engine. Mounted once in the root layout.
 *
 * - Lenis smooth scrolling, driven by GSAP's ticker (single rAF loop).
 * - `[data-reveal]` elements rise in via ScrollTrigger. The hidden start-state
 *   is gated behind `body.reveal-ready` (added here on mount) so content is
 *   fully visible when JS is disabled and stays SEO-safe. `body.gsap-on`
 *   disables the CSS fallback transition so GSAP owns the animation.
 * - Hero art + chips get a scrubbed parallax drift; the marquee band skews
 *   with scroll velocity; hero proof stats count up on load.
 * - Honors prefers-reduced-motion (engine never starts; content stays static).
 *
 * The App Router keeps this component mounted across client-side navigations,
 * so per-route work (reveals, parallax) re-runs on every pathname change and
 * the previous route's tweens/triggers are killed first.
 */

/** Inner scroll containers Lenis must leave alone (chat log, nav mega-menu…). */
const LENIS_PREVENT =
  ".chat-widget-window, .nav__dropdown, .nav__menu, [data-lenis-prevent]";

export function ScrollReveal() {
  const pathname = usePathname();
  const engineRef = useRef<{ perRoute: gsap.core.Tween[] } | null>(null);
  const firstRouteRef = useRef(true);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add("reveal-ready", "gsap-on");

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.115,
      prevent: (node) => Boolean(node.closest?.(LENIS_PREVENT)),
    });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Header state + velocity-reactive marquee skew, fed by the same scroll stream.
    let skewSetter: ((v: number) => gsap.core.Tween) | null = null;
    let skewTarget: HTMLElement | null = null;
    const onScroll = (l: { scroll: number; velocity: number }) => {
      document.querySelector(".nav")?.classList.toggle("is-scrolled", l.scroll > 8);
      const marquee = document.querySelector<HTMLElement>(".marquee");
      if (marquee !== skewTarget) {
        skewTarget = marquee;
        skewSetter = marquee ? gsap.quickTo(marquee, "skewX", { duration: 0.4, ease: "power2.out" }) : null;
      }
      skewSetter?.(gsap.utils.clamp(-4, 4, l.velocity * 0.28));
    };
    lenis.on("scroll", onScroll);

    // Same-page hash links glide through Lenis instead of jumping.
    const onAnchorClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]');
      const id = a?.getAttribute("href")?.slice(1);
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -76 });
    };
    document.addEventListener("click", onAnchorClick);

    engineRef.current = { perRoute: [] };

    return () => {
      document.removeEventListener("click", onAnchorClick);
      lenis.destroy();
      lenisRef.current = null;
      gsap.ticker.remove(tick);
      engineRef.current?.perRoute.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
      engineRef.current = null;
      document.body.classList.remove("reveal-ready", "gsap-on");
    };
  }, []);

  // Per-route setup: reveals + parallax + stat counters. rAF lets the new
  // route's DOM paint before we measure.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.perRoute.forEach((t) => {
      t.scrollTrigger?.kill();
      t.kill();
    });
    engine.perRoute = [];

    if (!firstRouteRef.current) {
      lenisRef.current?.scrollTo(0, { immediate: true });
    }
    firstRouteRef.current = false;

    const raf = requestAnimationFrame(() => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const track = engine.perRoute;

      // --- Rising reveals ---
      const targets = Array.from(
        document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)")
      );
      let onScreenIndex = 0;
      for (const el of targets) {
        const settle = () => el.classList.add("is-visible");
        if (el.getBoundingClientRect().top < vh * 0.88) {
          track.push(
            gsap.to(el, {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              ease: "power3.out",
              delay: 0.08 * onScreenIndex++,
              onComplete: settle,
            })
          );
        } else {
          track.push(
            gsap.to(el, {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              onComplete: settle,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            })
          );
        }
      }

      // --- Proof stats count up on load ---
      document.querySelectorAll<HTMLElement>(".hero__proof-item b").forEach((b) => {
        const raw = b.textContent ?? "";
        const match = raw.match(/^([\d.]+)(.*)$/);
        if (!match) return;
        const end = parseFloat(match[1]);
        if (!Number.isFinite(end)) return;
        const decimals = (match[1].split(".")[1] ?? "").length;
        const suffix = match[2] ?? "";
        const counter = { v: 0 };
        track.push(
          gsap.to(counter, {
            v: end,
            duration: 1.4,
            delay: 0.35,
            ease: "power2.out",
            onUpdate: () => {
              b.textContent = `${counter.v.toFixed(decimals)}${suffix}`;
            },
            onComplete: () => {
              b.textContent = raw;
            },
          })
        );
      });

      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
