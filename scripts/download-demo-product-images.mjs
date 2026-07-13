/**
 * Download semantic product images to public/demo-products/
 * Run: npm run demo:download-images
 * Force overwrite: npm run demo:download-images -- --force
 */
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { listAllImageDownloads } from "../lib/catalog/product-image-catalog.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = path.join(root, "public", "demo-products", "manifest.json");
const force = process.argv.includes("--force");

async function downloadOne(item) {
  const dest = path.join(root, item.fileRelative);
  await mkdir(path.dirname(dest), { recursive: true });

  if (!force && existsSync(dest)) {
    return { ...item, status: "skipped" };
  }

  const res = await fetch(item.remoteUrl, {
    headers: { "User-Agent": "CartflowDemoImageDownloader/1.0" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${item.remoteUrl}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const optimized = await sharp(buffer)
    .resize(900, 900, { fit: "cover", position: "centre" })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  await writeFile(dest, optimized);
  return { ...item, status: "downloaded", bytes: optimized.length };
}

async function main() {
  const items = listAllImageDownloads();
  console.log(
    `Downloading ${items.length} product images${force ? " (force overwrite)" : ""}...\n`,
  );

  let downloaded = 0;
  let skipped = 0;
  const failures = [];

  for (const item of items) {
    try {
      const result = await downloadOne(item);
      if (result.status === "downloaded") {
        downloaded += 1;
        process.stdout.write(".");
      } else {
        skipped += 1;
      }
    } catch (error) {
      failures.push({ item, error: error.message });
      process.stdout.write("x");
    }
  }

  console.log(`\n\nDone: ${downloaded} downloaded, ${skipped} skipped, ${failures.length} failed`);

  if (failures.length) {
    console.log("\nFailures:");
    for (const f of failures) {
      console.log(`  ${f.item.fileRelative}: ${f.error}`);
    }
    process.exit(1);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    count: items.length,
    items: items.map(({ vertical, categorySlug, slot, sourceId, localPath }) => ({
      vertical,
      categorySlug,
      slot,
      sourceId,
      localPath,
    })),
  };
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(`Manifest: ${MANIFEST}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});