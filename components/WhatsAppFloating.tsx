"use client";

import { trackWhatsAppClick } from "@/lib/gtag-events";

export function WhatsAppFloating() {
  return (
    <a
      href="https://wa.me/917021000764"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      onClick={trackWhatsAppClick}
      aria-label="Chat on WhatsApp"
    >
      <svg
        viewBox="0 0 32 32"
        width="24"
        height="24"
        fill="currentColor"
      >
        <path d="M16 0C7.2 0 0 7.2 0 16c0 2.8.7 5.6 2.1 8L0 32l8-2.1c2.4 1.4 5.2 2.1 8 2.1 8.8 0 16-7.2 16-16S24.8 0 16 0zm0 29.5c-2.5 0-4.9-.6-7.1-1.9l-.5-.3-4.7 1.3 1.3-4.7-.3-.5C3.4 21.5 2.5 18.8 2.5 16 2.5 8.5 8.5 2.5 16 2.5S29.5 8.5 29.5 16 23.5 29.5 16 29.5z" />
        <path d="M12.5 8c-.3 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.2 3.2c.1.2 2.1 3.2 5.1 4.5 3 1.3 3 .9 3.5.8.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.4-.3-.1-1.7-.8-1.9-1-.2-.2-.4-.3-.5-.1-.2.2-.7.8-.8 1-.1.2-.3.2-.6.1-.3-.1-1.3-.5-2.5-1.6-1-1-1.6-2.1-1.8-2.5-.2-.3 0-.5.1-.7.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4-.1-.5-.1-.2-.5-1.2-.7-1.7-.2-.5-.4-.4-.5-.4z" />
      </svg>
    </a>
  );
}
