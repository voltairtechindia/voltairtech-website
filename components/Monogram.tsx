"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";

export function Monogram() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const plate = plateRef.current;
    const glow = glowRef.current;
    if (!wrap || !plate) return;

    let targetRX = 0, targetRY = 0, gx = 50, gy = 50;
    let curRX = 0, curRY = 0;

    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      targetRY = (x - 0.5) * 10;
      targetRX = (0.5 - y) * 8;
      gx = Math.max(0, Math.min(100, x * 100));
      gy = Math.max(0, Math.min(100, y * 100));
    };
    const onLeave = () => { targetRX = 0; targetRY = 0; gx = 50; gy = 50; };

    const loop = () => {
      curRX += (targetRX - curRX) * 0.08;
      curRY += (targetRY - curRY) * 0.08;
      plate.style.transform = `rotateX(${curRX}deg) rotateY(${curRY}deg)`;
      if (glow) {
        glow.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(226,58,36,0.22), transparent 55%)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="v-mono" ref={wrapRef}>
      <div className="v-mono__wrap">
        <div className="v-mono__plate v-mono__plate--photo" ref={plateRef}>
          <Image
            className="v-mono__img"
            src="/logo-landscape.webp"
            alt="Voltair Tech monogram on a starfield"
            fill
            sizes="(max-width: 980px) 100vw, 50vw"
            priority
          />
          <div className="v-mono__sheen" ref={glowRef} />
        </div>
        <div className="v-mono__chip v-mono__chip--1">
          <span className="d" />WEBSITES · 48H
        </div>
        <div className="v-mono__chip v-mono__chip--2">
          <span className="d" />MUMBAI · IST
        </div>
        <div className="v-mono__chip v-mono__chip--3">
          <span className="d" />EST. 2024
        </div>
      </div>
    </div>
  );
}
