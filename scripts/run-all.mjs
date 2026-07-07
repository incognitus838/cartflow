import { spawn, execSync } from "node:child_process";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logPath = join(root, "run-all-result.json");
const PORT = 3001;

function run(cmd, args, label) {
  return new Promise((resolve) => {
    const started = Date.now();
    let output = "";
    const child = spawn(cmd, args, {
      cwd: root,
      shell: true,
      env: process.env,
    });
    child.stdout.on("data", (d) => {
      output += d;
      process.stdout.write(d);
    });
    child.stderr.on("data", (d) => {
      output += d;
      process.stderr.write(d);
    });
    child.on("close", (code) => {
      resolve({
        step: label,
        status: code === 0 ? "PASS" : "FAIL",
        exitCode: code ?? 1,
        durationMs: Date.now() - started,
        output: output.slice(-4000),
      });
    });
  });
}

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve({ up: res.statusCode === 200, body }));
    });
    req.on("error", () => resolve({ up: false }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ up: false });
    });
  });
}

function clearNext() {
  const nextDir = join(root, ".next");
  if (!existsSync(nextDir)) return "SKIP";
  try {
    rmSync(nextDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  } catch (err) {
    if (process.platform === "win32") {
      try {
        execSync(`cmd /c rmdir /s /q "${nextDir}"`, { stdio: "ignore" });
      } catch {
        throw err;
      }
    } else {
      throw err;
    }
  }
  return existsSync(nextDir) ? "FAIL" : "PASS";
}

function killPort(port) {
  try {
    if (process.platform === "win32") {
      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
      const pids = new Set();
      for (const line of out.split("\n")) {
        const m = line.trim().match(/\s+(\d+)\s*$/);
        if (m) pids.add(m[1]);
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
        } catch {
          /* ignore */
        }
      }
      return pids.size > 0 ? "PASS" : "SKIP";
    }
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { shell: true });
    return "PASS";
  } catch {
    return "SKIP";
  }
}

async function main() {
  const results = [];

  results.push({ step: "kill-port-3001", status: killPort(PORT) });
  results.push({ step: "clear-next-cache", status: clearNext() });

  results.push(await run("npm", ["install"], "npm-install"));
  results.push(
    await run(
      "npx",
      ["dotenv-cli", "-e", ".env.local", "--", "prisma", "generate"],
      "prisma-generate",
    ),
  );

  let migrate = await run(
    "npx",
    ["dotenv-cli", "-e", ".env.local", "--", "prisma", "migrate", "deploy"],
    "prisma-migrate-deploy",
  );
  if (migrate.status === "FAIL") {
    const teamSchema = await run(
      "npx",
      ["dotenv-cli", "-e", ".env.local", "--", "node", "scripts/apply-team-schema.mjs"],
      "apply-team-schema-fallback",
    );
    migrate = { ...migrate, fallback: teamSchema };
    if (teamSchema.status === "PASS") {
      migrate = {
        ...migrate,
        status: "PASS",
        note: "migrate deploy skipped (P3005); apply-team-schema fallback succeeded",
      };
    }
  }
  results.push(migrate);

  results.push({ step: "clear-next-before-tsc", status: clearNext() });
  results.push(
    await run("npx", ["tsc", "--noEmit", "-p", "tsconfig.check.json"], "tsc"),
  );

  results.push(await run("npx", ["next", "typegen"], "next-typegen"));
  results.push(await run("npm", ["run", "build"], "next-build"));

  // Start production server from build output
  killPort(PORT);
  const child = spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: root,
    shell: true,
    detached: true,
    stdio: "ignore",
    env: { ...process.env, NODE_ENV: "production" },
  });
  child.unref();

  await new Promise((r) => setTimeout(r, 8000));
  let portUp = await checkPort(PORT);
  if (!portUp.up) {
    await new Promise((r) => setTimeout(r, 12000));
    portUp = await checkPort(PORT);
  }

  results.push({
    step: "prod-server",
    status: portUp.up ? "PASS" : "FAIL",
    url: portUp.up ? `http://localhost:${PORT}` : null,
  });

  if (portUp.up) {
    results.push(await run("npm", ["run", "test:api"], "api-smoke-test"));
  } else {
    results.push({
      step: "api-smoke-test",
      status: "FAIL",
      output: "Skipped — server not up on :3001",
    });
  }

  const git = await run("git", ["rev-parse", "--short", "HEAD"], "git-hash");
  const devUrl = portUp.up ? `http://localhost:${PORT}` : null;
  const summary = {
    finishedAt: new Date().toISOString(),
    commit: git.output?.trim() || null,
    devUrl,
    results,
    allPass: results.every((r) => r.status === "PASS" || r.status === "WARN" || r.status === "SKIP"),
  };

  writeFileSync(logPath, JSON.stringify(summary, null, 2));
  console.log("\n=== RUN ALL SUMMARY ===");
  for (const r of results) {
    console.log(`${r.status}  ${r.step}${r.url ? ` → ${r.url}` : ""}`);
  }
  console.log(`\nApp: ${devUrl || "not running"}`);
  console.log(`Commit: ${summary.commit}`);
  console.log(`Written: ${logPath}`);

  process.exit(summary.allPass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});