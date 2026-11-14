// /api/live-projects/index -> server/routes/live-projects.ts (admin-gated, X-Admin-Key).
import { route } from "../../_lib/route";

export const onRequest = route(() => import("../../../server/routes/live-projects"));
