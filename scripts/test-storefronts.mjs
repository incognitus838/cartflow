import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "storefront-test-result.json");

const urls = [
  "http://localhost:3001/glow-beauty",
  "http://localhost:3001/ada-styles",
];

async function waitForReady(maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch("http://localhost:3001/api/health");
      if (res.ok) return true;
    } catch {
      // not ready
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

const ready = await waitForReady();
const results = { ready, pages: [] };

for (const url of urls) {
  try {
    const res = await fetch(url);
    const body = await res.text();
    results.pages.push({
      url,
      status: res.status,
      hasPrismaApprovalStatusError: /approvalStatus|PrismaClientValidationError|Unknown argument/i.test(body),
      titleMatch: body.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? null,
      snippet: body.slice(0, 500),
    });
  } catch (e) {
    results.pages.push({ url, error: String(e) });
  }
}

writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));