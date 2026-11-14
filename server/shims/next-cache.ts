/**
 * Stand-in for `next/cache`. The static site has no ISR cache to clear: every
 * successful admin write instead triggers a full rebuild + deploy
 * (functions/_lib/route.ts -> server/rebuild.ts), so these are no-ops.
 */
export function revalidatePath(_path: string, _type?: "page" | "layout"): void {}

export function revalidateTag(_tag: string): void {}
