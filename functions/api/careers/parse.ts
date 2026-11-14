// /api/careers/parse -> server/routes/careers-parse.ts (admin-gated, X-Admin-Key).
import { route } from "../../_lib/route";

export const onRequest = route(() => import("../../../server/routes/careers-parse"));
