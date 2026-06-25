"use client";

import { useEffect, useRef, useState } from "react";

import { OPEN_CHAT_EVENT } from "@/lib/chat-client";

/** Placeholder questions the input types out on a loop. First is the default. */
const PLACEHOLDERS = [
  "Ask what we'd build for your business…",
  "How fast can you ship my website?",
  "Can you automate my WhatsApp support?",
  "Build me a chatbot trained on my docs…",
  "Add AI search to my app…",
  "What would you build for a D2C brand?",
];

/**
 * Hero entry point for the AI assistant. It does NOT answer inline — typing a
 * question opens the corner chat widget with that question already asked, so the
 * whole conversation happens in one place.
 */
export function HeroPrompt() {
  const [input, setInput] = useState("");

  // Typewriter placeholder: types a question, holds, deletes, types the next.
  // Pauses while the field is focused (so it never fights the user) and falls
  // back to a static string under prefers-reduced-motion.
  const [typed, setTyped] = useState(PLACEHOLDERS[0]);
  const [caretOn, setCaretOn] = useState(true);
  const [focused, setFocused] = useState(false);
  const focusedRef = useRef(false);
  focusedRef.current = focused;

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let phrase = 0;
    let i = PLACEHOLDERS[0].length;
    let deleting = true;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (focusedRef.current) {
        timer = setTimeout(tick, 400);
        return;
      }
      const full = PLACEHOLDERS[phrase];
      if (!deleting) {
        i++;
        setTyped(full.slice(0, i));
        if (i >= full.length) {
          deleting = true;
          timer = setTimeout(tick, 1800);
          return;
        }
        timer = setTimeout(tick, 42 + Math.random() * 38);
      } else {
        i--;
        setTyped(full.slice(0, i));
        if (i <= 0) {
          deleting = false;
          phrase = (phrase + 1) % PLACEHOLDERS.length;
          timer = setTimeout(tick, 360);
          return;
        }
        timer = setTimeout(tick, 24);
      }
    };

    timer = setTimeout(tick, 1800);
    const blink = setInterval(() => setCaretOn((v) => !v), 520);
    return () => {
      clearTimeout(timer);
      clearInterval(blink);
    };
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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={
            focused ? "Ask what we'd build for your business…" : typed + (caretOn ? "▏" : " ")
          }
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
      </div>
    </div>
  );
}
