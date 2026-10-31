"use client";

import { Children, useEffect, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Pagination for a static site.
 *
 * GitHub Pages has no server to read `?page=`, so every card ships in the HTML
 * and the browser shows one page of them. Cards outside the current page stay in
 * the HTML (hidden) so search engines still find every link.
 */
export function PagedGrid({
  children,
  perPage,
  basePath,
  label,
  className,
  style,
}: {
  children: ReactNode;
  perPage: number;
  basePath: string;
  label: string;
  className?: string;
  style?: CSSProperties;
}) {
  const items = Children.toArray(children);
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const [page, setPage] = useState(1);

  useEffect(() => {
    const read = () => {
      const n = Number(new URLSearchParams(window.location.search).get("page")) || 1;
      setPage(Math.min(Math.max(1, Math.floor(n)), pageCount));
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [pageCount]);

  const go = (n: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState(null, "", n === 1 ? basePath : `${basePath}?page=${n}`);
    setPage(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const start = (page - 1) * perPage;
  const shown = items.slice(start, start + perPage);
  const rest = [...items.slice(0, start), ...items.slice(start + perPage)];

  return (
    <>
      <div className={className} style={style}>
        {shown}
      </div>
      {rest.length ? <div hidden>{rest}</div> : null}

      {pageCount > 1 ? (
        <nav className="pagination" aria-label={label}>
          {page > 1 ? (
            <a className="pagination__btn" href={page - 1 === 1 ? basePath : `${basePath}?page=${page - 1}`} onClick={go(page - 1)}>
              ← Prev
            </a>
          ) : (
            <span className="pagination__btn is-disabled">← Prev</span>
          )}
          <span className="pagination__status">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <a className="pagination__btn" href={`${basePath}?page=${page + 1}`} onClick={go(page + 1)}>
              Next →
            </a>
          ) : (
            <span className="pagination__btn is-disabled">Next →</span>
          )}
        </nav>
      ) : null}
    </>
  );
}
