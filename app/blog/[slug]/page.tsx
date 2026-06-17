import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BlogMedia from "@/components/BlogMedia";
import Markdown from "@/components/Markdown";
import { PageLayout } from "@/components/PageLayout";
import {
  getPublishedPost,
  listPublishedSlugs,
  listRelatedPosts,
} from "@/lib/blog/db";
import { formatDate } from "@/lib/blog/util";
import { DEFAULT_OG_IMAGE, breadcrumbLd } from "@/lib/seo";

const SITE_URL = "https://voltairtech.com";

// Short ISR window + dynamicParams: a scheduled post is never prerendered at
// build, so its first visit once due renders fresh; edits propagate within ~1 min.
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const slugs = await listPublishedSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPublishedPost(params.slug).catch(() => null);
  if (!post) return { title: "Post not found" };

  const title = post.seo?.title ?? post.title;
  const description =
    post.seo?.description ?? post.excerpt ?? `${post.title} — Voltair Tech Blog`;
  const ogImage = post.seo?.og_image ?? post.cover_image?.url ?? DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${SITE_URL}/blog/${post.slug}`,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: [post.author],
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPublishedPost(params.slug).catch(() => null);
  if (!post) notFound();

  const related = await listRelatedPosts(post.slug, 3).catch(() => []);
  const url = `${SITE_URL}/blog/${post.slug}`;
  const faq = post.faq ?? [];

  const faqLd = faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  const breadcrumbsLd = breadcrumbLd([
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title },
  ]);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image?.url ? [post.cover_image.url] : undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: post.author, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Voltair Tech",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-mark.png`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: post.tags?.join(", ") || undefined,
  };

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}

      <article className="blog-article container">
        <nav className="blog-breadcrumb">
          <Link href="/blog">← All articles</Link>
        </nav>

        <header className="blog-article-header">
          {post.tags?.length ? (
            <div className="blog-tags">
              {post.tags.map((t) => (
                <span key={t} className="blog-tag">
                  {t}
                </span>
              ))}
            </div>
          ) : null}
          <h1>{post.title}</h1>
          {post.excerpt ? <p className="blog-lede">{post.excerpt}</p> : null}
          <div className="blog-article-meta">
            <span>{post.author}</span>
            <span>· {formatDate(post.published_at)}</span>
            {post.reading_minutes ? (
              <span>· {post.reading_minutes} min read</span>
            ) : null}
          </div>
        </header>

        {post.cover_image?.url ? (
          <figure className="blog-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image.url}
              alt={post.cover_image.alt ?? post.title}
              decoding="async"
            />
          </figure>
        ) : null}

        <div className="blog-body">
          <Markdown>{post.body_md}</Markdown>
        </div>

        {post.media?.length ? (
          <section className="blog-gallery">
            {post.media.map((item, i) => (
              <BlogMedia key={`${item.type}-${i}`} item={item} />
            ))}
          </section>
        ) : null}

        {faq.length ? (
          <section className="blog-faq" aria-labelledby="blog-faq-heading">
            <h2 id="blog-faq-heading">Frequently asked questions</h2>
            <div className="blog-faq-list">
              {faq.map((f, i) => (
                <details key={i} className="blog-faq-item" open={i === 0}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}
      </article>

      {related.length ? (
        <section className="container blog-related">
          <h2>Read next</h2>
          <div className="post-list">
            {related.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`}>
                {p.tags?.[0] ? <span className="post-kicker">{p.tags[0]}</span> : null}
                <h2>{p.title}</h2>
                {p.excerpt ? <p>{p.excerpt}</p> : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </PageLayout>
  );
}
