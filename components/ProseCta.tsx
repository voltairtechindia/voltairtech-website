"use client";

import Link from "next/link";
import { CONTENT } from "@/lib/content";
import { trackWhatsAppClick } from "@/lib/gtag-events";

export function ProseCta({ label }: { label: string }) {
  const wa = CONTENT.brand.whatsapp.replace(/[^0-9]/g, "");
  return (
    <div className="legal-page__contact">
      <p>
        <strong>{label}</strong>
      </p>
      <p style={{ marginTop: 12 }}>
        WhatsApp{" "}
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" onClick={trackWhatsAppClick}>
          {CONTENT.brand.whatsapp}
        </a>{" "}
        · email{" "}
        <a href={`mailto:${CONTENT.brand.email}`}>{CONTENT.brand.email}</a> ·{" "}
        <Link href="/contact">start a project →</Link>
      </p>
    </div>
  );
}
