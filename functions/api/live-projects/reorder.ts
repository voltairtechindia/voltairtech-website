// /api/live-projects/reorder -> server/routes/live-projects-reorder.ts (admin-gated, X-Admin-Key).
import { route } from "../../_lib/route";

export const onRequest = route(() => import("../../../server/routes/live-projects-reorder"));
