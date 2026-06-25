"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import Markdown from "./Markdown";
import {
  getChatSessionId,
  splitTrailer,
  OPEN_CHAT_EVENT,
} from "@/lib/chat-client";
import {
  detectPages,
  isContactIntent,
  isGetStarted,
  pageContext,
  sourceLinks,
  suggestFollowups,
  type NavLink,
  type PageContext,
  type SourceRef,
} from "@/lib/site-map";

type Msg = {
  from: "bot" | "user";
  text: string;
  error?: boolean;
  /** Source deep-links + section nav, surfaced as buttons under a bot reply. */
  actions?: NavLink[];
  /** Tailored next-question chips. */
  followups?: string[];
  /** Inline lead-capture form (strong buying intent). */
  lead?: boolean;
  animate?: boolean;
};

interface TypewriterTextProps {
  text: string;
  onComplete: () => void;
  onProgress: () => void;
}

function TypewriterText({ text, onComplete, onProgress }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const intervalTime = 18; // ms per step
    // Granular step size: types exactly 1 letter at a time, scaling slightly for longer replies
    let charsPerStep = 1;
    if (text.length > 800) {
      charsPerStep = 3;
    } else if (text.length > 400) {
      charsPerStep = 2;
    }

    const timer = setInterval(() => {
      indexRef.current += charsPerStep;
      if (indexRef.current >= text.length) {
        setDisplayedText(text);
        clearInterval(timer);
        onCompleteRef.current();
      } else {
        setDisplayedText(text.slice(0, indexRef.current));
        onProgressRef.current();
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [text]);

  return <Markdown>{displayedText}</Markdown>;
}

const OPENED_KEY = "voltair_chat_opened";
const DISMISS_KEY = "voltair_peek_dismissed";
const LEAD_SHOWN_KEY = "voltair_lead_shown";
const SCROLL_TRIGGER = 0.35;
const MAX_DISMISSALS = 2;

function ss(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function ssSet(key: string, val: string) {
  try {
    sessionStorage.setItem(key, val);
  } catch {
    /* ignore */
  }
}

function leadShown(): boolean {
  try {
    return sessionStorage.getItem(LEAD_SHOWN_KEY) === "1";
  } catch {
    return false;
  }
}
function markLeadShown(): void {
  try {
    sessionStorage.setItem(LEAD_SHOWN_KEY, "1");
  } catch {
    /* ignore */
  }
}

function dedupeLinks(links: NavLink[]): NavLink[] {
  const seen = new Set<string>();
  return links.filter((l) => (seen.has(l.href) ? false : (seen.add(l.href), true)));
}

/* --- inline icons (Voltair uses next/font + SVG, no icon CDN) --------------- */
function IconChat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
function IconBot() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconSend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function Typing() {
  return (
    <span className="chat-typing" aria-live="polite">
      <span />
      <span />
      <span />
    </span>
  );
}

const FALLBACK_CTX = pageContext("/", "");

export default function ChatWidget() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [ctx, setCtx] = useState<PageContext>(() => pageContext(pathname || "/", ""));
  const [peekOpen, setPeekOpen] = useState(false);
  const [peekText, setPeekText] = useState("");

  const bodyRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const peekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Refs let the dwell timer read live state without re-arming on every change.
  const openRef = useRef(open);
  openRef.current = open;

  const isAnimating = messages.some((m) => m.animate);
  const isWide = messages.some((m) => m.text.length > 250 || (m.text && (m.text.includes("```") || m.text.includes("|"))));

  const handleProgress = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    const threshold = 120;
    const isNearBottom = el.scrollHeight - el.clientHeight - el.scrollTop < threshold;
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  const handleComplete = useCallback((index: number) => {
    setMessages((prev) =>
      prev.map((msg, idx) => (idx === index ? { ...msg, animate: false } : msg)),
    );
    setTimeout(() => {
      const el = bodyRef.current;
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }
    }, 50);
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = bodyRef.current;
    if (!el) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.from === "user" || busy) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } else {
      const threshold = 120;
      const isNearBottom = el.scrollHeight - el.clientHeight - el.scrollTop < threshold;
      if (isNearBottom) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [messages, busy, open]);

  /* Keep the chat sheet (and its input) above the mobile on-screen keyboard.
     Feed the VisualViewport's keyboard inset + visible height into CSS vars
     (--kb / --vvh) that the mobile layout reads; the input stays in view. */
  useEffect(() => {
    const el = windowRef.current;
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!el) return;

    const update = () => {
      if (!open || !vv) {
        el.style.removeProperty("--kb");
        el.style.removeProperty("--vvh");
        return;
      }
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      el.style.setProperty("--kb", `${kb}px`);
      el.style.setProperty("--vvh", `${vv.height}px`);
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    };

    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      el.style.removeProperty("--kb");
      el.style.removeProperty("--vvh");
    };
  }, [open]);

  // Resolve the context for the page the visitor is on.
  useEffect(() => {
    const title =
      typeof document !== "undefined"
        ? document.title.replace(/\s*\|\s*Voltair Tech.*$/i, "").trim()
        : "";
    setCtx(pageContext(pathname || "/", title));
  }, [pathname]);

  // Proactive peek: gently expand from the icon once the visitor has spent
  // time (dwell) or scrolled into a page, asking about the current topic.
  useEffect(() => {
    setPeekOpen(false);
    if (peekTimer.current) {
      clearTimeout(peekTimer.current);
      peekTimer.current = null;
    }

    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const path = pathname || "/";
    const dismissals = Number(ss(DISMISS_KEY) || "0");
    const eligible =
      !open &&
      ss(OPENED_KEY) !== "1" &&
      dismissals < MAX_DISMISSALS &&
      ss(`voltair_peeked:${path}`) !== "1" &&
      messages.length === 0;

    if (!eligible || !ctx.peek) return;

    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      window.removeEventListener("scroll", onScroll);
      if (ss(OPENED_KEY) === "1" || openRef.current) return;

      const title = document.title.replace(/\s*\|\s*Voltair Tech.*$/i, "").trim();
      const currentContext = pageContext(path, title);
      setPeekText(currentContext.peek ?? ctx.peek ?? "");
      setPeekOpen(true);
      ssSet(`voltair_peeked:${path}`, "1");
    };

    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      if (max > 0 && el.scrollTop / max >= SCROLL_TRIGGER) fire();
    };

    peekTimer.current = setTimeout(fire, ctx.peekDelayMs);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (peekTimer.current) clearTimeout(peekTimer.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname, open, ctx.peek, ctx.peekDelayMs, messages.length]);

  const openChat = () => {
    setOpen(true);
    setPeekOpen(false);
    ssSet(OPENED_KEY, "1");
    ssSet(`voltair_peeked:${pathname || "/"}`, "1");
  };

  // The hero launcher opens the widget with a question pre-asked: open the
  // sheet, then run the same submit() the input uses so the answer streams here.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const ask = (e as CustomEvent<{ ask?: string }>).detail?.ask;
      setOpen(true);
      setPeekOpen(false);
      ssSet(OPENED_KEY, "1");
      if (typeof ask === "string" && ask.trim()) {
        submitRef.current(ask);
      }
    };
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, []);

  // Flag the body while the chat is open so the redundant hero launcher hides.
  useEffect(() => {
    document.body.classList.toggle("chat-open", open);
    return () => document.body.classList.remove("chat-open");
  }, [open]);

  const dismissPeek = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPeekOpen(false);
    ssSet(DISMISS_KEY, String(Number(ss(DISMISS_KEY) || "0") + 1));
  };
  const goTo = (href: string) => {
    router.push(href);
    // On phones the open window covers the page — close it so they see where
    // they landed. On desktop the chat stays open beside the new page.
    if (typeof window !== "undefined" && window.innerWidth < 640) setOpen(false);
  };

  const submit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy || isAnimating) return;
    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setInput("");
    setBusy(true);

    const pc = ctx;
    const page = {
      path: pathname || "/",
      title: typeof document !== "undefined" ? document.title : "",
      topic: pc.topic ?? "",
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          session_id: getChatSessionId(),
          page_url: typeof location !== "undefined" ? location.href : undefined,
          page,
        }),
      });

      if (!res.ok) {
        // Rate-limit / quota / validation errors carry a friendly `detail`;
        // show it as a normal reply. Only fall back to the lead-capture form
        // when we got nothing usable back (a real outage).
        const data = (await res.json().catch(() => null)) as { detail?: string } | null;
        if (data?.detail) {
          setMessages((prev) => [...prev, { from: "bot", text: data.detail!, animate: true }]);
          return;
        }
        throw new Error(`Request failed (${res.status})`);
      }

      const text = await res.text();
      const { reply, sources } = splitTrailer(text);
      const links = sourceLinks(sources, pathname || "/", 2);
      const navs = detectPages(`${trimmed} ${reply}`, { exclude: pathname || "/", limit: 2 }).map(
        (p) => ({ href: p.href, label: p.label }),
      );
      let merged = [...links, ...navs];
      // A visitor who wants to connect should always get a one-tap route to
      // /contact — even if cited-source deep-links would fill both button slots.
      if (isContactIntent(trimmed) && (pathname || "/") !== "/contact") {
        const contact =
          navs.find((n) => n.href === "/contact") ?? { href: "/contact", label: "Contact us" };
        merged = [contact, ...merged.filter((m) => m.href !== "/contact")];
      }
      const actions = dedupeLinks(merged).slice(0, 2);
      const lead = isGetStarted(trimmed) && !leadShown();
      const followups = lead ? [] : suggestFollowups(trimmed, reply, pc);
      if (lead) markLeadShown();

      setMessages((prev) => [
        ...prev,
        { from: "bot", text: reply, actions, followups, lead, animate: true },
      ]);
    } catch (err) {
      console.error("[voltair-chat]", err);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          error: true,
          text: "Sorry, I couldn't reach the assistant just now. Leave your details and the Voltair team will get back to you shortly.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  // Keep the latest submit reachable from the (mount-only) hero-launch listener.
  const submitRef = useRef(submit);
  submitRef.current = submit;

  const view = ctx ?? FALLBACK_CTX;
  return (
    <>
      {peekOpen && !open && (
        <div
          className="chat-peek"
          role="button"
          tabIndex={0}
          onClick={openChat}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") openChat();
          }}
          aria-label="Open chat with the Voltair AI Specialist"
        >
          <span className="chat-peek-avatar"><IconBot /></span>
          <span className="chat-peek-body">
            <span className="chat-peek-text">{peekText}</span>
            <span className="chat-peek-cta">Ask the AI Specialist <IconArrow /></span>
          </span>
          <button className="chat-peek-close" onClick={dismissPeek} type="button" aria-label="Dismiss">
            <IconClose />
          </button>
        </div>
      )}

      <button
        className="chat-widget-btn"
        title="Chat with the Voltair AI Specialist"
        aria-label="Open chat"
        onClick={openChat}
        type="button"
        style={open ? { transform: "scale(0)", opacity: 0 } : undefined}
      >
        <IconChat />
        <span className="chat-widget-btn-label">Ask Voltair AI</span>
      </button>

      <div ref={windowRef} className={`chat-widget-window${open ? " active" : ""}${isWide ? " wide" : ""}`} role="dialog" aria-label="Voltair AI Specialist">
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar"><IconBot /></div>
            <div className="chat-title-box">
              <h2>Voltair AI Specialist</h2>
              <p>
                <span className="status-dot" />
                <span>Online &amp; Ready</span>
              </p>
            </div>
          </div>
          <button className="chat-close" onClick={() => setOpen(false)} type="button" aria-label="Close chat">
            <IconClose />
          </button>
        </div>
        <div className="chat-body" ref={bodyRef}>
          <div className="chat-msg bot">
            <Markdown>{view.greeting}</Markdown>
            {messages.length === 0 && (
              <div className="chat-preset-chips">
                {view.presets.map((p) => (
                  <button
                    key={p}
                    className="preset-chip"
                    type="button"
                    disabled={busy || isAnimating}
                    onClick={() => submit(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.from}`}>
              {m.from === "bot" && !m.error ? (
                m.animate ? (
                  <TypewriterText
                    text={m.text}
                    onComplete={() => handleComplete(i)}
                    onProgress={handleProgress}
                  />
                ) : (
                  <Markdown>{m.text}</Markdown>
                )
              ) : (
                m.text
              )}
              {m.error && <FallbackForm />}
              {!m.animate && m.from === "bot" && m.actions && m.actions.length > 0 && (
                <div className="chat-actions">
                  {m.actions.map((a) => (
                    <button key={a.href} className="chat-action" type="button" onClick={() => goTo(a.href)}>
                      {a.label} <IconArrow />
                    </button>
                  ))}
                </div>
              )}
              {!m.animate && m.from === "bot" && m.lead && <LeadForm />}
              {!m.animate && m.from === "bot" && m.followups && m.followups.length > 0 && (
                <div className="chat-followups">
                  <span className="chat-followups-label">Keep exploring</span>
                  <div className="chat-preset-chips">
                    {m.followups.map((q) => (
                      <button
                        key={q}
                        className="preset-chip"
                        type="button"
                        disabled={busy || isAnimating}
                        onClick={() => submit(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {busy && (
            <div className="chat-msg bot">
              <Typing />
            </div>
          )}
        </div>

        <form
          className="chat-input-box"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here…"
            disabled={busy || isAnimating}
            required
          />
          <button type="submit" disabled={busy || isAnimating || !input.trim()} aria-label="Send">
            <IconSend />
          </button>
        </form>
      </div>
    </>
  );
}

/** Inline lead capture shown on strong buying intent — posts to /api/contact. */
function LeadForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  if (state === "done")
    return (
      <div className="chat-lead-done">
        Got it — the Voltair team will reach out shortly. ⚡
      </div>
    );

  const send = async () => {
    if (!name.trim() || !email.trim()) return;
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message: message.trim() || "Started a project via the chat assistant.",
          channel: "email",
          page_url: typeof location !== "undefined" ? location.href : undefined,
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="chat-lead">
      <div className="chat-lead-title">Start your project</div>
      <p className="chat-lead-sub">Drop your details and we&apos;ll map your build — usually within a day.</p>
      <div className="chat-fallback-form">
        <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <textarea placeholder="What do you want to build? (optional)" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} />
        {state === "error" ? (
          <div className="chat-lead-err">Couldn&apos;t send — please email business@voltairtech.com.</div>
        ) : null}
        <button type="button" onClick={send} disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send to Voltair"}
        </button>
      </div>
    </div>
  );
}

/** Shown only when the assistant is unreachable — captures a real lead via /api/contact. */
function FallbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  if (state === "done")
    return (
      <div style={{ color: "var(--v-red)", fontWeight: 700, marginTop: 12 }}>
        Thanks — we&apos;ve got your details and will email you shortly.
      </div>
    );

  const send = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          channel: "email",
          page_url: typeof location !== "undefined" ? location.href : undefined,
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="chat-fallback-form" style={{ marginTop: 12 }}>
      <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <textarea placeholder="What do you want to build?" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} required />
      {state === "error" ? (
        <div style={{ color: "var(--v-red-deep)", fontSize: 13, marginBottom: 6 }}>
          Could not send — please email business@voltairtech.com.
        </div>
      ) : null}
      <button type="button" onClick={send} disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send to Voltair"}
      </button>
    </div>
  );
}
