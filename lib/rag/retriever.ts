/**
 * RAG retriever: embed the query, pull nearest neighbours from pgvector, and
 * render them into a compact, labelled context block for the prompt.
 */
import { config } from "./config";
import { matchDocuments } from "./db";
import { embedQuery } from "./gemini";
import type { RetrievedDoc } from "./types";

export async function search(
  query: string,
  opts: {
    topK?: number;
    filterType?: string | null;
    minSimilarity?: number;
  } = {},
): Promise<RetrievedDoc[]> {
  const vector = await embedQuery(query);
  const topK = opts.topK ?? config.ragTopK;
  // Over-fetch so dropping scheduled-but-not-yet-live blog posts (below) can't
  // shrink the result set below topK.
  const docs = await matchDocuments(
    vector,
    topK + 5,
    opts.filterType ?? null,
    opts.minSimilarity ?? config.ragMinSimilarity,
  );
  return docs.filter((d) => !isNotYetPublished(d)).slice(0, topK);
}

/**
 * A scheduled blog post has `status: "published"` but a future `published_at`,
 * so it's embedded into the RAG store immediately even though the public
 * `/blog` page hides it until its time. Gate it out of retrieval too, so the
 * bot can't cite (or summarise) an article visitors can't see yet.
 */
function isNotYetPublished(d: RetrievedDoc): boolean {
  if (d.doc_type !== "blog") return false;
  const pub = d.metadata?.published_at;
  if (typeof pub !== "string") return false;
  const t = Date.parse(pub);
  return Number.isFinite(t) && t > Date.now();
}

export function buildContext(docs: RetrievedDoc[]): string {
  if (!docs.length) {
    return "(No matching knowledge-base entries were found.)";
  }
  return docs
    .map((d, i) => {
      const label = d.doc_type.replace(/_/g, " ").toUpperCase();
      const header = d.title
        ? `[${i + 1}] ${label} — ${d.title}`
        : `[${i + 1}] ${label}`;
      return `${header}\n${d.content.trim()}`;
    })
    .join("\n\n");
}
