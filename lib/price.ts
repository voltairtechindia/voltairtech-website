/**
 * Rupee formatting for the price column on services.
 *
 * Shared by the service detail page (the "Starts at" fact in the hero) and
 * POST /api/services, which folds the same label into the RAG embedding. When
 * these drifted the chatbot quoted a different number from the page.
 */

/** "200000" becomes "₹2L"; "1500000" becomes "₹15L"; "12000000" becomes "₹1.2Cr". */
export function inrLabel(price: string | null): string | null {
  if (!price) return null;
  const n = Number(price);
  if (!Number.isFinite(n) || n <= 0) return null;
  const trim = (x: number) =>
    Number.isInteger(x) ? String(x) : x.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  if (n >= 1e7) return `₹${trim(n / 1e7)}Cr`;
  if (n >= 1e5) return `₹${trim(n / 1e5)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}
