import type { Metadata, Viewport } from "next";
import { Archivo, Fraunces, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import ChatWidgetLazy from "@/components/ChatWidgetLazy";
import { Cursor } from "@/components/Cursor";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WhatsAppFloating } from "@/components/WhatsAppFloating";
import "@/styles/globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-serif",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F1EFE8",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.voltairtech.com"),
  title: {
    default: "Voltair Tech - Drones, AI and Robotics, Made in India",
    template: "%s | Voltair Tech",
  },
  description:
    "Voltair Tech builds drone technology, AI software, robotics and IoT in Mumbai. Free RPTO drone simulator as per DGCA guidelines, Indian drone partnerships, AI chatbots and automation.",
  keywords: [
    "drone simulator India",
    "RPTO simulator",
    "DGCA drone training",
    "made in India drones",
    "Indian drone components",
    "VTOL drone India",
    "drone company Mumbai",
    "robotics and IoT Mumbai",
    "AI services Mumbai",
    "AI agency India",
    "chatbot development India",
    "RAG system India",
    "Next.js development Mumbai",
    "WhatsApp chatbot India",
    "AI startup Mumbai",
  ],
  authors: [{ name: "Voltair Tech", url: "https://www.voltairtech.com" }],
  creator: "Voltair Tech",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.voltairtech.com",
    siteName: "Voltair Tech",
    title: "Voltair Tech - Drones, AI and Robotics, Made in India",
    description: "Voltair Tech builds drone technology, AI software, robotics and IoT in Mumbai. Free RPTO drone simulator as per DGCA guidelines, Indian drone partnerships, AI chatbots and automation.",
    images: [
      {
        url: "/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Voltair Tech: drones, AI and robotics, made in India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voltair Tech - Drones, AI and Robotics, Made in India",
    description: "Voltair Tech builds drone technology, AI software, robotics and IoT in Mumbai. Free RPTO drone simulator as per DGCA guidelines, Indian drone partnerships, AI chatbots and automation.",
    images: ["/assets/og-image.jpg"],
  },
  icons: {
    icon: [
      {
        url: "/favicon-light.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/favicon-dark.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${archivo.variable} ${fraunces.variable} ${plexMono.variable}`}>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-56BB276T"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* Google Tag Manager */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-56BB276T');
            `,
          }}
        />

        {/* Google tag (gtag.js) - Google Analytics & Google Ads */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZX3BMPGBPJ"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics-ads-gtag"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-ZX3BMPGBPJ');
              gtag('config', 'G-HPQ6VRLTFL');
              gtag('config', 'AW-18083299030');
            `,
          }}
        />

        {children}
        <ChatWidgetLazy />
        <WhatsAppFloating />
        <ScrollReveal />
        <Cursor />
        
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1775360796808644');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1775360796808644&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
