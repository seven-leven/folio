/**
 * Compares two builds of the site, file by file: what was added, removed or changed.
 * Used to prove a change to the build or the tooling didn't change the site.
 *
 * Run: npm run distdiff -- <a> <b> [--html] [--show=<n>]
 *   e.g. npm run distdiff -- dist-ref dist --html
 *
 * --html compares pages after normalising them: parsed as HTML, comments dropped,
 * whitespace collapsed (except inside <pre>, <textarea>, <script> and <style>),
 * attributes sorted, character references resolved. Then only differences a
 * browser would notice are reported. Without it, every file is compared byte for byte.
 */
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { parse } from "parse5";

const args = process.argv.slice(2);
const [a, b] = args.filter((x) => !x.startsWith("--"));
const html = args.includes("--html");
const show = Number(args.find((x) => x.startsWith("--show="))?.slice(7) ?? 3);
if (!a || !b) {
  console.error("Usage: npm run distdiff -- <a> <b> [--html] [--show=<n>]");
  process.exit(1);
}

async function list(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries.filter((e) => e.isFile()).map((e) => relative(dir, join(e.parentPath, e.name)).replaceAll("\\", "/"));
}

// The parts of parse5's tree this uses
interface Node {
  nodeName: string;
  tagName?: string;
  value?: string;
  data?: string;
  attrs?: { name: string; value: string }[];
  childNodes?: Node[];
  content?: Node;
}

const RAW = new Set(["pre", "textarea", "script", "style"]);

/** One line per element, attribute set and text run, in document order. */
function normalise(source: string): string[] {
  const out: string[] = [];
  const walk = (node: Node, depth: number, raw: boolean) => {
    if (node.nodeName === "#comment") return;
    if (node.nodeName === "#text") {
      const text = raw ? (node.value ?? "") : (node.value ?? "").replace(/\s+/g, " ").trim();
      if (text) out.push(`${"  ".repeat(depth)}"${text}"`);
      return;
    }
    if (node.nodeName === "#documentType") {
      out.push("<!doctype>");
      return;
    }
    const kids = node.content?.childNodes ?? node.childNodes ?? [];
    if (node.tagName) {
      const attrs = [...(node.attrs ?? [])]
        .sort((x, y) => x.name.localeCompare(y.name))
        .map((x) => ` ${x.name}="${x.value.replace(/\s+/g, " ").trim()}"`)
        .join("");
      out.push(`${"  ".repeat(depth)}<${node.tagName}${attrs}>`);
    }
    for (const kid of kids) walk(kid, depth + (node.tagName ? 1 : 0), raw || RAW.has(node.tagName ?? ""));
  };
  walk(parse(source) as unknown as Node, 0, false);
  return out;
}

/** First lines where two line lists part ways. */
function firstDifferences(x: string[], y: string[], n: number): string[] {
  const out: string[] = [];
  let i = 0,
    j = 0;
  while ((i < x.length || j < y.length) && out.length < n * 2) {
    if (x[i] === y[j]) {
      i++;
      j++;
      continue;
    }
    out.push(`    - ${(x[i] ?? "(end)").slice(0, 160)}`, `    + ${(y[j] ?? "(end)").slice(0, 160)}`);
    // resynchronise on the next line that appears in both
    const k = y.indexOf(x[i + 1], j);
    i++;
    j = k >= 0 ? k : j + 1;
  }
  return out;
}

const [left, right] = await Promise.all([list(a), list(b)]);
const inB = new Set(right);
const inA = new Set(left);
const removed = left.filter((f) => !inB.has(f)).sort();
const added = right.filter((f) => !inA.has(f)).sort();
const changed: string[] = [];
const details: string[] = [];

for (const f of left.filter((f) => inB.has(f)).sort()) {
  const [x, y] = await Promise.all([readFile(join(a, f)), readFile(join(b, f))]);
  if (x.equals(y)) continue;
  if (html && f.endsWith(".html")) {
    const nx = normalise(x.toString("utf8")),
      ny = normalise(y.toString("utf8"));
    if (nx.join("\n") === ny.join("\n")) continue;
    changed.push(f);
    details.push(`  ${f}`, ...firstDifferences(nx, ny, show));
  } else changed.push(f);
}

console.log(`${a}: ${left.length} files, ${b}: ${right.length} files`);
for (const f of removed) console.log(`  removed ${f}`);
for (const f of added) console.log(`  added   ${f}`);
for (const f of changed) console.log(`  changed ${f}`);
if (details.length) console.log(`\nFirst differences${html ? " (normalised HTML)" : ""}:\n${details.join("\n")}`);
const total = removed.length + added.length + changed.length;
console.log(total ? `\n${total} difference(s).` : "\nNo differences.");
process.exit(total ? 1 : 0);
