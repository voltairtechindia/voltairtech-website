"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { CONTENT } from "@/lib/content";
import { LEAD_FLAG, trackWhatsAppClick } from "@/lib/gtag-events";
import {
  MAX_SELECTED_SERVICES,
  catalogueOptionId,
  composeLeadMessage,
  customOptionId,
  type LeadContext,
  type LeadOption,
} from "@/lib/lead-form";
import { Arr } from "./atoms/Arr";

type Status = "idle" | "sending" | "redirecting" | "error";
type Channel = "whatsapp" | "email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Shorter than this isn't a brief we can scope, so it can't unlock the button. */
const MIN_BRIEF = 10;

/** ?ref=form is the fallback lead signal for browsers that block sessionStorage. */
const THANK_YOU = "/thank-you?ref=form";

/**
 * How long the redirect may take before we stop pretending it's instant and
 * offer a manual way out. Below this the transition is invisible, so showing a
 * "Message sent…" interstitial for every submit only makes the flow feel slower.
 * Set well past a warm prefetched navigation (~110ms) so a merely slow network
 * flashes the card up for a moment rather than it meaning "something is wrong".
 */
const REDIRECT_FALLBACK_MS = 1500;

const digitsOf = (s: string) => s.replace(/\D/g, "");

const EXAMPLES = [
  "A WhatsApp bot that answers questions from our 800-page policy doc, in Hindi and English…",
  "A booking site for our clinic that texts patients a reminder the day before…",
  "An automation that reads supplier invoices from Gmail and files them into Sheets…",
  "A chatbot on our store that recommends products and hands off to a human on request…",
  "An internal search tool over five years of project reports and contracts…",
  "A dashboard that pulls our Shopify orders and flags the ones likely to be returned…",
];

export interface LeadFormProps {
  /** `page` is the /contact hero form; `inline` is the CTA at the foot of a prose page. */
  variant?: "page" | "inline";
  context: LeadContext;
  /** Services offered in the picker — the DB rows the page already loaded. */
  options?: LeadOption[];
  /** Option ids ticked on first paint (e.g. the service whose page this is). */
  initialSelected?: string[];
  /** Inline variant only — the heading/lede above the card. */
  heading?: ReactNode;
  lede?: ReactNode;
  /**
   * Read `?service=` / `?industry=` after mount and prefill from them. Done from
   * `location.search` rather than `useSearchParams()` on purpose: the latter
   * opts the whole page out of static rendering, and /contact is the Google Ads
   * landing page. The form is fully server-rendered either way; a deep link just
   * ticks a box once JS lands.
   */
  paramPrefill?: boolean;
  /** Industry slug → title, for resolving `?industry=` on /contact. */
  industries?: { slug: string; title: string }[];
  /** Disambiguates DOM ids if a page ever carries two forms. */
  idPrefix?: string;
}

export function LeadForm({
  variant = "page",
  context,
  options = [],
  initialSelected = [],
  heading,
  lede,
  paramPrefill = false,
  industries = [],
  idPrefix = "lead",
}: LeadFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [chan, setChan] = useState<Channel>("whatsapp");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [stalled, setStalled] = useState(false);

  const [ctx, setCtx] = useState<LeadContext>(context);
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    () => new Set(initialSelected),
  );

  const optionById = useMemo(
    () => new Map(options.map((o) => [o.id, o])),
    [options],
  );
  const selectedOptions = useMemo(
    () => options.filter((o) => selected.has(o.id)),
    [options, selected],
  );

  // The brief starts as the sentence the page context implies, and keeps
  // following the picker until they type — after that it's theirs.
  const [val, setVal] = useState(() =>
    composeLeadMessage(context, options.filter((o) => initialSelected.includes(o.id))),
  );
  const briefDirty = useRef(false);

  const [touched, setTouched] = useState({ name: false, contact: false, brief: false });
  const touch = (k: keyof typeof touched) => setTouched((t) => ({ ...t, [k]: true }));

  useEffect(() => {
    if (briefDirty.current) return;
    setVal(composeLeadMessage(ctx, selectedOptions));
  }, [ctx, selectedOptions]);

  // /contact is prerendered, so the example has to be picked after mount —
  // randomising during render would hand the client different HTML than the
  // server sent and blow up hydration. Swapping a placeholder post-paint is
  // invisible: it shifts nothing and the field is empty either way.
  const [placeholder, setPlaceholder] = useState(EXAMPLES[0]);
  useEffect(() => {
    setPlaceholder(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]);
  }, []);

  // Deep links (`/contact?service=ai-websites&industry=d2c-ecommerce`) prefill
  // the same way landing on the service page itself would.
  useEffect(() => {
    if (!paramPrefill || typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    const serviceSlug = q.get("service")?.trim();
    const industrySlug = q.get("industry")?.trim();
    if (!serviceSlug && !industrySlug) return;

    const svc = serviceSlug ? optionById.get(catalogueOptionId(serviceSlug)) : undefined;
    const ind = industrySlug ? industries.find((i) => i.slug === industrySlug) : undefined;
    if (!svc && !ind) return;

    if (svc) setSelected((prev) => new Set(prev).add(svc.id));
    setCtx((prev) => ({
      ...prev,
      kind: ind ? (svc ? "industry-service" : "industry") : "service",
      ...(ind ? { industrySlug: ind.slug, industryTitle: ind.title } : {}),
      ...(svc ? { serviceSlug: svc.slug, serviceTitle: svc.title } : {}),
    }));
    // Options and industries are static per page; this is a mount-time read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramPrefill]);

  // Only surface the "not redirected?" escape hatch if the navigation genuinely
  // hangs. Timer is cleared on unmount, which is what a successful push causes.
  useEffect(() => {
    if (status !== "redirecting") return;
    const t = window.setTimeout(() => setStalled(true), REDIRECT_FALLBACK_MS);
    return () => window.clearTimeout(t);
  }, [status]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_SELECTED_SERVICES) next.add(id);
      return next;
    });
  }, []);

  const nameOk = name.trim().length >= 2;
  const phoneDigits = digitsOf(whatsapp).length;
  const contactOk =
    chan === "whatsapp"
      ? phoneDigits >= 8 && phoneDigits <= 15
      : EMAIL_RE.test(email.trim());
  const briefOk = val.trim().length >= MIN_BRIEF;
  const ready = nameOk && contactOk && briefOk;

  // "redirecting" keeps the button locked and labelled "Sending…" right through
  // the navigation, so the label never churns during a sub-frame transition.
  const busy = status === "sending" || status === "redirecting";

  // /thank-you was never prefetched, so router.push() used to block on an RSC
  // fetch *after* the POST had already resolved — two stalls back to back, which
  // is what made the submit feel broken. Warm it as soon as the form could
  // plausibly be sent; a visitor who never fills it in never pays for this.
  useEffect(() => {
    if (ready) router.prefetch(THANK_YOU);
  }, [ready, router]);

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
          : "Include the country code, e.g. +91 70210 00764."
      : !email.trim()
        ? "Please enter your email address."
        : "That doesn't look like a valid email address.";

  const briefError = briefOk
    ? null
    : val.trim()
      ? "A few more words, please. Tell us what you want built."
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
    if (!ready || status === "sending" || status === "redirecting") return;
    setError(null);
    setStatus("sending");
    // Belt and braces: if they pasted everything and clicked before the effect
    // above fired, this overlaps the route fetch with the POST rather than
    // serialising them.
    router.prefetch(THANK_YOU);
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
          // What they ticked and where they were — the sales context the free
          // text used to have to carry on its own.
          services: selectedOptions.map((o) => ({
            slug: o.slug,
            title: o.title,
            custom: Boolean(o.custom),
          })),
          context: {
            kind: ctx.kind,
            industry_slug: ctx.industrySlug,
            industry_title: ctx.industryTitle,
            service_slug: ctx.serviceSlug,
            service_title: ctx.serviceTitle,
          },
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
      setStatus("redirecting");
      router.push(THANK_YOU);
    } catch {
      setError(`Could not send. Please email ${CONTENT.brand.email}.`);
      setStatus("error");
    }
  };

  const wa = CONTENT.brand.whatsapp.replace(/[^0-9]/g, "");
  const pickLabelId = `${idPrefix}-pick`;

  const card = stalled ? (
    <div className="bi__field bi__done" role="status">
      <strong>Message sent. Taking you to the confirmation page…</strong>
      <p className="meta bi__done-sub">
        Not redirected? <Link href="/thank-you">Continue here</Link>, or reach us at{" "}
        {CONTENT.brand.email} · {CONTENT.brand.phone}.
      </p>
    </div>
  ) : (
    <div className="bi__field">
      {options.length ? (
        <div className="bi__group lead-pick">
          <div className="bi__label-row">
            <span className="bi__label" id={pickLabelId}>
              {ctx.industryTitle
                ? `What do you need for ${ctx.industryTitle}?`
                : "What do you need?"}
            </span>
            <span className="bi__optional">
              {selected.size
                ? `${selected.size} selected`
                : "Tap any that apply, optional"}
            </span>
          </div>
          <div className="lead-pick__chips" role="group" aria-labelledby={pickLabelId}>
            {options.map((o) => {
              const on = selected.has(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  className={"lead-chip" + (on ? " on" : "")}
                  aria-pressed={on}
                  onClick={() => toggle(o.id)}
                >
                  <span className="lead-chip__mark" aria-hidden="true">
                    {on ? "✓" : "+"}
                  </span>
                  {o.title}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="bi__identity">
        <div className="bi__group">
          <div className="bi__label-row">
            <label className="bi__label" htmlFor={`${idPrefix}-name`}>
              Your name
            </label>
          </div>
          <input
            id={`${idPrefix}-name`}
            className="bi__input"
            type="text"
            placeholder="Priya Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => touch("name")}
            aria-invalid={show.name}
            aria-describedby={show.name ? `${idPrefix}-name-err` : undefined}
            autoComplete="name"
          />
          {show.name ? (
            <p className="bi__field-err" id={`${idPrefix}-name-err`}>
              {nameError}
            </p>
          ) : null}
        </div>
        <div className="bi__group">
          {/* The channel switch sits directly above the field it swaps —
              below it (where it used to be) nothing explained why this
              input kept changing. */}
          <div className="bi__label-row">
            <label className="bi__label" htmlFor={`${idPrefix}-contact`}>
              {chan === "whatsapp" ? "WhatsApp number" : "Email address"}
            </label>
            <div className="bi__channels" role="group" aria-label="Where should we reply?">
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
              id={`${idPrefix}-contact`}
              className="bi__input"
              type="tel"
              inputMode="tel"
              placeholder="+91 70210 00764"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              onBlur={() => touch("contact")}
              aria-invalid={show.contact}
              aria-describedby={show.contact ? `${idPrefix}-contact-err` : undefined}
              autoComplete="tel"
            />
          ) : (
            <input
              id={`${idPrefix}-contact`}
              className="bi__input"
              type="email"
              placeholder="priya@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => touch("contact")}
              aria-invalid={show.contact}
              aria-describedby={show.contact ? `${idPrefix}-contact-err` : undefined}
              autoComplete="email"
            />
          )}
          {show.contact ? (
            <p className="bi__field-err" id={`${idPrefix}-contact-err`}>
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
          <label className="bi__label" htmlFor={`${idPrefix}-brief`}>
            What do you want to build?
          </label>
          <span className="bi__optional">
            {options.length ? "Edit this, a line or two is plenty" : "A line or two is plenty"}
          </span>
        </div>
        <textarea
          id={`${idPrefix}-brief`}
          className="bi__textarea"
          placeholder={placeholder}
          value={val}
          onChange={(e) => {
            briefDirty.current = true;
            setVal(e.target.value);
          }}
          onBlur={() => touch("brief")}
          aria-invalid={show.brief}
          aria-describedby={show.brief ? `${idPrefix}-brief-err` : undefined}
        />
        {show.brief ? (
          <p className="bi__field-err" id={`${idPrefix}-brief-err`}>
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
          <p className="bi__hint" id={`${idPrefix}-hint`}>
            {hint}
          </p>
        ) : null}
        <button
          className="btn btn-primary bi__submit"
          type="button"
          onClick={submit}
          disabled={!ready || busy}
          aria-describedby={hint ? `${idPrefix}-hint` : undefined}
        >
          {busy ? "Sending…" : "Send message"} <Arr />
        </button>
      </div>

      <p className="bi__trust">
        {variant === "inline" ? (
          <>
            Prefer to talk first? WhatsApp{" "}
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackWhatsAppClick}
            >
              {CONTENT.brand.whatsapp}
            </a>{" "}
            or email <a href={`mailto:${CONTENT.brand.email}`}>{CONTENT.brand.email}</a>. Your
            details stay with our team. Read our{" "}
            <Link href="/privacy">privacy policy</Link>.
          </>
        ) : (
          <>
            Your details stay with our team. Read our{" "}
            <Link href="/privacy">privacy policy</Link>.
          </>
        )}
      </p>
    </div>
  );

  if (variant !== "inline") return card;

  return (
    <section className="lead-cta" aria-labelledby={`${idPrefix}-cta-h`}>
      {heading ? (
        <h2 className="lead-cta__h" id={`${idPrefix}-cta-h`}>
          {heading}
        </h2>
      ) : null}
      {lede ? <p className="lead-cta__lede">{lede}</p> : null}
      {card}
    </section>
  );
}
