/**
 * POST /api/career  (the same JSON lib/leads.ts sends to the Google Sheet,
 * plus `job_slug`)
 *
 * Saves a job application to Supabase `job_applications` and its résumé to the
 * private `resumes` bucket, which is what the admin panel's Careers >
 * Applications page reads. Then parses + embeds the résumé in the background
 * (same runParse the old Vercel /api/careers/apply used). The Google Sheet and
 * the email to the team still come from the Apps Script; this is the admin copy.
 */
import { json, prepare, type PagesContext } from "../_lib/runtime";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BYTES = 5 * 1024 * 1024;
const PDF_MIME = "application/pdf";
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function str(v: unknown, max = 200): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function url(v: unknown): string | null {
  const s = str(v, 500);
  if (!s) return null;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Trust the bytes over the browser's label: %PDF or a ZIP (DOCX) header. */
function sniffMime(bytes: Uint8Array, name: string, declared: string): string | null {
  const head = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (head === "%PDF") return PDF_MIME;
  if (head === "PK\u0003\u0004" && (/\.docx$/i.test(name) || declared === DOCX_MIME)) return DOCX_MIME;
  return null;
}

export async function onRequestPost(ctx: PagesContext): Promise<Response> {
  prepare(ctx);
  let body: Record<string, unknown>;
  try {
    body = await ctx.request.json();
  } catch {
    return json({ detail: "Invalid JSON body." }, 400);
  }
  // Honeypot: bots fill the hidden field. Accept silently, store nothing.
  if (str(body._hp)) return json({ ok: true });

  const fullName = str(body.name);
  const email = str(body.email, 320);
  if (!fullName) return json({ detail: "name is required." }, 400);
  if (!EMAIL_RE.test(email)) return json({ detail: "A valid email is required." }, 400);

  const file = body.file as { name?: unknown; type?: unknown; data?: unknown } | undefined;
  if (!file || typeof file.data !== "string") return json({ detail: "A résumé is required." }, 400);
  let bytes: Uint8Array;
  try {
    bytes = base64ToBytes(file.data);
  } catch {
    return json({ detail: "Résumé could not be read." }, 400);
  }
  if (bytes.length > MAX_BYTES) return json({ detail: "Résumé is over 5 MB." }, 413);
  const fileName = str(file.name, 200) || "resume";
  const mime = sniffMime(bytes, fileName, str(file.type, 120));
  if (!mime) return json({ detail: "Résumés must be a PDF or DOCX file." }, 415);

  const { LIMITS, getClientIp, istDay, rlHit } = await import("../../lib/rate-limit");
  const ip = getClientIp(ctx.request);
  const [burst, daily] = await Promise.all([
    rlHit(`apply:burst:${ip}`, LIMITS.applyBurst.limit, LIMITS.applyBurst.windowSeconds),
    rlHit(`apply:day:${istDay()}:${ip}`, LIMITS.applyDaily.limit, LIMITS.applyDaily.windowSeconds),
  ]);
  if (!burst.allowed || !daily.allowed) return json({ detail: "Too many applications." }, 429);

  const { getSupabase } = await import("../../lib/rag/supabase");
  const { insertApplication } = await import("../../lib/careers/db");
  const { RESUMES_BUCKET } = await import("../../lib/careers/storage");
  const sb = getSupabase();

  // Link the application to its opening when we can find it.
  let jobId: string | null = null;
  let jobTitle: string | null = str(body.role, 200) || null;
  const slug = str(body.job_slug, 200);
  if (slug) {
    const { data } = await sb.from("job_openings").select("id,title").eq("slug", slug).maybeSingle();
    if (data) {
      jobId = data.id as string;
      jobTitle = data.title as string;
    }
  }

  const ext = mime === PDF_MIME ? "pdf" : "docx";
  const resumePath = `applications/${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${ext}`;

  try {
    const { error: upErr } = await sb.storage
      .from(RESUMES_BUCKET)
      .upload(resumePath, bytes, { contentType: mime, upsert: false });
    if (upErr) throw upErr;

    const years = Number(str(body.years_experience, 10));
    const now = new Date().toISOString();
    const id = await insertApplication({
      job_id: jobId,
      job_title: jobTitle,
      full_name: fullName,
      email,
      phone: str(body.phone, 50) || null,
      location: str(body.location) || null,
      linkedin_url: url(body.linkedin),
      portfolio_url: url(body.portfolio),
      years_experience: Number.isFinite(years) && str(body.years_experience, 10) ? years : null,
      cover_note: str(body.note, 5000) || null,
      resume_path: resumePath,
      resume_filename: fileName,
      resume_mime: mime,
      consent_given: true,
      consent_at: now,
    });

    // Résumé parse + embedding for the admin's AI shortlist. Best effort: a
    // failure marks the row parse_status=error, and the admin can re-parse.
    ctx.waitUntil(
      import("../../lib/careers/parse")
        .then(({ runParse }) => runParse(id))
        .catch((err) => console.error("[career] parse failed", id, err)),
    );
    return json({ ok: true });
  } catch (err) {
    console.error("[career] save failed", err);
    return json({ detail: "Could not save." }, 500);
  }
}
