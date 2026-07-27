"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import CareerForm from "./CareerForm";
import { Arr } from "./atoms/Arr";

/**
 * Apply-to-this-role dialog, opened from a job page.
 *
 * The form is only MOUNTED while the dialog is open, so closing it genuinely
 * discards a half-filled application (including the attached file) rather than
 * keeping a résumé in memory behind an invisible panel.
 */
export default function ApplyModal({
  jobSlug,
  jobTitle,
}: {
  jobSlug: string;
  jobTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Lock the page behind the dialog, and hand focus to it — then give focus
  // back to the button that opened it, so keyboard users don't lose their place.
  useEffect(() => {
    if (!open) {
      openerRef.current?.focus();
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen(true)}
      >
        Apply for this role <Arr />
      </button>

      {open ? (
        <div
          className="cm"
          role="dialog"
          aria-modal="true"
          aria-label={`Apply for ${jobTitle}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="cm__panel" ref={panelRef} tabIndex={-1}>
            <button
              type="button"
              className="cm__close"
              onClick={close}
              aria-label="Close"
            >
              ✕
            </button>
            <span className="kicker">Apply</span>
            <h2 className="cm__title">{jobTitle}</h2>
            <p className="cm__sub">
              Two minutes and a résumé. We read every application and reply either way.
            </p>
            <CareerForm
              jobs={[{ slug: jobSlug, title: jobTitle }]}
              defaultJobSlug={jobSlug}
              lockJob
              onSubmitted={() => window.setTimeout(close, 3200)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
