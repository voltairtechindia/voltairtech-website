"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });

/**
 * Defers the chat widget out of the initial load. It's below-the-fold and
 * click-to-open, so we mount it once the browser is idle (or after a short
 * fallback) — keeping its JS off the critical path for LCP/TBT.
 */
export default function ChatWidgetLazy() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(() => setShow(true), { timeout: 2500 });
      return () => (window as unknown as { cancelIdleCallback?: (id: number) => void })
        .cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return show ? <ChatWidget /> : null;
}
