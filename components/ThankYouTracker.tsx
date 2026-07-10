"use client";

import { useEffect, useRef } from "react";
import { LEAD_FLAG, trackFormSubmission } from "@/lib/gtag-events";

const POLL_MS = 200;
const MAX_POLLS = 25;

/**
 * Reports the Google Ads lead conversion for /thank-you — once, and only for
 * visitors who actually submitted the contact form.
 *
 * Two signals, because either alone leaks: the sessionStorage flag can't be
 * shared or bookmarked but is blocked in some in-app browsers, and `?ref=form`
 * always survives the redirect but would refire on a reload. Whichever fired,
 * both are cleared afterwards.
 */
export function ThankYouTracker() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;

    let flagged = false;
    try {
      flagged = sessionStorage.getItem(LEAD_FLAG) === "1";
    } catch {
      // storage blocked — fall through to the query param
    }

    const url = new URL(window.location.href);
    const viaParam = url.searchParams.get("ref") === "form";
    if (!flagged && !viaParam) return;

    fired.current = true;

    // gtag.js loads afterInteractive, so on a cold load of this URL it can lag
    // hydration. Poll briefly rather than dropping the conversion.
    let polls = 0;
    const fire = () => {
      if (typeof window.gtag !== "function") {
        if (++polls <= MAX_POLLS) window.setTimeout(fire, POLL_MS);
        return;
      }
      try {
        sessionStorage.removeItem(LEAD_FLAG);
      } catch {
        // nothing to clean up
      }
      if (viaParam) {
        url.searchParams.delete("ref");
        window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      }
      trackFormSubmission();
    };
    fire();
  }, []);

  return null;
}
