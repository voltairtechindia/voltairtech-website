/**
 * Watch/share URL → embeddable iframe src.
 *
 * Shared by every surface that renders a `MediaItem` of type "embed" — the
 * blog's `BlogMedia` and the /live-projects media rail. The allowed frame
 * origins are pinned in `next.config.mjs`'s CSP (`frame-src`), so anything
 * this does not rewrite to youtube-nocookie.com or player.vimeo.com will be
 * blocked by the browser rather than silently framed.
 */
export function toEmbedSrc(url: string, provider?: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (provider === "youtube" || /youtube\.com|youtu\.be/.test(host)) {
      let id = "";
      if (host === "youtu.be") id = u.pathname.slice(1);
      else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/")[2];
      else if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2];
      else id = u.searchParams.get("v") ?? "";
      // rel=0 keeps "up next" inside the same channel, modestbranding trims the
      // YouTube chrome, playsinline stops iOS hijacking into fullscreen.
      return id
        ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`
        : url;
    }

    if (provider === "vimeo" || /vimeo\.com/.test(host)) {
      const id = u.pathname.split("/").filter(Boolean).pop() ?? "";
      return id ? `https://player.vimeo.com/video/${id}?dnt=1&playsinline=1` : url;
    }
  } catch {
    /* fall through to raw url */
  }
  return url;
}
