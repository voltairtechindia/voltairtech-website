"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CONTENT } from "@/lib/content";
import { LEAD_FLAG } from "@/lib/gtag-events";
import { Arr } from "./atoms/Arr";

type Status = "idle" | "sending" | "done" | "error";
type Channel = "whatsapp" | "email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Shorter than this isn't a brief we can scope, so it can't unlock the button. */
const MIN_BRIEF = 10;

const digitsOf = (s: string) => s.replace(/\D/g, "");

const STEPS = [
  { b: "Send your brief", t: "One or two lines is enough." },
  { b: "We reply in under an hour", t: CONTENT.brand.hours + "." },
  { b: "We start building", t: "Websites go live in 48 hours." },
];

const EXAMPLES = [
  "A WhatsApp bot that answers questions from our 800-page policy doc, in Hindi and English…",
  "A booking site for our clinic that texts patients a reminder the day before…",
  "An automation that reads supplier invoices from Gmail and files them into Sheets…",
  "A chatbot on our store that recommends products and hands off to a human on request…",
  "An internal search tool over five years of project reports and contracts…",
  "A dashboard that pulls our Shopify orders and flags the ones likely to be returned…",
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

  const [touched, setTouched] = useState({ name: false, contact: false, brief: false });
  const touch = (k: keyof typeof touched) => setTouched((t) => ({ ...t, [k]: true }));

  // /contact is prerendered, so the example has to be picked after mount —
  // randomising during render would hand the client different HTML than the
  // server sent and blow up hydration. Swapping a placeholder post-paint is
  // invisible: it shifts nothing and the field is empty either way.
  const [placeholder, setPlaceholder] = useState(EXAMPLES[0]);
  useEffect(() => {
    setPlaceholder(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]);
  }, []);

  const nameOk = name.trim().length >= 2;
  const phoneDigits = digitsOf(whatsapp).length;
  const contactOk =
    chan === "whatsapp"
      ? phoneDigits >= 8 && phoneDigits <= 15
      : EMAIL_RE.test(email.trim());
  const briefOk = val.trim().length >= MIN_BRIEF;
  const ready = nameOk && contactOk && briefOk;

  const nameError = nameOk
    ? null
    : name.trim()
      ? "Please enter at least two characters."
      : "Please enter your name.";

  const contactError = contactOk
    ? null
    : chan === "whatsapp"
      ? !whatsapp.trim()
        ? "Please enter your WhatsApp number."
        : phoneDigits > 15
          ? "That number has too many digits."
          : "Include the country code — e.g. +91 70210 00764."
      : !email.trim()
        ? "Please enter your email address."
        : "That doesn't look like a valid email address.";

  const briefError = briefOk
    ? null
    : val.trim()
      ? "A few more words, please — tell us what you want built."
      : "Please tell us what you want to build.";

  // A field only complains once you've left it, so nothing turns red while
  // someone is still halfway through typing an address.
  const show = {
    name: touched.name && !!nameError,
    contact: touched.contact && !!contactError,
    brief: touched.brief && !!briefError,
  };
  const anyFieldError = show.name || show.contact || show.brief;

  // Explains the greyed-out button, but stands down while a field is already
  // showing its own message so the same problem isn't stated twice.
  const hint =
    ready || anyFieldError
      ? null
      : !nameOk
        ? "Add your name to continue."
        : !contactOk
          ? chan === "whatsapp"
            ? "Add your WhatsApp number with country code."
            : "Add your email address."
          : "Add a line about what you want built.";

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
    <section className="section section--contact">
      <div className="container">
        <div className="bi">
          <div className="bi__hd">
            <h1 className="bi__h">
              Contact <em>us.</em>
            </h1>
            <p className="lead bi__lede">
              Tell us what you want to build. We reply within an hour with scope, a fixed
              price, and a start date.
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
              <strong>Message sent. Taking you to the confirmation page…</strong>
              <p className="meta bi__done-sub">
                Not redirected? <Link href="/thank-you">Continue here</Link> — or reach
                us at {CONTENT.brand.email} · {CONTENT.brand.phone}.
              </p>
            </div>
          ) : (
            <div className="bi__field">
              <div className="bi__identity">
                <div className="bi__group">
                  <div className="bi__label-row">
                    <label className="bi__label" htmlFor="bi-name">
                      Your name
                    </label>
                  </div>
                  <input
                    id="bi-name"
                    className="bi__input"
                    type="text"
                    placeholder="Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => touch("name")}
                    aria-invalid={show.name}
                    aria-describedby={show.name ? "bi-name-err" : undefined}
                    autoComplete="name"
                  />
                  {show.name ? (
                    <p className="bi__field-err" id="bi-name-err">
                      {nameError}
                    </p>
                  ) : null}
                </div>
                <div className="bi__group">
                  {/* The channel switch sits directly above the field it swaps —
                      below it (where it used to be) nothing explained why this
                      input kept changing. */}
                  <div className="bi__label-row">
                    <label className="bi__label" htmlFor="bi-contact">
                      {chan === "whatsapp" ? "WhatsApp number" : "Email address"}
                    </label>
                    <div
                      className="bi__channels"
                      role="group"
                      aria-label="Where should we reply?"
                    >
                      {(["whatsapp", "email"] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={"bi__channel " + (chan === c ? "on" : "")}
                          aria-pressed={chan === c}
                          // The field now holds a different value; don't flag it
                          // as wrong before they've had a chance to fill it.
                          onClick={() => {
                            setChan(c);
                            setTouched((t) => ({ ...t, contact: false }));
                          }}
                        >
                          {c === "whatsapp" ? "WhatsApp" : "Email"}
                        </button>
                      ))}
                    </div>
                  </div>
                  {chan === "whatsapp" ? (
                    <input
                      id="bi-contact"
                      className="bi__input"
                      type="tel"
                      inputMode="tel"
                      placeholder="+91 70210 00764"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      onBlur={() => touch("contact")}
                      aria-invalid={show.contact}
                      aria-describedby={show.contact ? "bi-contact-err" : undefined}
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
                      onBlur={() => touch("contact")}
                      aria-invalid={show.contact}
                      aria-describedby={show.contact ? "bi-contact-err" : undefined}
                      autoComplete="email"
                    />
                  )}
                  {show.contact ? (
                    <p className="bi__field-err" id="bi-contact-err">
                      {contactError}
                    </p>
                  ) : null}
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
                <div className="bi__label-row">
                  <label className="bi__label" htmlFor="bi-brief">
                    What do you want to build?
                  </label>
                  <span className="bi__optional">A line or two is plenty</span>
                </div>
                <textarea
                  id="bi-brief"
                  className="bi__textarea"
                  placeholder={placeholder}
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  onBlur={() => touch("brief")}
                  aria-invalid={show.brief}
                  aria-describedby={show.brief ? "bi-brief-err" : undefined}
                />
                {show.brief ? (
                  <p className="bi__field-err" id="bi-brief-err">
                    {briefError}
                  </p>
                ) : null}
              </div>

              {error ? (
                <p className="bi__err" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="bi__row">
                {hint ? (
                  <p className="bi__hint" id="bi-hint">
                    {hint}
                  </p>
                ) : null}
                <button
                  className="btn btn-primary bi__submit"
                  type="button"
                  onClick={submit}
                  disabled={!ready || status === "sending"}
                  aria-describedby={hint ? "bi-hint" : undefined}
                >
                  {status === "sending" ? "Sending…" : "Send message"} <Arr />
                </button>
              </div>

              <p className="bi__trust">
                Your details stay with our team — read our{" "}
                <Link href="/privacy">privacy policy</Link>.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
