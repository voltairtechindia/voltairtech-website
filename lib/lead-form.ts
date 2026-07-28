/**
 * Shared vocabulary for the lead form (components/LeadForm.tsx) — the one form
 * behind /contact and the in-page CTA on every service / industry / sector
 * sub-service page.
 *
 * Everything here is data-driven: the selectable services come from the DB rows
 * the page already loaded, so a service renamed in the admin panel renames
 * itself in the picker and in the prefilled message without a code change.
 */

/** One selectable offering in the picker. */
export interface LeadOption {
  /**
   * Selection key. Catalogue and sector-only services live in the same picker
   * and can share a slug, so the kind is part of the identity.
   */
  id: string;
  slug: string;
  title: string;
  /** Sector-only service defined inline on an industry (not in the catalogue). */
  custom?: boolean;
}

/** Which page the form was submitted from, in the site's own terms. */
export type LeadContextKind = "general" | "service" | "industry" | "industry-service";

export interface LeadContext {
  kind: LeadContextKind;
  industrySlug?: string;
  industryTitle?: string;
  serviceSlug?: string;
  serviceTitle?: string;
}

export const catalogueOptionId = (slug: string) => `service:${slug}`;
export const customOptionId = (slug: string) => `custom:${slug}`;

/** Hard cap mirrored by the API — a picker selection can't become a payload. */
export const MAX_SELECTED_SERVICES = 20;

export function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/**
 * The brief we drop into the textarea for them. It is a starting sentence, not
 * a locked value: the moment they type, LeadForm stops rewriting it.
 *
 * Kept deliberately short and first-person so an unedited submission still
 * reads like a human wrote it — the picker selections and page context travel
 * separately in the payload, so the message never has to carry them for us.
 */
export function composeLeadMessage(ctx: LeadContext, selected: LeadOption[]): string {
  const list = joinList(selected.map((s) => s.title));
  const sector = ctx.industryTitle;

  if (list && sector) return `We're in ${sector} and want to talk about ${list}.`;
  if (list) return `I'd like to talk about ${list}.`;
  if (sector) return `We're in ${sector} and want to explore what AI can do for us.`;
  return "";
}
