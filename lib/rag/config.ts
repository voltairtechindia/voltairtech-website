/**
 * Server-side RAG configuration, read from environment variables.
 *
 * Nothing here is exposed to the browser — the chat widget talks only to our
 * own `/api/chat` route, which runs server-side and reads these values. Swap
 * the model with LLM_MODEL / EMBEDDING_MODEL; deployment is just setting env.
 *
 * See `.env.local.example` for the full list.
 */

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export const config = {
  // --- Supabase (server-only; the service-role key bypasses RLS) ---
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ?? "",

  // --- Gemini (LLM + embeddings) ---
  googleApiKey: process.env.GOOGLE_API_KEY ?? "",
  llmModel: process.env.LLM_MODEL ?? "gemini-2.5-flash",
  // Background lead-analytics extraction is a cheap, non-user-facing JSON task,
  // so it runs on the cheaper Flash-Lite tier. Override if a key lacks it.
  analyticsModel: process.env.LLM_ANALYTICS_MODEL ?? "gemini-2.5-flash-lite",
  llmTemperature: num(process.env.LLM_TEMPERATURE, 0.6),
  llmMaxOutputTokens: num(process.env.LLM_MAX_OUTPUT_TOKENS, 700),
  embeddingModel: process.env.EMBEDDING_MODEL ?? "gemini-embedding-001",
  // Must match the vector(N) size in supabase/migrations/0001_init.sql.
  embeddingDim: num(process.env.EMBEDDING_DIM, 768),

  // --- RAG tuning ---
  ragTopK: num(process.env.RAG_TOP_K, 6),
  ragMinSimilarity: num(process.env.RAG_MIN_SIMILARITY, 0.3),
  // Optional extra scope gate: refuse outright unless some document clears this
  // similarity. DEFAULT 0 = off, and that default is deliberate.
  //
  // DO NOT raise this expecting it to block off-topic questions. Measured
  // against the sister site's live index on 2026-08-26, gemini-embedding-001
  // has a high similarity floor and the two populations OVERLAP:
  //
  //   off-topic  "explain .map"                  0.599
  //   off-topic  "capital of France"             0.500
  //   off-topic  "write me a python script"      0.537
  //   ON-TOPIC   "is it offline"                 0.694
  //   ON-TOPIC   "What does Kauntech Pro cost?"  0.788
  //
  // Any threshold that catches the first group also refuses real questions, and
  // a jailbreak that names the brand scores HIGHER than a genuine short query.
  // Scope is enforced by the OFF-TOPIC section of the system prompt instead.
  // This knob exists only for a future index where the separation is real.
  ragAnswerMinSimilarity: num(process.env.RAG_ANSWER_MIN_SIMILARITY, 0),
  historyWindow: num(process.env.HISTORY_WINDOW, 8),
  // The bot may only draw on the N most recently published posts — old articles
  // stay embedded (raising this needs no re-seed) but are gated out of
  // retrieval. 0 disables the cap.
  ragBlogLimit: num(process.env.RAG_BLOG_LIMIT, 20),

  // --- Security (protects POST/GET /api/ingest + /api/blog + /api/revalidate) ---
  adminApiKey: process.env.ADMIN_API_KEY ?? "",

  // --- Brand (shapes the assistant persona — see prompts.ts) ---
  brandName: "Voltair Tech",
  appName: "Voltair AI Specialist",
  supportEmail: "business@voltairtech.com",
} as const;
