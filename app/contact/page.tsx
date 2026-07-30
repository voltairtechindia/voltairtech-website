import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { BigInput } from "@/components/BigInput";
import { FooterCta } from "@/components/FooterCta";
import { listPublishedIndustryOptions } from "@/lib/industries/db";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { listPublishedServiceOptions } from "@/lib/services/db";

// The picker is the live catalogue, so the page is ISR rather than fully static.
// It stays prerendered — the Ads landing page never waits on Supabase.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact Us - AI Services Mumbai",
  description:
    "Tell Voltair Tech what you want to build. We reply within an hour with scope, a fixed price, and a start date. WhatsApp, email, or phone.",
  alternates: { canonical: "https://www.voltairtech.com/contact" },
  openGraph: {
    url: "https://www.voltairtech.com/contact",
    title: "Contact Voltair Tech - AI Services Mumbai",
    description:
      "Tell us what you want to build. We reply within an hour with scope, a fixed price, and a start date.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function ContactPage() {
  // A DB hiccup must not take the contact form down — it just loses the picker.
  const [services, industries] = await Promise.all([
    listPublishedServiceOptions().catch(() => []),
    listPublishedIndustryOptions().catch(() => []),
  ]);

  return (
    <div className="page">
      <Nav showContactCta={false} />
      <main>
        <BigInput services={services} industries={industries} />
      </main>
      <FooterCta />
    </div>
  );
}
