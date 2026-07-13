import { spawn } from "child_process";
import { writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outFile = path.join(root, "check-unsplash-output.txt");

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const proc = spawn(cmd, args, { cwd: root, shell: true });
    proc.stdout.on("data", (d) => chunks.push(d));
    proc.stderr.on("data", (d) => chunks.push(d));
    proc.on("close", (code) => resolve({ code, output: Buffer.concat(chunks).toString() }));
    proc.on("error", reject);
  });
}

const lines = [];
lines.push("=== node scripts/check-unsplash-ids.mjs ===\n");
const check = await run("node", ["scripts/check-unsplash-ids.mjs"]);
lines.push(check.output);
lines.push(`\nEXIT: ${check.code}\n`);

if (check.code === 0) {
  lines.push("\n=== node scripts/download-demo-product-images.mjs --force ===\n");
  const dl = await run("node", ["scripts/download-demo-product-images.mjs", "--force"]);
  lines.push(dl.output);
  lines.push(`\nEXIT: ${dl.code}\n`);
} else {
  lines.push("\nSkipped download — fix broken URLs first.\n");
}

await writeFile(outFile, lines.join(""));
console.log(lines.join(""));
process.exit(check.code);