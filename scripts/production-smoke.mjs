#!/usr/bin/env node
/**
 * Lightweight production smoke checks (read-only + login).
 * Run: node scripts/production-smoke.mjs
 * Env: SMOKE_BASE_URL (default https://cartflow-839.vercel.app)
 */

const BASE = (process.env.SMOKE_BASE_URL || "https://cartflow-839.vercel.app").replace(/\/$/, "");

const checks = [];

function pass(name, detail = "") {
  checks.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  checks.push({ name, ok: false, detail });
  console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function fetchText(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: "follow" });
  const text = await res.text();
  return { res, text };
}

async function main() {
  console.log(`Smoke testing ${BASE}\n`);

  for (const path of ["/", "/login", "/signup", "/dashboard", "/admin"]) {
    try {
      const { res, text } = await fetchText(path);
      if (res.status >= 500) {
        fail(`GET ${path}`, `HTTP ${res.status}`);
      } else if (text.includes("PrismaClientValidationError")) {
        fail(`GET ${path}`, "Prisma error in HTML");
      } else {
        pass(`GET ${path}`, `HTTP ${res.status}`);
      }
    } catch (error) {
      fail(`GET ${path}`, error instanceof Error ? error.message : String(error));
    }
  }

  try {
    const { res, text } = await fetchText("/glow-beauty");
    if (res.status === 200 && !text.includes("PrismaClientValidationError")) {
      pass("Storefront glow-beauty", "loads");
    } else {
      fail("Storefront glow-beauty", `HTTP ${res.status}`);
    }
  } catch (error) {
    fail("Storefront glow-beauty", error instanceof Error ? error.message : String(error));
  }

  try {
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@cartflow.app", password: "demo12345" }),
    });
    const loginData = await loginRes.json().catch(() => ({}));
    if (loginRes.ok && loginData.redirectTo) {
      pass("Seller login API", loginData.redirectTo);
    } else {
      fail("Seller login API", loginData.error || `HTTP ${loginRes.status}`);
    }
  } catch (error) {
    fail("Seller login API", error instanceof Error ? error.message : String(error));
  }

  const failed = checks.filter((c) => !c.ok);
  console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main();