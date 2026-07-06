import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "quick-test-result.json");

const urls = [
  "http://localhost:3001/glow-beauty",
  "http://localhost:3001/ada-styles",
];

const results = { pages: [] };

for (const url of urls) {
  try {
    const res = await fetch(url);
    const body = await res.text();
    results.pages.push({
      url,
      status: res.status,
      hasPrismaApprovalStatusError: /approvalStatus|PrismaClientValidationError|Unknown argument/i.test(body),
      titleMatch: body.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? null,
      errorSnippet: body.includes("PrismaClientValidationError")
        ? body.slice(body.indexOf("PrismaClientValidationError"), body.indexOf("PrismaClientValidationError") + 300)
        : null,
    });
  } catch (e) {
    results.pages.push({ url, error: String(e) });
  }
}

writeFileSync(outPath, JSON.stringify(results, null, 2));