/**
 * Runs one of the admin API routes in server/routes (Request -> Response, the
 * same handlers the Vercel version served from app/api) as a Pages Function.
 * The handler module is imported only after prepare(), because lib/rag/config
 * reads the secrets from process.env when it is first loaded.
 */
import { json, prepare, type PagesContext } from "./runtime";

type Handler = (req: Request) => Promise<Response>;
type RouteModule = Partial<Record<"GET" | "POST" | "DELETE", Handler>>;

export function route(load: () => Promise<RouteModule>) {
  return async (ctx: PagesContext): Promise<Response> => {
    prepare(ctx);
    const method = ctx.request.method.toUpperCase() as keyof RouteModule;
    const mod = await load();
    const handler = mod[method];
    if (!handler) return json({ detail: "Method not allowed." }, 405);
    try {
      return await handler(ctx.request);
    } catch (err) {
      console.error("[admin-route]", ctx.request.url, err);
      return json({ detail: err instanceof Error ? err.message : "Server error." }, 500);
    }
  };
}
