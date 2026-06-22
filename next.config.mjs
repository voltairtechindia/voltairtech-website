/** @type {import('next').NextConfig} */

// CSP: the chatbot/blog/contact features add a few cross-origin needs on top of
// the static marketing site — the public Supabase origin (blog media + cover
// images, self-hosted clips) and YouTube/Vimeo embeds. Fonts are self-hosted by
// next/font, so no font CDN is allowed. 'unsafe-inline' covers the App Router
// inline bootstrap + JSON-LD; 'unsafe-eval' is dev-only (React refresh).
const isDev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://connect.facebook.net https://*.googletagmanager.com https://*.googleadservices.com https://*.google.com https://*.google.co.in${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://www.facebook.com https://*.googletagmanager.com https://*.googleadservices.com https://*.google-analytics.com https://*.doubleclick.net https://*.google.com https://*.google.co.in",
  "media-src 'self' https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://www.facebook.com https://*.google-analytics.com https://*.analytics.google.com https://*.g.doubleclick.net https://*.google.com https://*.google.co.in https://*.googleadservices.com",
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://www.facebook.com https://*.facebook.com https://*.google.com",
  "frame-ancestors 'self' https://*.facebook.com https://*.facebook.net https://*.internalfb.com",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: "/privacy.html",
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/terms.html",
        destination: "/terms",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
