import { spawn } from "node:child_process";
import { appendFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outLog = join(root, "dev-out.log");
const errLog = join(root, "dev-err.log");

writeFileSync(outLog, "");
writeFileSync(errLog, "");

function log(file, chunk) {
  appendFileSync(file, chunk.toString());
}

const generate = spawn("npx", ["prisma", "generate"], {
  cwd: root,
  shell: true,
  stdio: ["ignore", "pipe", "pipe"],
});

generate.stdout.on("data", (d) => log(outLog, d));
generate.stderr.on("data", (d) => log(errLog, d));

generate.on("close", (code) => {
  if (code !== 0) {
    log(errLog, `\nprisma generate failed with code ${code}\n`);
    process.exit(code ?? 1);
  }

  const next = spawn(
    "npx",
    ["next", "dev", "--webpack", "-p", "3001"],
    {
      cwd: root,
      shell: true,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  next.stdout.on("data", (d) => log(outLog, d));
  next.stderr.on("data", (d) => log(errLog, d));
  next.unref();
  log(outLog, "\n[next] dev server spawn initiated\n");
});