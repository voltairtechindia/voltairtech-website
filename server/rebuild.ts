/**
 * Ask GitHub Actions to rebuild the static site from the database and deploy
 * it to Cloudflare Pages (.github/workflows/deploy-cloudflare.yml).
 *
 * Needs the Pages secret GITHUB_DEPLOY_TOKEN: a fine-grained token on
 * voltairtechindia/voltairtech-website with "Actions: Read and write". Without
 * it this does nothing and the workflow's schedule picks the change up later.
 *
 * Saves in quick succession are fine: the workflow's concurrency group keeps
 * one run going and one queued, so ten saves cost at most two builds.
 */
const REPO = "voltairtechindia/voltairtech-website";
const WORKFLOW = "deploy-cloudflare.yml";

export type RebuildResult = "requested" | "not_configured" | "failed";

export async function requestRebuild(reason: string): Promise<RebuildResult> {
  const token = process.env.GITHUB_DEPLOY_TOKEN;
  if (!token) return "not_configured";
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "voltairtech-site-rebuild",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({ ref: "main", inputs: { reason: reason.slice(0, 100) } }),
      },
    );
    if (res.status === 204) return "requested";
    console.error("[rebuild] dispatch failed", res.status, await res.text().catch(() => ""));
    return "failed";
  } catch (err) {
    console.error("[rebuild] dispatch error", err);
    return "failed";
  }
}
