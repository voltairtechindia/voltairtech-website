// /api/blog/reorder -> server/routes/blog-reorder.ts (admin-gated, X-Admin-Key).
import { route } from "../../_lib/route";

export const onRequest = route(() => import("../../../server/routes/blog-reorder"));
