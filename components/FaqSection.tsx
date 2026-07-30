import type { FaqItem } from "@/lib/faq/types";

/**
 * The "Frequently asked questions" accordion shown at the foot of a blog post,
 * service, industry, or sector sub-service page. Native <details> so it works
 * without JS and the answers stay in the HTML for crawlers and answer engines —
 * the FAQPage JSON-LD on each page is built from the same array.
 */
export function FaqSection({
  faq,
  heading = "Frequently asked questions",
  id = "faq",
}: {
  faq: FaqItem[];
  heading?: string;
  id?: string;
}) {
  if (!faq.length) return null;

  return (
    <section className="blog-faq" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>{heading}</h2>
      <div className="blog-faq-list">
        {faq.map((f, i) => (
          <details key={`${f.q}-${i}`} className="blog-faq-item" open={i === 0}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
