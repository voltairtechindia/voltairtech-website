import Link from "next/link";
import { Kicker } from "./atoms/Kicker";
import { CONTENT } from "@/lib/content";
import { listHomepageSiteFaqs } from "@/lib/faq/db";
import type { FaqItem } from "@/lib/faq/types";

/**
 * Home-page FAQ — the questions the admin ticked "show on the home page" in
 * `site_faqs`, or the bundled subset below if none are flagged / the DB is
 * unreachable. app/page.tsx loads the same array via `loadHomeFaq()` and builds
 * the home page's FAQPage JSON-LD from it, so the markup and the visible
 * answers can never drift — a Google rich-results requirement and the basis for
 * AI/answer-engine citations. Each question renders as an <h2> with a direct
 * 40 to 60 word answer for AEO/passage citability.
 */
const HOME_FAQ_QUESTIONS = [
  "Does Voltair Tech build drones?",
  "Is the Voltair Drone Simulator free?",
  "What does Voltair Tech actually do?",
  "How fast can my website be live?",
  "What does it cost?",
  "Can a bot answer questions about our own documents?",
  "Do you build WhatsApp chatbots?",
  "Can you add AI to the software we already have?",
];

/** Bundled fallback subset — used until the admin flags rows in `site_faqs`. */
export const HOME_FAQ: FaqItem[] = CONTENT.faq
  .filter((f) => HOME_FAQ_QUESTIONS.includes(f.q))
  .map((f) => ({ q: f.q, a: f.a }));

/** The home page's FAQ rows: admin-flagged questions, else the bundled subset. */
export async function loadHomeFaq(): Promise<FaqItem[]> {
  try {
    const rows = await listHomepageSiteFaqs();
    if (rows.length) return rows.map((r) => ({ q: r.question, a: r.answer }));
  } catch {
    /* fall through to the bundled copy */
  }
  return HOME_FAQ;
}

export function HomeFaq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="section" id="faq" aria-label="Frequently asked questions">
      <div className="container">
        <div className="section-head">
          <div className="section-head__left">
            <Kicker>Questions we get asked</Kicker>
          </div>
          <div className="section-head__right">
            <Link className="btn btn-ghost" href="/faq">
              All questions
            </Link>
          </div>
        </div>

        <div className="home-faq">
          {items.map((f) => (
            <div className="home-faq__item" key={f.q}>
              <h2 className="home-faq__q">{f.q}</h2>
              <p className="home-faq__a">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
