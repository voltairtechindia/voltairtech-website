"use client";

import { useState } from "react";
import { Kicker } from "./atoms/Kicker";
import { Arr } from "./atoms/Arr";

type Status = "idle" | "sending" | "done" | "error";
type Channel = "whatsapp" | "email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BigInput() {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [val, setVal] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [chan, setChan] = useState<Channel>("whatsapp");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const contact = chan === "whatsapp" ? whatsapp.trim() : email.trim();
    if (!name.trim() || !contact || !val.trim()) {
      setError(
        chan === "whatsapp"
          ? "Please add your name, WhatsApp number, and one line about what you want."
          : "Please add your name, email, and one line about what you want.",
      );
      return;
    }
    if (chan === "email" && !EMAIL_RE.test(contact)) {
      setError("Please enter a valid email address.");
      return;
    }
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
        setError(data?.detail ?? "Could not send. Please email business@voltairtech.com.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError("Could not send. Please email business@voltairtech.com.");
      setStatus("error");
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="bi">
          <div className="bi__hd">
            <div>
              <Kicker>[&nbsp;01&nbsp;] Tell us what you want</Kicker>
              <h2 className="bi__h" style={{ marginTop: 12 }}>
                We&apos;ll <em>build it.</em>
              </h2>
            </div>
            <p className="lead" style={{ maxWidth: 360 }}>
              Type one line. We reply within an hour with a 48-hour plan. No forms, no
              decks, no fluff.
            </p>
          </div>

          {status === "done" ? (
            <div className="bi__field bi__done">
              <strong>Got it. We&apos;ll be in touch shortly on {chan === "whatsapp" ? "WhatsApp" : "email"}.</strong>
              <p className="meta" style={{ marginTop: 6 }}>
                Prefer to reach us directly? business@voltairtech.com · +91 70210 00764
              </p>
            </div>
          ) : (
            <div className="bi__field">
              <div className="bi__identity">
                <input
                  className="bi__input"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
                {chan === "whatsapp" ? (
                  <input
                    className="bi__input"
                    type="tel"
                    inputMode="tel"
                    placeholder="WhatsApp number + country code"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    autoComplete="tel"
                  />
                ) : (
                  <input
                    className="bi__input"
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                )}
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

              <textarea
                className="bi__textarea"
                placeholder="A WhatsApp bot that answers questions over our 800-page policy doc, in Hindi and English…"
                value={val}
                onChange={(e) => setVal(e.target.value)}
              />
              <div className="bi__row">
                <div className="bi__channels">
                  <span className="meta mono-lbl" style={{ marginRight: 6 }}>reply on</span>
                  {(["whatsapp", "email"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={"bi__channel " + (chan === c ? "on" : "")}
                      onClick={() => setChan(c)}
                    >
                      {c === "whatsapp" ? "WhatsApp" : "Email"}
                    </button>
                  ))}
                </div>
                <button className="btn btn-primary" type="button" onClick={submit} disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Ship it"} <Arr />
                </button>
              </div>
              {error ? <p className="bi__err">{error}</p> : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
