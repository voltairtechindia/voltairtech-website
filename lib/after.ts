/**
 * Run best-effort work AFTER the response is sent, without adding latency.
 *
 * Next 14.2 has no `after()` (that's Next 15) and no `unstable_after`, so we use
 * the same primitive Next 15 uses under the hood on Vercel: `waitUntil` from
 * `@vercel/functions`, which extends the function's lifetime until the promise
 * settles. Locally (`next dev`) there's no Vercel request context, so we just
 * fire-and-forget — the promise still runs while the dev server is alive.
 *
 * Errors are swallowed: this is for non-critical work (analytics) that must
 * never break or delay the user-facing response.
 */
import { waitUntil } from "@vercel/functions";

export function runAfter(task: () => Promise<unknown>): void {
  const p = Promise.resolve()
    .then(task)
    .catch((err) => console.error("[after] background task failed", err));

  if (process.env.VERCEL) {
    try {
      waitUntil(p);
      return;
    } catch {
      /* no request context — fall through to fire-and-forget */
    }
  }
  void p;
}
