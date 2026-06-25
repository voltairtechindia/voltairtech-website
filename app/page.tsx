import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { HomeProof } from "@/components/HomeProof";
import { HomeHub } from "@/components/HomeHub";
import { MarqueeSection } from "@/components/MarqueeSection";
import { FooterCta } from "@/components/FooterCta";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Voltair Tech - AI Services Mumbai | Build & Deploy in 48 Hours",
  description:
    "Voltair Tech is a Mumbai AI build studio shipping production apps, chatbots, automations and RAG systems in 48 hours. Indian operators, global standards.",
  alternates: {
    canonical: "https://voltairtech.com/",
  },
};

const ORG_ID = `${SITE_URL}/#organization`;

// Real, verifiable profiles (mirror the footer links) — `sameAs` is how search
// engines and answer engines reconcile this entity across the web.
const SAME_AS = [
  "https://www.linkedin.com/company/voltairtech",
  "https://www.instagram.com/voltairtechindia/",
  "https://www.facebook.com/Voltairtech",
];

const ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: "Andheri West",
  addressRegion: "Maharashtra",
  postalCode: "400053",
  addressCountry: "IN",
} as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "Voltair Tech",
      legalName: "Voltair Tech",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/assets/logo-mark-black.png`,
        width: 800,
        height: 800,
      },
      image: `${SITE_URL}/assets/logo-square-starfield.jpg`,
      email: "business@voltairtech.com",
      telephone: "+91 70210 00764",
      foundingDate: "2024",
      slogan: "Ship AI in 48 hours.",
      description:
        "Mumbai-based AI build studio shipping production apps, chatbots, automations and RAG systems. Websites in 48 hours.",
      address: ADDRESS,
      areaServed: [
        { "@type": "Country", name: "India" },
        { "@type": "Place", name: "European Union" },
        { "@type": "Place", name: "Asia-Pacific (APAC)" },
      ],
      knowsAbout: [
        "Artificial Intelligence",
        "Retrieval-Augmented Generation (RAG)",
        "Chatbot development",
        "WhatsApp Business API",
        "Workflow automation",
        "Next.js development",
        "Mobile app development",
        "Large Language Models",
      ],
      sameAs: SAME_AS,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91 70210 00764",
        email: "business@voltairtech.com",
        contactType: "sales",
        areaServed: ["IN", "EU", "APAC"],
        availableLanguage: ["English", "Hindi", "Marathi"],
      },
    },
    {
      "@type": ["LocalBusiness", "ProfessionalService"],
      "@id": `${SITE_URL}/#localbusiness`,
      name: "Voltair Tech",
      url: SITE_URL,
      image: `${SITE_URL}/assets/logo-square-starfield.jpg`,
      logo: `${SITE_URL}/assets/logo-mark-black.png`,
      email: "business@voltairtech.com",
      telephone: "+91 70210 00764",
      priceRange: "₹₹",
      parentOrganization: { "@id": ORG_ID },
      address: ADDRESS,
      geo: {
        "@type": "GeoCoordinates",
        latitude: 19.13,
        longitude: 72.83,
      },
      hasMap:
        "https://www.google.com/maps/place/?q=place_id:ChIJtcYXf-S35zsRSOlnDqIYyXU",
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "10:00",
        closes: "20:00",
      },
      sameAs: SAME_AS,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Voltair Tech",
      url: SITE_URL,
      inLanguage: "en-IN",
      publisher: { "@id": ORG_ID },
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
          <HomeProof />
          <HomeHub />
          <MarqueeSection />
        </main>
        <FooterCta />
      </div>
    </>
  );
}
