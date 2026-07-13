import {
  getCategoryImageUrls,
  listAllImageDownloads,
} from "../lib/catalog/product-image-catalog.mjs";

async function headCheck(item) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(item.remoteUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "CartflowImageChecker/1.0" },
    });
    return { item, status: res.status, ok: res.status === 200 };
  } catch (err) {
    return { item, status: null, ok: false, error: err.message };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const items = listAllImageDownloads();
  const sample = getCategoryImageUrls("beauty", "body-wash")[4];
  console.log(`Catalog sample beauty/body-wash-4: ${sample}`);
  console.log(`Checking ${items.length} product image URLs...\n`);

  const concurrency = 12;
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    results.push(...(await Promise.all(batch.map(headCheck))));
  }

  const ok = results.filter((r) => r.ok);
  const broken = results.filter((r) => !r.ok);

  if (broken.length) {
    console.log("=== BROKEN (" + broken.length + ") ===");
    for (const { item, status, error } of broken) {
      const detail = error ? `error: ${error}` : `status: ${status}`;
      console.log(`  ${item.vertical}/${item.categorySlug}-${item.slot}: ${detail}`);
      console.log(`    ${item.remoteUrl}`);
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Total: ${items.length} | OK: ${ok.length} | Broken: ${broken.length}`);

  if (broken.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});