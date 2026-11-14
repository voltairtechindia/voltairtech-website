/**
 * Stand-in for `next/server` so the admin write routes in server/routes (ported
 * from the `vercel-full` branch) run unchanged as Cloudflare Pages Functions.
 * Only NextResponse.json is used by them.
 */
export const NextResponse = {
  json(body: unknown, init?: ResponseInit): Response {
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "application/json");
    if (!headers.has("Cache-Control")) headers.set("Cache-Control", "no-store");
    return new Response(JSON.stringify(body), { ...init, headers });
  },
};
