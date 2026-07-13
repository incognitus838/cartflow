import { CATEGORY_PHOTO_IDS } from "../lib/catalog/product-image-catalog.mjs";

function collectUniqueIds() {
  const ids = new Set();
  for (const categories of Object.values(CATEGORY_PHOTO_IDS)) {
    for (const photoIds of Object.values(categories)) {
      for (const id of photoIds) ids.add(id);
    }
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
  const allIds = collectUniqueIds();

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