"use client";

import { useEffect, useRef, useState } from "react";

import { CONTENT } from "@/lib/content";
import { sendLead } from "@/lib/leads";
import { Arr } from "./atoms/Arr";

type JobOption = { slug: string; title: string };
type Status = "idle" | "sending" | "done" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BYTES = 5 * 1024 * 1024; // the Website Leads script saves up to 5 MB
const ACCEPT =
  ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function looksLikeResume(f: File): boolean {
  const n = f.name.toLowerCase();
  return n.endsWith(".pdf") || n.endsWith(".docx");
}

function fmtSize(bytes: number): string {
  return bytes >= 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * The application form.
 *
 * Validated the same way as the contact form (components/BigInput): a field only
 * complains once you've left it, the submit button explains why it's locked, and
 * everything is re-checked server-side. The résumé is the one field the server
 * cannot forgive, so its size/type are checked here too — a 12 MB PDF should be
 * rejected before it spends a minute uploading.
 */
export default function CareerForm({
  jobs,
  defaultJobSlug,
  lockJob = false,
  onSubmitted,
}: {
  jobs: JobOption[];
  defaultJobSlug?: string;
  /** Applying from a role page — the role is fixed, not a dropdown. */
  lockJob?: boolean;
  onSubmitted?: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [years, setYears] = useState("");
  const [note, setNote] = useState("");
  const [jobSlug, setJobSlug] = useState(defaultJobSlug ?? "");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ name: false, email: false });
  const touch = (k: keyof typeof touched) =>
    setTouched((t) => ({ ...t, [k]: true }));

  useEffect(() => setJobSlug(defaultJobSlug ?? ""), [defaultJobSlug]);

  const nameOk = name.trim().length >= 2;
  const emailOk = EMAIL_RE.test(email.trim());
  const ready = nameOk && emailOk && !!file && !fileError && consent;
  const busy = status === "sending";

  const nameError = nameOk
    ? null
    : name.trim()
      ? "Please enter at least two characters."
      : "Please enter your name.";
  const emailError = emailOk
    ? null
    : email.trim()
      ? "That doesn't look like a valid email address."
      : "Please enter your email address.";

  const show = {
    name: touched.name && !!nameError,
    email: touched.email && !!emailError,
  };

  // Explains the locked button — but stands down while a field is already
  // showing its own message, so the same problem is never stated twice.
  const hint =
    ready || show.name || show.email
      ? null
      : !nameOk
        ? "Add your name to continue."
        : !emailOk
          ? "Add your email address."
          : !file
            ? "Attach your résumé (PDF or DOCX)."
            : "Tick the consent box to submit.";

  function pickFile(f: File | null) {
    if (!f) {
      setFile(null);
      setFileError(null);
      return;
    }
    if (!looksLikeResume(f)) {
      setFile(null);
      setFileError("Résumés must be a PDF or DOCX file.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setFile(null);
      setFileError(`That file is ${fmtSize(f.size)}. The limit is 5 MB.`);
      return;
    }
    setFile(f);
    setFileError(null);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ready || busy) return;
    setStatus("sending");
    setError(null);

    const job = jobs.find((j) => j.slug === jobSlug);
    try {
      await sendLead(
        "career",
        {
          name,
          email,
          phone,
          location,
          linkedin,
          portfolio,
          years_experience: years,
          role: job?.title ?? jobSlug,
          note,
          consent: "yes",
        },
        { file, honeypot: website },
      );
      setStatus("done");
      onSubmitted?.();
    } catch {
      setError(
        `Could not submit. Check your connection, or email your résumé to ${CONTENT.brand.email}.`,
      );
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="cf cf--done" role="status" aria-live="polite">
        <span className="cf__done-mark" aria-hidden="true">
          ✓
        </span>
        <strong>Application received.</strong>
        <p>
          Thanks, {name.trim().split(/\s+/)[0]}. Your résumé is with our team. We read
          every one, and we&apos;ll write back to <b>{email.trim()}</b> if there&apos;s a fit.
        </p>
        <p className="cf__done-sub">
          Anything to add? Reply to us at{" "}
          <a href={`mailto:${CONTENT.brand.email}`}>{CONTENT.brand.email}</a>.
        </p>
      </div>
    );
  }

  return (
    <form className="cf" onSubmit={submit} noValidate>
      {/* Honeypot — hidden from humans; bots that fill it are dropped server-side. */}
      <input
        className="bi__hp"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />

      <div className="cf__grid">
        <label className="cf__field">
          <span className="cf__label">Full name *</span>
          <input
            className="bi__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => touch("name")}
            placeholder="Priya Sharma"
            autoComplete="name"
            aria-invalid={show.name}
            disabled={busy}
          />
          {show.name ? <span className="bi__field-err">{nameError}</span> : null}
        </label>

        <label className="cf__field">
          <span className="cf__label">Email *</span>
          <input
            className="bi__input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => touch("email")}
            placeholder="priya@gmail.com"
            autoComplete="email"
            aria-invalid={show.email}
            disabled={busy}
          />
          {show.email ? <span className="bi__field-err">{emailError}</span> : null}
        </label>

        <label className="cf__field">
          <span className="cf__label">
            Phone <span className="cf__opt">optional</span>
          </span>
          <input
            className="bi__input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 70210 00764"
            autoComplete="tel"
            disabled={busy}
          />
        </label>

        <label className="cf__field">
          <span className="cf__label">
            Where you&apos;re based <span className="cf__opt">optional</span>
          </span>
          <input
            className="bi__input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Mumbai"
            disabled={busy}
          />
        </label>

        <label className="cf__field">
          <span className="cf__label">
            Years of experience <span className="cf__opt">optional</span>
          </span>
          <input
            className="bi__input"
            type="number"
            min={0}
            max={60}
            step={0.5}
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="3"
            disabled={busy}
          />
        </label>

        <label className="cf__field">
          <span className="cf__label">Role you&apos;re applying for</span>
          {lockJob && defaultJobSlug ? (
            <input
              className="bi__input"
              value={jobs.find((j) => j.slug === defaultJobSlug)?.title ?? "This role"}
              readOnly
              disabled
            />
          ) : (
            <select
              className="bi__input"
              value={jobSlug}
              onChange={(e) => setJobSlug(e.target.value)}
              disabled={busy}
            >
              <option value="">General / open application</option>
              {jobs.map((j) => (
                <option key={j.slug} value={j.slug}>
                  {j.title}
                </option>
              ))}
            </select>
          )}
        </label>

        <label className="cf__field">
          <span className="cf__label">
            LinkedIn <span className="cf__opt">optional</span>
          </span>
          <input
            className="bi__input"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="linkedin.com/in/…"
            disabled={busy}
          />
        </label>

        <label className="cf__field">
          <span className="cf__label">
            Portfolio / GitHub <span className="cf__opt">optional</span>
          </span>
          <input
            className="bi__input"
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
            placeholder="github.com/…"
            disabled={busy}
          />
        </label>
      </div>

      {/* Résumé — the one attachment, given room to be obvious. */}
      <div className="cf__field cf__field--wide">
        <span className="cf__label">Résumé * <span className="cf__opt">PDF or DOCX, max 5 MB</span></span>
        <div
          className={`cf__drop${dragOver ? " is-drag" : ""}${file ? " is-set" : ""}${fileError ? " is-bad" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => !busy && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            pickFile(e.dataTransfer.files?.[0] ?? null);
          }}
        >
          {file ? (
            <>
              <span className="cf__drop-file">{file.name}</span>
              <span className="cf__drop-sub">
                {fmtSize(file.size)} · click to replace
              </span>
            </>
          ) : (
            <>
              <span className="cf__drop-file">Drop your résumé here</span>
              <span className="cf__drop-sub">or click to choose a file</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            hidden
            onChange={(e) => {
              pickFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </div>
        {fileError ? <span className="bi__field-err">{fileError}</span> : null}
      </div>

      <label className="cf__field cf__field--wide">
        <span className="cf__label">
          Anything else? <span className="cf__opt">optional</span>
        </span>
        <textarea
          className="bi__input cf__textarea"
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What you'd want to build here, notice period, availability, anything your résumé doesn't say."
          disabled={busy}
        />
      </label>

      <label className="cf__consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={busy}
        />
        <span>
          I consent to Voltair Tech storing and processing my résumé and the details
          above for recruitment, as described in the{" "}
          <a href="/recruitment-privacy" target="_blank" rel="noreferrer">
            Recruitment Privacy Notice
          </a>
          . *
        </span>
      </label>

      <div className="cf__submit-row">
        {hint ? <span className="cf__hint">{hint}</span> : <span />}
        <button className="btn btn-primary" type="submit" disabled={!ready || busy}>
          {busy ? "Sending…" : "Send application"} <Arr />
        </button>
      </div>

      {error ? (
        <p className="bi__err" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
