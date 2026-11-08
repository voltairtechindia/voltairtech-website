/**
 * Run best-effort work AFTER the response is sent, without adding latency.
 *
 * On Cloudflare Pages Functions, functions/_lib/runtime.ts registers the
 * request's waitUntil as globalThis.__vtWaitUntil, which keeps the worker alive
 * until the promise settles. Anywhere else it is fire-and-forget.
 *
 * Errors are swallowed: this is for non-critical work (analytics) that must
 * never break or delay the user-facing response.
 */
export function runAfter(task: () => Promise<unknown>): void {
  const p = Promise.resolve()
    .then(task)
    .catch((err) => console.error("[after] background task failed", err));

  const wait = (globalThis as { __vtWaitUntil?: (p: Promise<unknown>) => void }).__vtWaitUntil;
  if (wait) {
    try {
      wait(p);
      return;
    } catch {
      /* request already finished: fall through to fire-and-forget */
    }
  }
  void p;
}
