import { spawnSync } from "node:child_process";
import { appendFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
config({ path: path.join(root, ".env.local") });
const out = path.join(root, "build-only-report.txt");
writeFileSync(out, `started:${new Date().toISOString()}\n`, "utf8");

const r = spawnSync("npx", ["next", "build"], {
  cwd: root,
  encoding: "utf8",
  shell: true,
  timeout: 600_000,
});

appendFileSync(out, `status:${r.status}\n`, "utf8");
const text = (r.stdout || "") + (r.stderr || "");
const tail = text.trim().slice(-1500);
appendFileSync(out, `tail:\n${tail}\n`, "utf8");
appendFileSync(out, `finished:${new Date().toISOString()}\n`, "utf8");
process.exit(r.status ?? 1);