import type { Metadata } from "next";
import Link from "next/link";

import { ProsePage } from "@/components/ProsePage";
import { listPublishedPosts } from "@/lib/blog/db";
import type { BlogPostCard } from "@/lib/blog/types";
import { formatDate } from "@/lib/blog/util";

// Revalidate the listing every 5 min so new posts appear without a redeploy.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog — Practical AI Guides for Indian Operators",
  description:
    "In-depth guides on building with AI in India: RAG explained, WhatsApp chatbots, DPDP Act 2023 compliance, and n8n automation. Written by the team that ships AI products.",
  alternates: { canonical: "https://voltairtech.com/blog" },
  openGraph: {
    url: "https://voltairtech.com/blog",
    title: "Blog — Practical AI Guides for Indian Operators | Voltair Tech",
    description:
      "RAG explained, WhatsApp chatbot guide, DPDP Act 2023 & AI compliance — practical AI writing for Indian operators.",
  },
};

export default async function BlogIndexPage() {
  let posts: BlogPostCard[] = [];
  try {
    posts = await listPublishedPosts();
  } catch {
    // DB unavailable (e.g. build before env is set) — render the empty state.
    posts = [];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Voltair Tech Blog",
    url: "https://voltairtech.com/blog",
    publisher: {
      "@type": "Organization",
      name: "Voltair Tech",
      url: "https://voltairtech.com",
    },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `https://voltairtech.com/blog/${p.slug}`,
      description: p.excerpt ?? undefined,
      datePublished: p.published_at ?? undefined,
      author: { "@type": "Organization", name: p.author },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProsePage
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Blog" },
        ]}
        title="Practical AI writing for Indian operators"
        meta="No jargon, no hype — written by the team that ships AI products"
        lead="In-depth guides on building with AI in India: compliance, tools, and how-tos."
      >
        {posts.length === 0 ? (
          <p style={{ marginTop: "var(--s-6)", color: "var(--fg2)" }}>
            No posts yet — check back soon.
          </p>
        ) : (
          <div className="post-list">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className={p.cover_image?.url ? "post-card--media" : undefined}
              >
                {p.cover_image?.url ? (
                  <div className="post-card__cover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.cover_image.url}
                      alt={p.cover_image.alt ?? p.title}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : null}
                <div className="post-card__body">
                  <span className="post-kicker">
                    {p.tags?.[0] ?? "Voltair Tech"}
                    {p.published_at ? ` · ${formatDate(p.published_at)}` : ""}
                  </span>
                  <h2>{p.title}</h2>
                  {p.excerpt ? <p>{p.excerpt}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </ProsePage>
    </>
  );
}
