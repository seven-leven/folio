/**
 * Adds every commit made since CHANGELOG.md was last changed to its
 * "Unreleased" section, as "- YYYY-MM-DD | subject", ready to tidy up.
 * Commits already listed are skipped, so it's safe to run more than once.
 *
 * Run: deno task changelog
 */
import { git } from "./version.ts";

const FILE = new URL("../CHANGELOG.md", import.meta.url);

const last = await git("log", "-1", "--format=%H", "--", "CHANGELOG.md");
const range = last ? `${last}..HEAD` : "HEAD";
const log = await git("log", "--reverse", "--no-merges", "--format=%cs|%s", range);
if (log === null) {
  console.error("Couldn't read the git history.");
  Deno.exit(1);
}

let text = await Deno.readTextFile(FILE);
const entries = log
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [date, ...subject] = line.split("|");
    return `- ${date} | ${subject.join("|")}`;
  })
  .filter((entry) => !text.includes(entry));

if (!entries.length) {
  console.log("Nothing new to add.");
  Deno.exit(0);
}

const HEADING = "## Unreleased";
if (!text.includes(HEADING)) {
  // New section right after the intro's "---" separator.
  // The extra newline leaves a blank line before the next version's heading.
  text = text.replace(/\n---\n\n/, `\n---\n\n${HEADING}\n\n\n`);
}
text = text.replace(`${HEADING}\n\n`, `${HEADING}\n\n${entries.join("\n")}\n`);

await Deno.writeTextFile(FILE, text);
console.log(`Added ${entries.length} commit(s) under "${HEADING}". Tidy them up, then commit.`);
