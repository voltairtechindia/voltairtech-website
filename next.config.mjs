/** @type {import('next').NextConfig} */

// CSP: the chatbot/blog/contact features add a few cross-origin needs on top of
// the static marketing site — the public Supabase origin (blog media + cover
// images, self-hosted clips) and YouTube/Vimeo embeds. Fonts are self-hosted by
// next/font, so no font CDN is allowed. 'unsafe-inline' covers the App Router
// inline bootstrap + JSON-LD; 'unsafe-eval' is dev-only (React refresh).
// GTM needs googletagmanager.com in frame-src for its <noscript> fallback iframe;
// tags it injects at runtime may add origins beyond the ones listed here.
const isDev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://connect.facebook.net https://*.googletagmanager.com https://*.googleadservices.com https://*.google.com https://*.google.co.in https://*.doubleclick.net${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://www.facebook.com https://*.googletagmanager.com https://*.googleadservices.com https://*.google-analytics.com https://*.doubleclick.net https://*.google.com https://*.google.co.in",
  "media-src 'self' https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://www.facebook.com https://*.google-analytics.com https://*.analytics.google.com https://*.doubleclick.net https://*.g.doubleclick.net https://*.google.com https://*.google.co.in https://*.googleadservices.com https://*.googletagmanager.com",
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://www.facebook.com https://*.facebook.com https://*.google.com https://www.googletagmanager.com https://*.doubleclick.net",
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

// Cold-email open/click tracking is served by the admin app, but the URLs are
// stamped into mail that leads actually receive — so they must ride the stable
// branded domain, not a deploy-specific *.vercel.app host. These paths are
// proxied straight through; nothing about them is rendered by this site.
const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN || "https://voltairtech-admin.vercel.app";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Admin-uploaded media (covers, sector badges, OG images) lives in the public
    // Supabase Storage bucket. Allowing it here lets next/image resize + re-encode
    // those remote assets to AVIF/WebP per viewport on delivery — even legacy PNGs
    // uploaded before the admin's upload-time compression existed.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "asipqnvxmtzllivlyibh.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    return [
      {
        source: "/api/leads/track/:path*",
        destination: `${ADMIN_ORIGIN}/api/leads/track/:path*`,
      },
    ];
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
