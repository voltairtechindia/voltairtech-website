/**
 * RAG retriever: embed the query, pull nearest neighbours from pgvector, and
 * render them into a compact, labelled context block for the prompt.
 */
import { config } from "./config";
import { getRecentBlogSlugs, matchDocuments } from "./db";
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
  const recent = await recentBlogGate();
  // Over-fetch so gating (scheduled posts + the blog recency cap) can't shrink
  // the result set below topK. Every gated post is one more neighbour that can
  // be discarded, so widen the pool by exactly that many.
  const docs = await matchDocuments(
    vector,
    topK + 5 + recent.gatedCount,
    opts.filterType ?? null,
    opts.minSimilarity ?? config.ragMinSimilarity,
  );
  return docs
    .filter((d) => !isNotYetPublished(d) && !isStaleBlog(d, recent.slugs))
    .slice(0, topK);
}

/**
 * Which posts the bot is allowed to draw on. Best-effort: if the lookup fails we
 * fall back to "no recency cap" rather than breaking the chat — `isNotYetPublished`
 * still enforces the hard scheduling rule in that case.
 */
async function recentBlogGate(): Promise<{
  slugs: Set<string> | null;
  gatedCount: number;
}> {
  if (config.ragBlogLimit <= 0) return { slugs: null, gatedCount: 0 };
  try {
    return await getRecentBlogSlugs(config.ragBlogLimit);
  } catch {
    return { slugs: null, gatedCount: 0 };
  }
}

/**
 * A blog post outside the newest `RAG_BLOG_LIMIT` stays in the store (so the cap
 * can be raised without re-embedding) but must not reach the prompt — old
 * articles otherwise crowd out pricing/service context and get cited as current.
 */
function isStaleBlog(d: RetrievedDoc, recent: Set<string> | null): boolean {
  if (d.doc_type !== "blog" || recent === null) return false;
  return !d.external_id || !recent.has(d.external_id);
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
