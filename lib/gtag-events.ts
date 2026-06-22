// Client-side helper for Google Ads conversion & event tracking

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Tracks a contact form submission.
 * Triggers both a Google Analytics lead event and a standard Google Ads conversion.
 */
export function trackFormSubmission() {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "generate_lead", {
      event_category: "engagement",
      event_label: "contact_form_submission",
    });

    // Google Ads conversion tracking
    window.gtag("event", "conversion", {
      send_to: "AW-18083299030/contact_form_submit",
    });
  }
}

/**
 * Tracks a redirect/click to WhatsApp.
 */
export function trackWhatsAppClick() {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "contact", {
      event_category: "chat",
      event_label: "whatsapp_click",
    });

    // Google Ads conversion tracking
    window.gtag("event", "conversion", {
      send_to: "AW-18083299030/whatsapp_redirect",
    });
  }
}

/**
 * Tracks a direct phone call click.
 */
export function trackCallClick() {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "contact", {
      event_category: "phone",
      event_label: "call_click",
    });

    // Google Ads conversion tracking
    window.gtag("event", "conversion", {
      send_to: "AW-18083299030/phone_call",
    });
  }
}
