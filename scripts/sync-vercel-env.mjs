/**
 * Push local .env.local values to Vercel production + preview.
 * Requires: VERCEL_TOKEN (https://vercel.com/account/tokens)
 * Run: npm run vercel:sync-env
 */
import { randomBytes } from "crypto";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const PROJECT_NAME = "cartflow";
const PRODUCTION_URL = process.env.CARTFLOW_PRODUCTION_URL ?? "https://cartflow-hbq8ezxen-839.vercel.app";
const API = "https://api.vercel.com";

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const vars = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function toPooledNeonUrl(url) {
  if (!url || url.includes("-pooler.")) return url;
  return url.replace(/@([^.]+)\./, "@$1-pooler.");
}

function secret(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

async function api(path, { method = "GET", body, token, teamId } = {}) {
  const url = new URL(`${API}${path}`);
  if (teamId) url.searchParams.set("teamId", teamId);

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  }
  return data;
}

async function getToken() {
  const fromEnv = process.env.VERCEL_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  throw new Error("Set VERCEL_TOKEN (create at https://vercel.com/account/tokens) then re-run npm run vercel:sync-env");
}

async function getTeamId(token) {
  const teams = await api("/v2/teams", { token });
  const list = teams?.teams ?? [];
  if (list.length === 0) return undefined;
  return list[0].id;
}

async function getProject(token, teamId) {
  const projects = await api(`/v9/projects?search=${PROJECT_NAME}`, { token, teamId });
  const match =
    projects?.projects?.find((p) => p.name === PROJECT_NAME) ?? projects?.projects?.[0];
  if (!match) throw new Error(`Vercel project "${PROJECT_NAME}" not found`);
  return match;
}

async function listEnv(token, projectId, teamId) {
  return api(`/v9/projects/${projectId}/env`, { token, teamId });
}

async function upsertEnv(token, projectId, teamId, key, value, targets) {
  const existing = await listEnv(token, projectId, teamId);
  const found = (existing?.envs ?? []).find((e) => e.key === key);

  if (found) {
    await api(`/v9/projects/${projectId}/env/${found.id}`, {
      method: "PATCH",
      token,
      teamId,
      body: { value, target: targets, type: "encrypted" },
    });
    return "updated";
  }

  await api(`/v10/projects/${projectId}/env`, {
    method: "POST",
    token,
    teamId,
    body: { key, value, type: "encrypted", target: targets },
  });
  return "created";
}

async function disableDeploymentProtection(token, projectId, teamId) {
  try {
    await api(`/v9/projects/${projectId}`, {
      method: "PATCH",
      token,
      teamId,
      body: {
        ssoProtection: null,
        passwordProtection: null,
        optionsAllowlist: null,
      },
    });
    return true;
  } catch (err) {
    console.warn("Could not disable deployment protection:", err.message);
    return false;
  }
}

async function triggerRedeploy(token, projectId, teamId) {
  const deployments = await api(`/v6/deployments?projectId=${projectId}&limit=1`, { token, teamId });
  const latest = deployments?.deployments?.[0];
  if (!latest?.uid) return;

  await api("/v13/deployments", {
    method: "POST",
    token,
    teamId,
    body: {
      name: PROJECT_NAME,
      project: projectId,
      target: "production",
      deploymentId: latest.uid,
    },
  });
}

async function main() {
  const token = await getToken();
  const local = loadEnvFile(resolve(process.cwd(), ".env.local"));

  const teamId = await getTeamId(token);
  const project = await getProject(token, teamId);
  console.log(`Project: ${project.name} (${project.id})`);
  if (teamId) console.log(`Team: ${teamId}`);

  const directUrl = local.DATABASE_URL ?? "";
  const databaseUrl = toPooledNeonUrl(directUrl);
  const authSecret =
    local.AUTH_SECRET && !local.AUTH_SECRET.includes("replace")
      ? local.AUTH_SECRET
      : secret(32);
  const revalidateSecret = local.REVALIDATE_SECRET ?? secret(16);

  const vars = {
    DATABASE_URL: databaseUrl,
    AUTH_SECRET: authSecret,
    NEXT_PUBLIC_APP_URL: PRODUCTION_URL,
    REVALIDATE_SECRET: revalidateSecret,
  };

  const targets = ["production", "preview", "development"];

  for (const [key, value] of Object.entries(vars)) {
    if (!value) {
      console.warn(`Skipping ${key} (empty)`);
      continue;
    }
    const action = await upsertEnv(token, project.id, teamId, key, value, targets);
    console.log(`✓ ${key} ${action}`);
  }

  const protectionOff = await disableDeploymentProtection(token, project.id, teamId);
  if (protectionOff) console.log("✓ Deployment protection disabled (public demo access)");

  try {
    await triggerRedeploy(token, project.id, teamId);
    console.log("✓ Production redeploy triggered");
  } catch (err) {
    console.warn("Redeploy skipped:", err.message);
    console.log("Push to GitHub or redeploy from Vercel dashboard to apply env vars.");
  }

  console.log(`\nLive URL: ${PRODUCTION_URL}`);
  console.log("Demo login: demo@cartflow.app / demo12345");
  console.log("Stores: /ada-styles  /glow-beauty");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});