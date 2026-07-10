import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { BigInput } from "@/components/BigInput";
import { FooterCta } from "@/components/FooterCta";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Get a Free Project Plan - AI Services Mumbai",
  description:
    "Tell Voltair Tech what you want to build. We reply within an hour with scope, a fixed price, and a start date. Free, no obligation.",
  alternates: { canonical: "https://voltairtech.com/contact" },
  openGraph: {
    url: "https://voltairtech.com/contact",
    title: "Get a Free Project Plan - Voltair Tech Mumbai",
    description:
      "Tell us what you want to build. We reply within an hour with scope, a fixed price, and a start date.",
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
