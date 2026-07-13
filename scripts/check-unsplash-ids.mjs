import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const FILES = [
  "lib/demo/stores.mjs",
  "lib/catalog/demo-verticals.mjs",
  "lib/catalog/beauty-categories.mjs",
  "lib/catalog/demo-images.mjs",
  "lib/catalog/skincare-images.mjs",
];

function extractIds(content) {
  const ids = new Set();
  // photo-XXXX in URLs
  for (const m of content.matchAll(/photo-([a-zA-Z0-9_-]+)/g)) {
    ids.add(m[1]);
  }
  // img("XXXX") shorthand
  for (const m of content.matchAll(/img\("([a-zA-Z0-9_-]+)"\)/g)) {
    ids.add(m[1]);
  }
  return ids;
}

async function headCheck(id) {
  const url = `https://images.unsplash.com/photo-${id}?w=400&q=80`;
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return { id, status: res.status, ok: res.status === 200 };
  } catch (err) {
    return { id, status: null, ok: false, error: err.message };
  }
}

async function main() {
  const allIds = new Set();
  const bySource = {};

  for (const rel of FILES) {
    const path = join(root, rel);
    const content = readFileSync(path, "utf8");
    const ids = extractIds(content);
    bySource[rel] = [...ids].sort();
    for (const id of ids) allIds.add(id);
  }

  const sorted = [...allIds].sort();
  console.log(`Checking ${sorted.length} unique Unsplash photo IDs...\n`);

  const results = await Promise.all(sorted.map(headCheck));

  const ok = [];
  const broken = [];

  for (const r of results) {
    if (r.ok) ok.push(r.id);
    else broken.push({ id: r.id, status: r.status, error: r.error });
  }

  console.log("=== OK (" + ok.length + ") ===");
  for (const id of ok) console.log(`  ${id}`);

  console.log("\n=== BROKEN (" + broken.length + ") ===");
  for (const { id, status, error } of broken) {
    const detail = error ? `error: ${error}` : `status: ${status}`;
    console.log(`  ${id}  (${detail})`);
  }

  console.log("\n=== Summary ===");
  console.log(`Total: ${sorted.length} | OK: ${ok.length} | Broken: ${broken.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});