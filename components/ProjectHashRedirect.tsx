"use client";

/**
 * The dialog era put `#<slug>` on the index URL for every open project, so
 * those links are out in the wild (and in the ItemList JSON-LD Google already
 * crawled). They now resolve to that project's own page instead of a modal.
 */
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProjectHashRedirect({ slugs }: { slugs: string[] }) {
  const router = useRouter();

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace("#", ""));
    if (hash && slugs.includes(hash)) router.replace(`/live-projects/${hash}`);
  }, [router, slugs]);

  return null;
}
