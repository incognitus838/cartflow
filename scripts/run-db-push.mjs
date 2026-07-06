import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logPath = join(root, "db-push-run-latest.log");

const child = spawn(
  "npx",
  ["dotenv-cli", "-e", ".env.local", "--", "prisma", "db", "push"],
  { cwd: root, shell: true, env: process.env }
);

let output = "";
child.stdout.on("data", (d) => { output += d; process.stdout.write(d); });
child.stderr.on("data", (d) => { output += d; process.stderr.write(d); });

child.on("close", (code) => {
  writeFileSync(logPath, output);
  process.exit(code ?? 1);
});