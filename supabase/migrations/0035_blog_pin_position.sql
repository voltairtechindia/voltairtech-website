-- 0035: manual ordering for the blog index.
--
-- The blog is chronological by default. `pin_position` lets the admin pin a
-- handful of posts to the front of /blog in an explicit 1, 2, 3 order; NULL
-- (the default) means "unpinned — sort by date". Listing order is therefore
--   pin_position asc nulls last, published_at desc
-- so a new post still lands at the top of the unpinned run without the admin
-- having to renumber anything.

alter table blog_posts add column if not exists pin_position int;

comment on column blog_posts.pin_position is
    'Manual blog-index order: 1 = first card. NULL = unpinned (date order).';

drop index if exists blog_posts_published_idx;
create index if not exists blog_posts_published_idx
    on blog_posts (pin_position asc nulls last, published_at desc)
    where status = 'published';
