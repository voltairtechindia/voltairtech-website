"use client";

import { useEffect, useRef, useState } from "react";

const PRESETS = [
  "What can you build in 48 hours?",
  "How does a RAG system work?",
  "What does a WhatsApp chatbot cost?",
  "Are you DPDP Act 2023 compliant?",
  "What's your tech stack?",
];

type Msg = { from: "bot" | "user"; text: string; error?: boolean };

const SESSION_KEY = "voltair_chat_session";

/** Stable per-browser session id so a conversation threads together server-side. */
function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "sess_ephemeral_" + Date.now().toString(36);
  }
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

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [showPresets, setShowPresets] = useState(true);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, busy]);

  const submit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setShowPresets(false);
    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          session_id: getSessionId(),
          page_url: typeof location !== "undefined" ? location.href : undefined,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        reply?: string;
        detail?: string;
      } | null;
      if (!res.ok) {
        // Rate-limit / quota / validation errors carry a friendly `detail`;
        // show it as a normal reply. Only fall back to the lead-capture form
        // when we got nothing usable back (a real outage).
        if (data?.detail) {
          setMessages((prev) => [...prev, { from: "bot", text: data.detail! }]);
          return;
        }
        throw new Error(`Request failed (${res.status})`);
      }
      setMessages((prev) => [...prev, { from: "bot", text: data?.reply ?? "" }]);
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

  return (
    <>
      <button
        className="chat-widget-btn"
        title="Chat with the Voltair AI Specialist"
        aria-label="Open chat"
        onClick={() => setOpen(true)}
        type="button"
        style={open ? { transform: "scale(0)", opacity: 0 } : undefined}
      >
        <IconChat />
      </button>

      <div className={`chat-widget-window${open ? " active" : ""}`} role="dialog" aria-label="Voltair AI Specialist">
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar"><IconBot /></div>
            <div className="chat-title-box">
              <h4>Voltair AI Specialist</h4>
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
            Hi! I&apos;m the Voltair AI Specialist. Ask me about what we build — AI websites in
            48 hours, RAG systems, WhatsApp chatbots, automation, pricing, or DPDP compliance.
            Pick a preset or type your question.
            {showPresets && (
              <div className="chat-preset-chips">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    className="preset-chip"
                    type="button"
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
              {m.text}
              {m.error && <FallbackForm />}
            </div>
          ))}
          {busy && (
            <div className="chat-msg bot" aria-live="polite">
              <span className="chat-typing">
                <span />
                <span />
                <span />
              </span>
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
            disabled={busy}
            required
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send">
            <IconSend />
          </button>
        </form>
      </div>
    </>
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
