/**
 * Site version: vMAJOR.MINOR.PATCH
 *
 * MAJOR.MINOR are set by hand in version.json (bump MINOR for a notable
 * release and log it in CHANGELOG.md). PATCH is the commit count, worked out
 * from git at build time, so it is never stored and can't drift. CI must check
 * out the full history (fetch-depth: 0) for the count to be right.
 *
 * Run: deno task version
 */

const ROOT = new URL("../", import.meta.url);

/** Runs git in the repo root; returns trimmed stdout, or null if git is unavailable or fails. */
export async function git(...args: string[]): Promise<string | null> {
  try {
    const out = await new Deno.Command("git", { args, cwd: ROOT, stdout: "piped", stderr: "null" }).output();
    return out.success ? new TextDecoder().decode(out.stdout).trim() : null;
  } catch {
    return null;
  }
}

/** Date (YYYY-MM-DD) of the last commit that touched a path, relative to the repo root. */
export async function gitDate(path: string): Promise<string | null> {
  return (await git("log", "-1", "--format=%cs", "--", path)) || null;
}

export interface Version {
  major: number;
  minor: number;
  patch: number | null;
  label: string;
  date: string | null;
}

export async function siteVersion(): Promise<Version> {
  const { major, minor } = JSON.parse(await Deno.readTextFile(new URL("version.json", ROOT)));
  const count = await git("rev-list", "--count", "HEAD");
  const patch = count ? Number(count) : null;
  const date = await git("log", "-1", "--format=%cs");
  return { major, minor, patch, date, label: `v${major}.${minor}.${patch ?? "dev"}` };
}

if (import.meta.main) {
  const v = await siteVersion();
  console.log(`${v.label}${v.date ? ` (last commit ${v.date})` : ""}`);
}
