"use client";

import { useEffect, useRef, useState } from "react";

import { OPEN_CHAT_EVENT } from "@/lib/chat-client";

/** Pool of starter prompts; a random few are shown each load. */
const STARTER_POOL = [
  "I run a D2C skincare brand, what would you build for me?",
  "Automate my WhatsApp customer support",
  "Add AI search to my existing app",
  "Build a chatbot trained on my company docs",
  "I want to cut support tickets with AI",
  "Turn my PDFs into a searchable knowledge base",
  "Add a voice agent to handle bookings",
  "Automate my lead follow-ups end to end",
  "Ship a website for my business in 48 hours",
];

const STARTER_COUNT = 3;

function pickStarters(): string[] {
  const pool = [...STARTER_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, STARTER_COUNT);
}

/**
 * Hero entry point for the AI assistant. It does NOT answer inline — typing a
 * question or picking a starter opens the corner chat widget with that question
 * already asked, so the whole conversation happens in one place.
 */
export function HeroPrompt() {
  const [input, setInput] = useState("");
  // Seed with a stable slice for SSR, then reshuffle on the client each load so
  // the chips vary on refresh without a hydration mismatch.
  const [starters, setStarters] = useState<string[]>(() =>
    STARTER_POOL.slice(0, STARTER_COUNT),
  );

  useEffect(() => {
    setStarters(pickStarters());
  }, []);

  // While this launcher is on screen, hide the floating chat button (they do the
  // same thing). It reappears once you scroll past the launcher.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        document.body.classList.toggle("hero-launcher-visible", entry.isIntersecting);
      },
      { rootMargin: "0px 0px -64px 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      document.body.classList.remove("hero-launcher-visible");
    };
  }, []);

  const ask = (raw: string) => {
    const message = raw.trim();
    if (!message) return;
    setInput("");
    window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT, { detail: { ask: message } }));
  };

  return (
    <div className="hero-demo" ref={rootRef}>
      <div className="hero-demo__inner">
      <form
        className="hero-demo__bar"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <span className="hero-demo__spark" aria-hidden="true">✦</span>
        <input
          className="hero-demo__input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask what we'd build for your business…"
          aria-label="Ask the Voltair AI what we'd build for you"
        />
        <button
          className="hero-demo__send"
          type="submit"
          disabled={!input.trim()}
          aria-label="Ask"
        >
          Ask →
        </button>
      </form>

      <div className="hero-demo__starters">
        {starters.map((s) => (
          <button key={s} type="button" className="hero-demo__chip" onClick={() => ask(s)}>
            {s}
          </button>
        ))}
      </div>
      </div>
    </div>
  );
}
