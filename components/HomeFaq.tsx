import Link from "next/link";
import { Kicker } from "./atoms/Kicker";
import { CONTENT } from "@/lib/content";

/**
 * Home-page FAQ — a curated subset of the full `/faq` set, reused verbatim from
 * CONTENT.faq so the FAQPage JSON-LD on the home page (built from HOME_FAQ in
 * app/page.tsx) always mirrors the visible answers. That parity is a Google
 * rich-results requirement and the basis for AI/answer-engine citations. Each
 * question renders as an <h2> with a direct 40–60 word answer for AEO/passage
 * citability, and the questions carry the target keywords (Mumbai, RAG,
 * WhatsApp, India, integrate).
 */
const HOME_FAQ_QUESTIONS = [
  "Who builds AI products in Mumbai?",
  "How fast can you deploy a website?",
  "What is a RAG system and when do I need one?",
  "How much does an AI app cost in India?",
  "Do you build WhatsApp chatbots?",
  "Can you integrate AI into our existing software?",
];

export const HOME_FAQ = CONTENT.faq.filter((f) =>
  HOME_FAQ_QUESTIONS.includes(f.q),
);

export function HomeFaq() {
  if (HOME_FAQ.length === 0) return null;

  return (
    <section className="section" id="faq" aria-label="Frequently asked questions">
      <div className="container">
        <div className="section-head">
          <div className="section-head__left">
            <Kicker>Answers · AI services FAQ</Kicker>
          </div>
          <div className="section-head__right">
            <Link className="btn btn-ghost" href="/faq">
              All FAQs
            </Link>
          </div>
        </div>

        <div className="home-faq">
          {HOME_FAQ.map((f) => (
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
