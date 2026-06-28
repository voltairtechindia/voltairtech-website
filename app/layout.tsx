import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import ChatWidgetLazy from "@/components/ChatWidgetLazy";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WhatsAppFloating } from "@/components/WhatsAppFloating";
import "@/styles/globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E63946",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://voltairtech.com"),
  title: {
    default: "Voltair Tech - AI Services Mumbai | Build & Deploy in 48 Hours",
    template: "%s | Voltair Tech",
  },
  description:
    "Voltair Tech is a Mumbai AI build studio shipping production apps, chatbots, automations and RAG systems in 48 hours. Indian operators, global standards.",
  keywords: [
    "AI services Mumbai",
    "AI agency India",
    "chatbot development India",
    "RAG system India",
    "Next.js development Mumbai",
    "WhatsApp chatbot India",
    "AI startup Mumbai",
  ],
  authors: [{ name: "Voltair Tech", url: "https://voltairtech.com" }],
  creator: "Voltair Tech",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://voltairtech.com",
    siteName: "Voltair Tech",
    title: "Voltair Tech - AI Services Mumbai | Build & Deploy in 48 Hours",
    description: "Mumbai-based AI build studio. Apps, chatbots, RAG, automation. Shipped in 48 hours.",
    images: [
      {
        url: "/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Voltair Tech - AI Services Mumbai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voltair Tech - AI Services Mumbai | Build & Deploy in 48 Hours",
    description: "Mumbai-based AI build studio. Apps, chatbots, RAG, automation. Shipped in 48 hours.",
    images: ["/assets/og-image.jpg"],
  },
  icons: {
    icon: "/logo-mark.png",
    apple: "/logo-mark.png",
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
    <html lang="en-IN" className={`${interTight.variable} ${jetbrainsMono.variable}`}>
      <body>
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
              gtag('config', 'AW-18083299030');
            `,
          }}
        />

        {children}
        <ChatWidgetLazy />
        <WhatsAppFloating />
        <ScrollReveal />
        <Analytics />
        
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
