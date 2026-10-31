/** @type {import('next').NextConfig} */

// Static export for GitHub Pages. There is no server: every page is built to
// HTML at build time (data is read from Supabase during the build), forms post
// to the Website Leads Google Apps Script (lib/leads.ts), and the Pages
// workflow rebuilds the site on every push and every few hours.
//
// Things a static host cannot do, and where they went:
// - Security headers (CSP/HSTS): GitHub Pages does not allow custom headers.
// - Redirects: /privacy.html and /terms.html are the pages themselves now
//   (export writes privacy.html), and the two old blog slugs are small redirect
//   pages in public/blog/.
// - /api/leads/track/* (cold email open/click tracking): click links are sent
//   on to the admin app by app/not-found.tsx; open pixels are not counted.
// The full server version of this site lives on the `vercel-full` branch.
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // No image optimizer on a static host; images are served as uploaded.
    unoptimized: true,
  },
};

export default nextConfig;
