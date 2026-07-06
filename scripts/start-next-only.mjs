import { spawn } from "node:child_process";
import { writeFileSync, appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outLog = join(root, "dev-out.log");
const errLog = join(root, "dev-err.log");

writeFileSync(outLog, "[start-next-only] launching next dev on :3001\n");
writeFileSync(errLog, "");

const next = spawn("npx", ["next", "dev", "--webpack", "-p", "3001"], {
  cwd: root,
  shell: true,
  detached: true,
  stdio: ["ignore", "pipe", "pipe"],
});

next.stdout.on("data", (d) => appendFileSync(outLog, d));
next.stderr.on("data", (d) => appendFileSync(errLog, d));
next.unref();