/**
 * One normaliser for every FAQ write path (/api/blog, /api/services,
 * /api/industries) and one renderer for every FAQ embedding, so a Q&A pair
 * behaves identically wherever it's attached.
 */
import type { FaqItem } from "./types";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Coerce untrusted input into FAQ items, keeping only complete pairs — a
 * question with no answer is worse than no entry at all (Google penalises
 * FAQPage markup that doesn't match visible content).
 */
export function normalizeFaq(v: unknown): FaqItem[] {
  if (!Array.isArray(v)) return [];
  const out: FaqItem[] = [];
  for (const raw of v) {
    if (typeof raw !== "object" || raw === null) continue;
    const p = raw as Record<string, unknown>;
    const q = str(p.q);
    const a = str(p.a);
    if (q && a) out.push({ q, a });
  }
  return out;
}

/** Flatten Q&A pairs into the plain text folded into a record's RAG embedding. */
export function faqToPlainText(faq: FaqItem[] | null | undefined): string {
  return (faq ?? []).map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");
}

/** Schema.org FAQPage node built from the same pairs the page renders. */
export function faqPageLd(faq: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
