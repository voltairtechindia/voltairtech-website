import type { MetadataRoute } from "next";

// Web app manifest — Next serves this at /manifest.webmanifest and injects the
// <link rel="manifest"> automatically. Improves installability + how the brand
// renders when the site is saved to a home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Voltair Tech - Drones, AI and Robotics, Made in India",
    short_name: "Voltair Tech",
    description:
      "Drones, AI and robotics, made in India. Voltair Drone Simulator Trial Version, Indian drone partnerships, AI chatbots and automation.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F1EFE8",
    theme_color: "#161513",
    lang: "en-IN",
    categories: ["business", "productivity", "developer"],
    icons: [
      {
        src: "/logo-mark.png",
        sizes: "800x800",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo-mark.png",
        sizes: "800x800",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
