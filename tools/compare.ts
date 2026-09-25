/**
 * Compares two snapshots from `deno task snapshot`: for each page and width,
 * lists the style changes (grouped, most common first), how many boxes moved,
 * and elements that appeared or disappeared.
 *
 * Run: deno task compare <before> <after> [page-prefix] [--all]
 *   e.g. deno task compare base after index-375
 * Colours that only follow `color` (borders using currentColor) are folded in.
 */
const [a, b, only] = Deno.args.filter((x) => !x.startsWith("--"));
const showAll = Deno.args.includes("--all");
if (!a || !b) {
  console.error("Usage: deno task compare <before> <after> [page-prefix] [--all]");
  Deno.exit(1);
}
const dir = (n: string) => new URL(`../.snapshots/${n}/`, import.meta.url);
type Snap = Record<string, Record<string, string>>;

const names: string[] = [];
for await (const e of Deno.readDir(dir(a))) {
  if (e.name.endsWith(".json") && (!only || e.name.startsWith(only))) names.push(e.name.slice(0, -5));
}

let total = 0;
for (const name of names.sort()) {
  const A: Snap = JSON.parse(await Deno.readTextFile(new URL(`${name}.json`, dir(a))));
  let B: Snap;
  try {
    B = JSON.parse(await Deno.readTextFile(new URL(`${name}.json`, dir(b))));
  } catch {
    console.log(`== ${name}: missing from ${b}`);
    continue;
  }
  const changes = new Map<string, number>();
  let moved = 0;
  for (const key of Object.keys(A)) {
    if (!B[key]) continue;
    for (const prop of new Set([...Object.keys(A[key]), ...Object.keys(B[key])])) {
      const va = A[key][prop], vb = B[key][prop];
      if (va === vb) continue;
      if (prop === "box") {
        moved++;
        continue;
      }
      const followsColor = prop.endsWith("-color") && prop.startsWith("border-") &&
        A[key].color === va && B[key].color === vb;
      if (followsColor) continue;
      const leaf = key.split(">").pop()!.replace(/:\d+$/, "");
      const sig = `${leaf.padEnd(32).slice(0, 32)} ${prop.padEnd(24).slice(0, 24)} ${String(va).slice(0, 44)} -> ${
        String(vb).slice(0, 44)
      }`;
      changes.set(sig, (changes.get(sig) ?? 0) + 1);
    }
  }
  const gone = Object.keys(A).filter((k) => !B[k]);
  const added = Object.keys(B).filter((k) => !A[k]);
  if (!changes.size && !moved && !gone.length && !added.length) continue;
  total++;
  console.log(
    `== ${name}: ${changes.size} style changes, ${moved} boxes moved, -${gone.length} +${added.length} elements`,
  );
  const sorted = [...changes].sort((x, y) => y[1] - x[1]);
  for (const [sig, n] of showAll ? sorted : sorted.slice(0, 30)) console.log(`  ${String(n).padStart(3)}x ${sig}`);
  for (const k of gone.slice(0, 5)) console.log(`   gone  …${k.slice(-80)}`);
  for (const k of added.slice(0, 5)) console.log(`   added …${k.slice(-80)}`);
}
console.log(total ? `\n${total} page/width combination(s) differ.` : "No differences.");
