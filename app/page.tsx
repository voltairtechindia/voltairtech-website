import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { HomePillars } from "@/components/HomePillars";
import { HomeProof } from "@/components/HomeProof";
import { HomeServices } from "@/components/HomeServices";
import { HomeHub } from "@/components/HomeHub";
import { HomeFaq, loadHomeFaq } from "@/components/HomeFaq";
import { MarqueeSection } from "@/components/MarqueeSection";
import { FooterCta } from "@/components/FooterCta";
import type { FaqItem } from "@/lib/faq/types";
import { listPublishedServices } from "@/lib/services/db";
import type { ServiceCard } from "@/lib/services/types";
import { SITE_URL } from "@/lib/seo";


export const metadata: Metadata = {
  title: { absolute: "Voltair Tech - Drones, AI and Robotics, Made in India" },
  description:
    "Voltair Tech builds drone technology, AI software, robotics and IoT in Mumbai. Free RPTO drone simulator as per DGCA guidelines, Indian drone partnerships, AI chatbots and automation.",
  alternates: {
    canonical: "https://www.voltairtech.com/",
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

const AREA_SERVED = [
  { "@type": "Country", name: "India" },
  { "@type": "Place", name: "European Union" },
  { "@type": "Place", name: "Asia-Pacific (APAC)" },
] as const;

/**
 * An OfferCatalog of every published service, wired into the Organization so
 * answer engines (and Google) can enumerate + cite each individual offering as
 * its own Service node. Each item's `@id` matches the Service node on that
 * service's own detail page (/services/<slug>), so the two reconcile. Pulled
 * live from the DB → new services added in the admin appear here automatically.
 */
function offerCatalog(services: ServiceCard[]) {
  if (!services.length) return null;
  return {
    "@type": "OfferCatalog",
    name: "AI services",
    itemListElement: services.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        "@id": `${SITE_URL}/services/${s.slug}#service`,
        name: s.title,
        serviceType: s.title,
        url: `${SITE_URL}/services/${s.slug}`,
        ...(s.summary ? { description: s.summary } : {}),
        provider: { "@id": ORG_ID },
        areaServed: AREA_SERVED,
      },
    })),
  };
}

function buildJsonLd(services: ServiceCard[], homeFaq: FaqItem[]) {
  const catalog = offerCatalog(services);
  return {
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
      slogan: "Drones, AI and robotics, made in India.",
      description:
        "Mumbai technology company focused on drones, AI, and robotics and IoT, with drones first. We make a free RPTO drone simulator as per DGCA guidelines, advise Indian drone makers such as Preflight Labs, and build AI chatbots, voice agents, automation and websites.",
      address: ADDRESS,
      areaServed: AREA_SERVED,
      ...(catalog ? { hasOfferCatalog: catalog } : {}),
      makesOffer: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
        itemOffered: {
          "@type": "SoftwareApplication",
          name: "Voltair Drone Simulator",
          applicationCategory: "GameApplication",
          operatingSystem: "Windows 10, Windows 11, macOS 11 or later",
          url: `${SITE_URL}/drones/simulator`,
        },
      },
      knowsAbout: [
        "Unmanned aerial vehicles (drones)",
        "Drone pilot training (RPTO)",
        "DGCA drone rules and the Remote Pilot Certificate",
        "Drone flight simulators",
        "VTOL drones",
        "Counter-drone systems",
        "Made in India drones and components",
        "Robotics",
        "Internet of Things (IoT)",
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
    // Mirrors the visible <HomeFaq /> section (same array) so the markup and
    // on-page answers never drift — required for FAQ rich results and the basis
    // for AI answer-engine citations.
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: homeFaq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
  };
}

export default async function HomePage() {
  // Published services power the Organization's OfferCatalog (individual Service
  // nodes for AI/search engines to cite). Best-effort: if the DB is unreachable
  // at build the catalog is simply omitted — the graph still validates.
  let services: ServiceCard[] = [];
  try {
    services = (await listPublishedServices(1, 100)).items;
  } catch {
    // DB unavailable — render without the offer catalog.
  }
  // Admin-flagged FAQ rows (falls back to the bundled subset on its own).
  const homeFaq = await loadHomeFaq();
  const jsonLd = buildJsonLd(services, homeFaq);

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
          <HomePillars />
          <HomeProof />
          <HomeServices />
          <HomeHub />
          <HomeFaq items={homeFaq} />
          <MarqueeSection />
        </main>
        <FooterCta />
      </div>
    </>
  );
}
