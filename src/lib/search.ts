export type Item = { id: string; name: string; keywords: string; tent: string; spot: string };

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP = new Set(["um", "uma", "o", "a", "os", "as", "de", "do", "da", "dos", "das", "e", "com", "para", "pra"]);

function stem(w: string): string {
  if (w.length > 4 && w.endsWith("oes")) return w.slice(0, -3) + "ao";
  if (w.length > 3 && w.endsWith("s")) return w.slice(0, -1);
  return w;
}

function tokens(s: string): string[] {
  return normalize(s).split(" ").filter((t) => t && !STOP.has(t)).map(stem);
}

/** Score an item against a query. 0 = no match. Higher = better. */
export function scoreItem(item: Item, query: string): number {
  const q = tokens(query);
  if (!q.length) return 0;
  const nameT = tokens(item.name);
  const kwT = tokens(item.keywords);
  let score = 0;
  for (const t of q) {
    if (nameT.includes(t)) score += 10;
    else if (nameT.some((n) => n.startsWith(t) || t.startsWith(n) && n.length >= 3)) score += 6;
    else if (kwT.includes(t)) score += 5;
    else if (kwT.some((k) => k.startsWith(t))) score += 3;
    else return 0; // every word must match something
  }
  if (normalize(item.name) === normalize(query)) score += 20;
  return score;
}

export function search(items: Item[], query: string, limit = 20): Item[] {
  return items
    .map((i) => ({ i, s: scoreItem(i, query) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.i);
}
