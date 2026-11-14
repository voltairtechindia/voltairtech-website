// /api/faqs/index -> server/routes/faqs.ts (admin-gated, X-Admin-Key).
import { route } from "../../_lib/route";

export const onRequest = route(() => import("../../../server/routes/faqs"));
