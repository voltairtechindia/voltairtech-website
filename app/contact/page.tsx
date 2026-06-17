import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { BigInput } from "@/components/BigInput";
import { FooterCta } from "@/components/FooterCta";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Start a Project - AI Services Mumbai",
  description:
    "Tell Voltair Tech what you need to build. One line. We reply within an hour with a 48-hour plan. WhatsApp, email, or phone. Mumbai AI services studio.",
  alternates: { canonical: "https://voltairtech.com/contact" },
  openGraph: {
    url: "https://voltairtech.com/contact",
    title: "Start a Project - Voltair Tech Mumbai",
    description:
      "Type one line. We reply within an hour with a 48-hour plan. No forms, no decks, no fluff.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function ContactPage() {
  return (
    <div className="page">
      <Nav />
      <main>
        <BigInput />
      </main>
      <FooterCta />
    </div>
  );
}
