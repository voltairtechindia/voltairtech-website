"use client";

import { useEffect } from "react";
import gsap from "gsap";

/** Elements the ring reacts to (scale + rotate). */
const INTERACTIVE =
  'a, button, [role="button"], summary, label, .faq__item, .rag__chip';
/** Real text-entry targets — hide the custom cursor, let the native I-beam show. */
const TEXTUAL =
  'input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"]';
/** Buttons that lean toward the pointer and spring back on exit. */
const MAGNETIC = ".btn, .foot__btn, .nav__burger, .chat-widget-btn";
/** Card-shaped links — the ring grows into a labelled badge over these. */
const CARDS = "a.svc-card, a.hub-card, .post-list a, a.proof-card";

/**
 * Custom cursor: a vermilion square dot that tracks the pointer tightly and a
 * difference-blended square ring that trails it. Extras: the ring breathes
 * with pointer velocity, grows into an "open"/"visit" badge over card and
 * external links, magnetic buttons lean toward the pointer, and every click
 * punches a vermilion stamp. Pointer-fine devices only; never rendered for
 * touch or reduced-motion. The overlay uses the maximum z-index with
 * pointer-events:none so it rides above every popup without blocking clicks.
 */
export function Cursor() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const dot = document.createElement("div");
    dot.className = "vt-cursor vt-cursor--dot";
    dot.innerHTML = "<i></i>";
    const ring = document.createElement("div");
    ring.className = "vt-cursor vt-cursor--ring";
    ring.innerHTML = '<b><i></i><span class="vt-cursor__label"></span></b>';
    document.body.append(dot, ring);
    document.body.classList.add("vt-cursor-on");

    const labelEl = ring.querySelector<HTMLElement>(".vt-cursor__label");
    const ringWrap = ring.querySelector<HTMLElement>("b");

    gsap.set([dot, ring], { x: -100, y: -100 });
    const dotX = gsap.quickTo(dot, "x", { duration: 0.06, ease: "power2.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.06, ease: "power2.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });
    const speedTo = ringWrap
      ? gsap.quickTo(ringWrap, "scale", { duration: 0.3, ease: "power2.out" })
      : null;

    const cls = document.body.classList;
    let last = { x: 0, y: 0, t: 0 };
    let settle: ReturnType<typeof setTimeout> | undefined;
    let magnetEl: HTMLElement | null = null;
    let magnetCenter = { x: 0, y: 0 };

    const releaseMagnet = () => {
      if (!magnetEl) return;
      gsap.to(magnetEl, { x: 0, y: 0, duration: 0.4, ease: "power3.out" });
      magnetEl = null;
    };

    const onMove = (e: MouseEvent) => {
      cls.add("vt-cursor-live");
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);

      // Velocity breath — the ring swells slightly at speed, settles at rest.
      const now = performance.now();
      if (last.t && speedTo) {
        const dt = now - last.t;
        if (dt > 0) {
          const v = Math.hypot(e.clientX - last.x, e.clientY - last.y) / dt;
          speedTo(1 + Math.min(v * 0.14, 0.35));
          if (settle) clearTimeout(settle);
          settle = setTimeout(() => speedTo(1), 140);
        }
      }
      last = { x: e.clientX, y: e.clientY, t: now };

      if (magnetEl) {
        gsap.to(magnetEl, {
          x: (e.clientX - magnetCenter.x) * 0.08,
          y: (e.clientY - magnetCenter.y) * 0.08,
          duration: 0.4,
          ease: "power3.out",
        });
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      cls.toggle("vt-cursor-frame", t.tagName === "IFRAME");
      cls.toggle("vt-cursor-text", Boolean(t.closest(TEXTUAL)));
      cls.toggle("vt-cursor-hover", Boolean(t.closest(INTERACTIVE)));

      const anchor = t.closest("a");
      const badge = t.closest(CARDS)
        ? "open"
        : anchor instanceof HTMLAnchorElement && anchor.target === "_blank"
          ? "visit"
          : "";
      if (labelEl) labelEl.textContent = badge;
      cls.toggle("vt-cursor-label", Boolean(badge));

      const m = t.closest(MAGNETIC);
      if (m !== magnetEl) {
        releaseMagnet();
        if (m instanceof HTMLElement) {
          magnetEl = m;
          const cur = {
            x: Number(gsap.getProperty(m, "x")),
            y: Number(gsap.getProperty(m, "y")),
          };
          const r = m.getBoundingClientRect();
          magnetCenter = { x: r.left + r.width / 2 - cur.x, y: r.top + r.height / 2 - cur.y };
        }
      }
    };

    const onDown = (e: MouseEvent) => {
      cls.add("vt-cursor-down");
      const stamp = document.createElement("span");
      stamp.className = "vt-stamp";
      document.body.appendChild(stamp);
      gsap.fromTo(
        stamp,
        { x: e.clientX, y: e.clientY, scale: 0.4, opacity: 0.9, rotation: 45 },
        {
          scale: 1.7,
          opacity: 0,
          duration: 0.55,
          ease: "power2.out",
          onComplete: () => stamp.remove(),
        }
      );
    };
    const onUp = () => cls.remove("vt-cursor-down");
    const onLeave = () => {
      cls.remove("vt-cursor-live");
      releaseMagnet();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      if (settle) clearTimeout(settle);
      if (magnetEl) gsap.set(magnetEl, { x: 0, y: 0 });
      dot.remove();
      ring.remove();
      cls.remove(
        "vt-cursor-on",
        "vt-cursor-live",
        "vt-cursor-hover",
        "vt-cursor-text",
        "vt-cursor-frame",
        "vt-cursor-down",
        "vt-cursor-label"
      );
    };
  }, []);

  return null;
}
