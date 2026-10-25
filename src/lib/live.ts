/**
 * Data fetched when the site is built (and the site is rebuilt every day, deploy.yml), so the
 * pages ship with it: no third-party script, no "couldn't be loaded" state in the browser.
 *
 * - The process journal on Tumblr, from the blog's RSS feed. Tumblr's old JSON API now answers
 *   with a "checking your browser" page, so the feed is the dependable source. If it can't be
 *   read, the page builds anyway and links to the blog instead.
 * - Wildlife Illustrated's progress, from bird_dash's own JSON. That's my own site, so a failure
 *   stops the build: the live site keeps its last good numbers rather than showing none.
 */

const UA = "Mozilla/5.0 (compatible; folio-build; +https://seven-leven.github.io/folio/)";

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  ndash: "–",
  mdash: "—",
  hellip: "…",
};
const decode = (s: string) =>
  s.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (all, e: string) => {
    if (e[0] === "#")
      return String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    return ENTITIES[e.toLowerCase()] ?? all;
  });
const tag = (xml: string, name: string) => xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1] ?? "";

export interface JournalEntry {
  href: string;
  image: string | null;
  label: string;
  caption: string;
  date: string; // ISO
  dateText: string; // "17 Jun 2026"
}

/** The latest `count` posts of a Tumblr blog, or null if the feed can't be read. */
export async function journal(blog: string, count: number): Promise<JournalEntry[] | null> {
  try {
    const res = await fetch(`https://${blog}.tumblr.com/rss`, { headers: { "user-agent": UA } });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
    if (!items.length) throw new Error("no posts in the feed");
    return items.slice(0, count).map((item) => {
      const body = decode(tag(item, "description"));
      // The 500-ish px version from the image's srcset, like the old API's photo-url-500
      const img = body.match(/<img\b[^>]*>/)?.[0] ?? "";
      const options = [...(img.match(/srcset="([^"]*)"/)?.[1] ?? "").matchAll(/(https:\S+)\s+(\d+)w/g)]
        .map((m) => ({ url: m[1], w: Number(m[2]) }))
        .sort((a, b) => a.w - b.w);
      const image = options.find((o) => o.w >= 500)?.url ?? img.match(/src="(https:[^"]+)"/)?.[1] ?? null;
      // Text only: block ends and links become spaces, every other tag goes
      const text = decode(
        `${tag(item, "title")} ${body}`
          .replace(/<\/(p|div|li|h\d|figure|blockquote|a)>|<br\s*\/?>/gi, " ")
          .replace(/<[^>]+>/g, ""),
      )
        .replace(/\s+/g, " ")
        .trim();
      const num = text.match(/entry\s*\/\/\s*#?\s*(\d+)/i)?.[1];
      const caption = text
        // The feed repeats the heading ("Journal Entry // #47") in the title and the body: drop every copy
        .replace(/\S*\s*entry\s*\/\/\s*#?\s*\d+/gi, "")
        .replace(/@[\w-]+/g, "")
        .trim();
      const date = new Date(tag(item, "pubDate"));
      return {
        href: decode(tag(item, "link")),
        image,
        label: num ? `Entry #${num}` : "Journal",
        caption: caption || "View entry",
        date: date.toISOString(),
        dateText: date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "Indian/Maldives",
        }),
      };
    });
  } catch (err) {
    console.warn(
      `  (journal) couldn't read ${blog}.tumblr.com/rss: ${(err as Error).message}; the page links to the blog instead`,
    );
    return null;
  }
}

export interface Drawing {
  id: string;
  name: string;
  dhiv_script?: string;
  drawn?: string;
  collection: { id: string; itemLabel?: string };
}

export interface WildlifeProgress {
  stats: Record<string, { drawn: number; total: number }>;
  latest: Drawing[];
}

/** Drawn and total counts per collection (and "all"), and the six latest drawings. */
export async function wildlife(base: string): Promise<WildlifeProgress> {
  const get = async <T>(path: string): Promise<T> => {
    const res = await fetch(base + path, { headers: { "user-agent": UA } });
    if (!res.ok) throw new Error(`Wildlife Illustrated: ${base}${path} answered ${res.status}`);
    return res.json() as Promise<T>;
  };
  const collections = await get<{ id: string; itemLabel?: string }[]>("collections.json");
  const lists = await Promise.all(
    collections.map((c) => get<Record<string, Omit<Drawing, "collection">[]>>(`lists/${c.id}.json`)),
  );
  const stats: WildlifeProgress["stats"] = { all: { drawn: 0, total: 0 } };
  const drawn: Drawing[] = [];
  collections.forEach((c, i) => {
    const items = Object.values(lists[i]).flat();
    const done = items.filter((it) => it.drawn);
    stats[c.id] = { drawn: done.length, total: items.length };
    stats.all.drawn += done.length;
    stats.all.total += items.length;
    for (const it of done) drawn.push({ ...it, collection: c });
  });
  drawn.sort((a, b) => String(b.drawn).localeCompare(String(a.drawn)));
  return { stats, latest: drawn.slice(0, 6) };
}
