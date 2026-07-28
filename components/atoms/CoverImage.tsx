/**
 * Admin-uploaded card cover, served through next/image so Vercel resizes +
 * re-encodes the remote Supabase asset to AVIF/WebP per viewport. Drop-in
 * replacement for the old plain `<img>` inside `.svc-card__cover` — the parent
 * keeps its 16/9 box and `object-fit: cover` styling from globals.css.
 *
 * `sizes` reflects the `.svc-grid` layout: full-bleed on phones, ~half on
 * tablets, a fixed card column on desktop. Lazy by default (covers sit below
 * the fold); pass `priority` only for an above-the-fold hero cover.
 */
import Image from "next/image";

export function CoverImage({
  src,
  alt,
  priority = false,
  className,
  sizes = "(max-width: 560px) 100vw, (max-width: 980px) 50vw, (max-width: 1360px) 25vw, 16vw",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      style={{ objectFit: "cover" }}
    />
  );
}
