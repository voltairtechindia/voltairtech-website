"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CONTENT } from "@/lib/content";
import { LEAD_FLAG } from "@/lib/gtag-events";
import { Kicker } from "./atoms/Kicker";
import { Arr } from "./atoms/Arr";

type Status = "idle" | "sending" | "done" | "error";
type Channel = "whatsapp" | "email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Shorter than this isn't a brief we can scope, so it can't unlock the button. */
const MIN_BRIEF = 10;

const digitsOf = (s: string) => s.replace(/\D/g, "");

const STEPS = [
  {
    b: "Send your brief",
    t: "One or two lines is enough. No forms, no decks, no discovery call.",
  },
  {
    b: "We reply in under an hour",
    t: `Scope, a fixed price, and a start date. ${CONTENT.brand.hours}.`,
  },
  {
    b: "We start building",
    t: "Websites go live in 48 hours. Larger builds ship on a weekly plan.",
  },
];

export function BigInput() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [val, setVal] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [chan, setChan] = useState<Channel>("whatsapp");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const nameOk = name.trim().length >= 2;
  const phoneDigits = digitsOf(whatsapp).length;
  const contactOk =
    chan === "whatsapp"
      ? phoneDigits >= 8 && phoneDigits <= 15
      : EMAIL_RE.test(email.trim());
  const briefOk = val.trim().length >= MIN_BRIEF;
  const ready = nameOk && contactOk && briefOk;

  const hint = nameOk
    ? contactOk
      ? briefOk
        ? null
        : "Add a line about what you want built."
      : chan === "whatsapp"
        ? "Add your WhatsApp number with country code, e.g. +91 70210 00764."
        : "Add a valid email address."
    : "Add your name to continue.";

  const submit = async () => {
    if (!ready || status === "sending" || status === "done") return;
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: chan === "email" ? email : "",
          phone: chan === "whatsapp" ? whatsapp : "",
          message: val,
          channel: chan,
          website, // honeypot — bots fill it, humans don't
          page_url: typeof location !== "undefined" ? location.href : undefined,
        }),
      });
      const data = (await res.json().catch(() => null)) as { detail?: string } | null;
      if (!res.ok) {
        setError(data?.detail ?? `Could not send. Please email ${CONTENT.brand.email}.`);
        setStatus("error");
        return;
      }
      // The Google Ads conversion fires on /thank-you, not here: a beacon sent
      // from a page we're about to navigate away from can be dropped in flight.
      // The flag proves this visit is a real lead; ?ref=form is the fallback for
      // in-app browsers that block sessionStorage.
      try {
        sessionStorage.setItem(LEAD_FLAG, "1");
      } catch {
        // storage blocked — the query param carries the signal instead
      }
      setStatus("done");
      router.push("/thank-you?ref=form");
    } catch {
      setError(`Could not send. Please email ${CONTENT.brand.email}.`);
      setStatus("error");
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="bi">
          <div className="bi__hd">
            <div>
              <Kicker>Contact Voltair Tech</Kicker>
              <h1 className="bi__h">
                Get a <em>free project plan.</em>
              </h1>
            </div>
            <p className="lead bi__lede">
              Tell us what you want to build. We read every message and reply within an
              hour with scope, a fixed price, and a start date. No cost, no obligation.
            </p>
          </div>

          <ol className="steps bi__steps">
            {STEPS.map((s, i) => (
              <li className="step" key={s.b}>
                <span className="step__n">{`0${i + 1}`}</span>
                <div>
                  <b className="step__b">{s.b}</b>
                  <span className="step__t">{s.t}</span>
                </div>
              </li>
            ))}
          </ol>

          {status === "done" ? (
            <div className="bi__field bi__done">
              <strong>Brief sent. Taking you to the confirmation page…</strong>
              <p className="meta bi__done-sub">
                Not redirected? <Link href="/thank-you">Continue here</Link> — or reach
                us at {CONTENT.brand.email} · {CONTENT.brand.phone}.
              </p>
            </div>
          ) : (
            <div className="bi__field">
              <div className="bi__identity">
                <div className="bi__group">
                  <label className="bi__label" htmlFor="bi-name">
                    Your name
                  </label>
                  <input
                    id="bi-name"
                    className="bi__input"
                    type="text"
                    placeholder="Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div className="bi__group">
                  <label className="bi__label" htmlFor="bi-contact">
                    {chan === "whatsapp"
                      ? "WhatsApp number (with country code)"
                      : "Email address"}
                  </label>
                  {chan === "whatsapp" ? (
                    <input
                      id="bi-contact"
                      className="bi__input"
                      type="tel"
                      inputMode="tel"
                      placeholder="+91 70210 00764"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      autoComplete="tel"
                    />
                  ) : (
                    <input
                      id="bi-contact"
                      className="bi__input"
                      type="email"
                      placeholder="priya@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  )}
                </div>
              </div>

              {/* Honeypot: visually hidden, off-screen; real users never fill it. */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="bi__hp"
              />

              <div className="bi__group">
                <label className="bi__label" htmlFor="bi-brief">
                  What do you want to build?
                </label>
                <textarea
                  id="bi-brief"
                  className="bi__textarea"
                  placeholder="A WhatsApp bot that answers questions over our 800-page policy doc, in Hindi and English…"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  aria-describedby={hint ? "bi-hint" : undefined}
                />
              </div>

              <div className="bi__row">
                <div className="bi__channels" role="group" aria-label="Where should we reply?">
                  <span className="meta mono-lbl">reply on</span>
                  {(["whatsapp", "email"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={"bi__channel " + (chan === c ? "on" : "")}
                      aria-pressed={chan === c}
                      onClick={() => setChan(c)}
                    >
                      {c === "whatsapp" ? "WhatsApp" : "Email"}
                    </button>
                  ))}
                </div>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={submit}
                  disabled={!ready || status === "sending"}
                  aria-describedby={hint ? "bi-hint" : undefined}
                >
                  {status === "sending" ? "Sending…" : "Get my free plan"} <Arr />
                </button>
              </div>

              {hint ? (
                <p className="bi__hint" id="bi-hint">
                  {hint}
                </p>
              ) : null}
              {error ? (
                <p className="bi__err" role="alert">
                  {error}
                </p>
              ) : null}

              <p className="bi__trust">
                Free and no obligation. Your details reach our team only — read our{" "}
                <Link href="/privacy">privacy policy</Link>.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
