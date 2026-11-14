// /api/services/reorder -> server/routes/services-reorder.ts (admin-gated, X-Admin-Key).
import { route } from "../../_lib/route";

export const onRequest = route(() => import("../../../server/routes/services-reorder"));
