import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { HomeHub } from "@/components/HomeHub";
import { MarqueeSection } from "@/components/MarqueeSection";
import { FooterCta } from "@/components/FooterCta";

export const metadata: Metadata = {
  title: "Voltair Tech - AI Services Mumbai | Build & Deploy in 48 Hours",
  description:
    "Voltair Tech is a Mumbai AI build studio shipping production apps, chatbots, automations and RAG systems in 48 hours. Indian operators, global standards.",
  alternates: {
    canonical: "https://voltairtech.com/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Voltair Tech",
      url: "https://voltairtech.com",
      logo: "https://voltairtech.com/assets/logo-mark-black.png",
      email: "business@voltairtech.com",
      description:
        "Mumbai-based AI build studio shipping production apps, chatbots, automations and RAG systems. Websites in 48 hours.",
      sameAs: ["https://www.linkedin.com/company/voltairtech"],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91 70210 00764",
        contactType: "sales",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi", "Marathi"],
      },
    },
    {
      "@type": "LocalBusiness",
      name: "Voltair Tech",
      url: "https://voltairtech.com",
      image: "https://voltairtech.com/assets/logo-square-starfield.jpg",
      priceRange: "₹₹",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Andheri West",
        addressRegion: "Maharashtra",
        postalCode: "400053",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 19.13,
        longitude: 72.83,
      },
      openingHours: "Mo-Sa 10:00-20:00",
      telephone: "+91 70210 00764",
    },
    {
      "@type": "WebSite",
      name: "Voltair Tech",
      url: "https://voltairtech.com",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://voltairtech.com/faq",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="page">
        <Nav />
        <main>
          <Hero />
          <HomeHub />
          <MarqueeSection />
        </main>
        <FooterCta num="08" />
      </div>
    </>
  );
}
