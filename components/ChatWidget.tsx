"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import Markdown from "./Markdown";
import { OPEN_CHAT_EVENT } from "@/lib/chat-client";
import { sendLead } from "@/lib/leads";
import {
  detectPages,
  isContactIntent,
  pageContext,
  type NavLink,
  type PageContext,
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
  /** The question a person on the team will answer; shown with a reply form. */
  ask?: string;
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

    // The site is static, so there is no live assistant. A person on the team
    // answers: show where the question is going, collect a way to reply, and
    // still offer the most relevant pages to read meanwhile.
    const navs = detectPages(trimmed, { exclude: pathname || "/", limit: 2 }).map((p) => ({
      href: p.href,
      label: p.label,
    }));
    if (isContactIntent(trimmed) && (pathname || "/") !== "/contact") {
      navs.unshift({ href: "/contact", label: "Contact us" });
    }
    const actions = dedupeLinks(navs).slice(0, 2);
    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text: "Good question. A person from our team answers these, usually within a few hours. Leave your name and email or WhatsApp number and we'll reply there.",
        actions,
        ask: trimmed,
        animate: true,
      },
    ]);
    setBusy(false);
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
          aria-label="Ask the Voltair team a question"
        >
          <span className="chat-peek-avatar"><IconBot /></span>
          <span className="chat-peek-body">
            <span className="chat-peek-text">{peekText}</span>
            <span className="chat-peek-cta">Ask the team <IconArrow /></span>
          </span>
          <button className="chat-peek-close" onClick={dismissPeek} type="button" aria-label="Dismiss">
            <IconClose />
          </button>
        </div>
      )}

      <button
        className="chat-widget-btn"
        title="Ask the Voltair team"
        aria-label="Open chat"
        onClick={openChat}
        type="button"
        style={open ? { transform: "scale(0)", opacity: 0 } : undefined}
      >
        <IconChat />
        <span className="chat-widget-btn-label">Ask Voltair</span>
      </button>

      <div ref={windowRef} className={`chat-widget-window${open ? " active" : ""}${isWide ? " wide" : ""}`} role="dialog" aria-label="Ask the Voltair team">
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar"><IconBot /></div>
            <div className="chat-title-box">
              <h2>Ask the Voltair team</h2>
              <p>
                <span className="status-dot" />
                <span>Replies within a few hours</span>
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
              {!m.animate && m.from === "bot" && m.ask && <AskForm question={m.ask} />}
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

/** Inline lead capture shown on strong buying intent. Goes to the Website Leads sheet. */
function LeadForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  if (state === "done")
    return (
      <div className="chat-lead-done">
        Got it. The Voltair team will reach out shortly. ⚡
      </div>
    );

  const send = async () => {
    if (!name.trim() || !email.trim()) return;
    setState("sending");
    try {
      await sendLead("chat", {
        name,
        email,
        message: message.trim() || "Wants to start a project (from the chat).",
      });
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="chat-lead">
      <div className="chat-lead-title">Start your project</div>
      <p className="chat-lead-sub">Drop your details and we&apos;ll map your build, usually within a day.</p>
      <div className="chat-fallback-form">
        <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <textarea placeholder="What do you want to build? (optional)" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} />
        {state === "error" ? (
          <div className="chat-lead-err">Couldn&apos;t send. Please email business@voltairtech.com.</div>
        ) : null}
        <button type="button" onClick={send} disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send to Voltair"}
        </button>
      </div>
    </div>
  );
}

/** Shown only when something went wrong. Goes to the Website Leads sheet. */
function FallbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  if (state === "done")
    return (
      <div style={{ color: "var(--v-red)", fontWeight: 700, marginTop: 12 }}>
        Thanks. We&apos;ve got your details and will email you shortly.
      </div>
    );

  const send = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setState("sending");
    try {
      await sendLead("chat", { name, email, message });
      setState("done");
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
          Could not send. Please email business@voltairtech.com.
        </div>
      ) : null}
      <button type="button" onClick={send} disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send to Voltair"}
      </button>
    </div>
  );
}

/** Reply form under a question. Name plus email or WhatsApp, then it goes to the team. */
function AskForm({ question }: { question: string }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  if (state === "done")
    return (
      <div className="chat-lead-done">
        Got it. We&apos;ll reply to {contact.trim()} shortly.
      </div>
    );

  const isEmail = /@/.test(contact);
  const digits = contact.replace(/[^0-9]/g, "").length;
  const ok = name.trim().length >= 2 && (isEmail ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact.trim()) : digits >= 8 && digits <= 15);

  const send = async () => {
    if (!ok) return;
    setState("sending");
    try {
      await sendLead("chat", {
        name,
        email: isEmail ? contact : "",
        phone: isEmail ? "" : contact,
        reply_on: isEmail ? "Email" : "WhatsApp",
        question,
      });
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="chat-fallback-form" style={{ marginTop: 12 }}>
      <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input
        type="text"
        inputMode="email"
        placeholder="Email or WhatsApp number"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        required
      />
      {state === "error" ? (
        <div className="chat-lead-err">Couldn&apos;t send. Please email business@voltairtech.com.</div>
      ) : null}
      <button type="button" onClick={send} disabled={state === "sending" || !ok}>
        {state === "sending" ? "Sending…" : "Send my question"}
      </button>
    </div>
  );
}
