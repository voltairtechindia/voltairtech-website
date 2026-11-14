// /api/industries/reorder -> server/routes/industries-reorder.ts (admin-gated, X-Admin-Key).
import { route } from "../../_lib/route";

export const onRequest = route(() => import("../../../server/routes/industries-reorder"));
