/**
 * Release: check, merge dev into main, push both, and wait for the deploy.
 *
 * 1. You must be on dev with nothing uncommitted.
 * 2. Runs `deno task check`; stops if it fails.
 * 3. Pushes dev, fast-forwards main to dev, pushes main, and goes back to dev.
 * 4. If the GitHub CLI (gh) is installed, waits for the "Check & deploy" run
 *    for that commit and reports the result.
 *
 * Run: deno task release
 */
import { git, siteVersion } from "./version.ts";

const SITE = "https://seven-leven.github.io/folio/";

async function run(cmd: string, args: string[]): Promise<boolean> {
  try {
    const { success } = await new Deno.Command(cmd, { args, stdout: "inherit", stderr: "inherit" }).output();
    return success;
  } catch {
    return false;
  }
}

function fail(message: string): never {
  console.error(`\n✗ ${message}`);
  Deno.exit(1);
}

const branch = await git("rev-parse", "--abbrev-ref", "HEAD");
if (branch !== "dev") fail(`Release from dev (you're on ${branch ?? "?"}).`);
if (await git("status", "--porcelain")) fail("Commit or stash your changes first.");

console.log("→ Checking the site…");
if (!await run("deno", ["task", "check"])) fail("The check failed, so nothing was pushed.");

console.log("\n→ Pushing dev and fast-forwarding main…");
const ok = await run("git", ["push", "origin", "dev"]) &&
  await run("git", ["checkout", "main"]) &&
  await run("git", ["merge", "--ff-only", "dev"]) &&
  await run("git", ["push", "origin", "main"]);
await run("git", ["checkout", "dev"]);
if (!ok) fail("Couldn't update main (does it have commits that aren't on dev?).");

const sha = (await git("rev-parse", "HEAD"))!;
const { label } = await siteVersion();
console.log(`\n✓ Pushed ${label} (${sha.slice(0, 7)}).`);

// Wait for the deploy, if the GitHub CLI is available.
const gh = async (...args: string[]) => {
  try {
    const out = await new Deno.Command("gh", { args, stdout: "piped", stderr: "null" }).output();
    return out.success ? new TextDecoder().decode(out.stdout).trim() : null;
  } catch {
    return null;
  }
};
if (await gh("--version") === null) {
  console.log(`Install the GitHub CLI (gh) to wait for the deploy here. Otherwise it'll be live at ${SITE} shortly.`);
  Deno.exit(0);
}
console.log("→ Waiting for the deploy run…");
let runId: string | null = null;
for (let i = 0; i < 24 && !runId; i++) {
  runId = await gh(
    "run",
    "list",
    "--branch",
    "main",
    "--commit",
    sha,
    "--limit",
    "1",
    "--json",
    "databaseId",
    "-q",
    ".[0].databaseId",
  ) ||
    null;
  if (!runId) await new Promise((r) => setTimeout(r, 5000));
}
if (!runId) fail("The deploy run didn't start. Check the Actions tab on GitHub.");
const watched = await run("gh", ["run", "watch", runId, "--exit-status"]);
if (!watched) fail(`The deploy run failed: gh run view ${runId} --log-failed`);
console.log(`\n✓ Deployed ${label}. GitHub Pages usually updates within a minute: ${SITE}`);
