import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import ChatWidget from "@/components/ChatWidget";
import { ScrollReveal } from "@/components/ScrollReveal";
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
    default: "Voltair Tech — AI Services Mumbai | Build & Deploy in 48 Hours",
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
    title: "Voltair Tech — AI Services Mumbai | Build & Deploy in 48 Hours",
    description: "Mumbai-based AI build studio. Apps, chatbots, RAG, automation. Shipped in 48 hours.",
    images: [
      {
        url: "/assets/logo-square-starfield.jpg",
        width: 1200,
        height: 630,
        alt: "Voltair Tech — AI Services Mumbai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voltair Tech — AI Services Mumbai | Build & Deploy in 48 Hours",
    description: "Mumbai-based AI build studio. Apps, chatbots, RAG, automation. Shipped in 48 hours.",
    images: ["/assets/logo-square-starfield.jpg"],
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
        {children}
        <ChatWidget />
        <ScrollReveal />
      </body>
    </html>
  );
}
