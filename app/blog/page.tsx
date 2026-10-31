import type { Metadata } from "next";
import Link from "next/link";

import { PagedGrid } from "@/components/PagedGrid";
import { ProsePage } from "@/components/ProsePage";
import { CoverImage } from "@/components/atoms/CoverImage";
import { DEFAULT_PER_PAGE, listPublishedPosts } from "@/lib/blog/db";
import type { BlogIndex } from "@/lib/blog/types";
import { formatDate } from "@/lib/blog/util";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

// Built into static HTML. The listing is time-gated (published_at <= now()), so a
// scheduled post appears on the next site build after its time (the Pages
// workflow rebuilds every few hours).

export const metadata: Metadata = {
  title: "Blog: Practical AI Guides for Indian Businesses",
  description:
    "In-depth guides on building with AI in India: RAG explained, WhatsApp chatbots, DPDP Act 2023 compliance, and n8n automation. Written by the team that ships AI products.",
  alternates: { canonical: "https://www.voltairtech.com/blog" },
  openGraph: {
    url: "https://www.voltairtech.com/blog",
    title: "Blog: Practical AI Guides for Indian Businesses | Voltair Tech",
    description:
      "Document assistants, WhatsApp chatbots, DPDP Act compliance and automation. Practical AI writing for Indian businesses.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function BlogIndexPage() {
  let data: BlogIndex = {
    items: [],
    total: 0,
    page: 1,
    perPage: DEFAULT_PER_PAGE,
    pageCount: 1,
  };
  try {
    data = await listPublishedPosts(1, 1000);
  } catch {
    // DB unavailable (e.g. build before env is set) — render the empty state.
  }
  const posts = data.items;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Voltair Tech Blog",
    url: "https://www.voltairtech.com/blog",
    publisher: {
      "@type": "Organization",
      name: "Voltair Tech",
      url: "https://www.voltairtech.com",
    },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `https://www.voltairtech.com/blog/${p.slug}`,
      description: p.excerpt ?? undefined,
      datePublished: p.published_at ?? undefined,
      author: { "@type": "Organization", name: p.author },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProsePage
        wide
        className="blog-index"
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Blog" },
        ]}
        title="Practical AI writing for Indian operators"
        meta="No jargon, no hype. Written by the team that builds this stuff."
        lead="In-depth guides on building with AI in India: compliance, tools, and how-tos."
      >
        {posts.length === 0 ? (
          <p style={{ marginTop: "var(--s-6)", color: "var(--fg2)" }}>
            No posts yet. Check back soon.
          </p>
        ) : (
          <>
            <PagedGrid className="post-list post-list--grid" perPage={DEFAULT_PER_PAGE} basePath="/blog" label="Blog pages">
              {posts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="post-card"
                >
                  <div className="post-card__cover">
                    {p.cover_image?.url ? (
                      <CoverImage
                        src={p.cover_image.url}
                        alt={p.cover_image.alt ?? p.title}
                        sizes="(max-width: 640px) 100vw, (max-width: 900px) 45vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="post-card__ph" aria-hidden="true">
                        <span className="post-card__ph-tag">
                          {p.tags?.[0] ?? "Voltair Tech"}
                        </span>
                      </div>
                    )}
                  </div>
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
            </PagedGrid>
          </>
        )}
      </ProsePage>
    </>
  );
}
