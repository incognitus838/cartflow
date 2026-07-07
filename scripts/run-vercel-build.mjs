import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logPath = path.join(root, "build-vercel-final.log");
const statusPath = path.join(root, "build-vercel-final.status");

fs.writeFileSync(statusPath, "running");

const result = spawnSync("npm", ["run", "vercel-build"], {
  cwd: root,
  shell: true,
  env: process.env,
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024,
});

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
fs.writeFileSync(logPath, output);
fs.writeFileSync(statusPath, String(result.status ?? 1));