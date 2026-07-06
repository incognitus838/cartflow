import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = createWriteStream(join(root, "dev-out.log"));
const err = createWriteStream(join(root, "dev-err.log"));

const child = spawn("npm", ["run", "dev"], {
  cwd: root,
  shell: true,
  env: process.env,
  detached: true,
  stdio: ["ignore", "pipe", "pipe"],
});

child.stdout.pipe(out);
child.stderr.pipe(err);
child.unref();