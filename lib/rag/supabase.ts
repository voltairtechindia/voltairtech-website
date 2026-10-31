/**
 * Server-side Supabase client (service-role key — bypasses RLS).
 *
 * NEVER import this from a Client Component or expose the key to the browser.
 *
 * Without SUPABASE_URL / SUPABASE_SERVICE_KEY (the normal GitHub Pages build)
 * the client answers the same queries from the content snapshot in
 * content/db/*.json, so every page renders its full content with no database.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { createStaticFetch } from "@/lib/static-db/postgrest";
import { staticTables } from "@/lib/static-db/tables";

import { config } from "./config";

let client: SupabaseClient | null = null;

/** True when a real database is configured for this build. */
export const DATABASE_CONFIGURED = Boolean(config.supabaseUrl && config.supabaseServiceKey);

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = DATABASE_CONFIGURED
      ? createClient(config.supabaseUrl, config.supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : createClient("https://content-snapshot.invalid", "static", {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { fetch: createStaticFetch(staticTables()) },
        });
  }
  return client;
}
