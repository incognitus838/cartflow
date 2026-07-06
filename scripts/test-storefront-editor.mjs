/**
 * End-to-end: admin impersonate Glow Beauty → open storefront editor → save changes.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "storefront-editor-test-result.json");

const jar = new Map();

function storeCookies(res) {
  const raw = res.headers.getSetCookie?.() ?? [];
  for (const line of raw) {
    const [pair] = line.split(";");
    const eq = pair.indexOf("=");
    if (eq > 0) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
}

function cookieHeader() {
  if (jar.size === 0) return undefined;
  return Array.from(jar.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function api(path, options = {}) {
  const headers = { ...(options.headers ?? {}) };
  const cookie = cookieHeader();
  if (cookie) headers.Cookie = cookie;
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  storeCookies(res);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 500) };
  }
  return { status: res.status, json, text };
}

const prisma = new PrismaClient();
const result = { ok: false, steps: [] };

try {
  const glow = await prisma.business.findUnique({
    where: { slug: "glow-beauty" },
    select: { id: true, name: true, slug: true, storefrontTheme: true, heroTagline: true },
  });

  if (!glow) {
    result.error = "Glow Beauty store not found — run npm run db:seed-beauty";
    throw new Error(result.error);
  }

  result.store = glow;

  const login = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@cartflow.app", password: "demo12345" }),
  });
  result.steps.push({ step: "admin_login", status: login.status, ok: login.status === 200 });
  if (login.status !== 200) throw new Error("Admin login failed");

  const impersonate = await api("/api/admin/impersonate", {
    method: "POST",
    body: JSON.stringify({ businessId: glow.id }),
  });
  result.steps.push({
    step: "impersonate_glow_beauty",
    status: impersonate.status,
    ok: impersonate.status === 200,
    store: impersonate.json?.store,
  });
  if (impersonate.status !== 200) throw new Error("Impersonate failed");

  const editorPage = await api("/dashboard/storefront");
  const pageOk =
    editorPage.status === 200 &&
    !/PrismaClientValidationError|Unknown argument/.test(editorPage.text) &&
    /Storefront designer|StorefrontCustomizer/i.test(editorPage.text);
  result.steps.push({
    step: "load_storefront_editor",
    status: editorPage.status,
    ok: pageOk,
    hasDesigner: /Storefront designer/i.test(editorPage.text),
    hasPrismaError: /PrismaClientValidationError/i.test(editorPage.text),
  });
  if (!pageOk) throw new Error("Storefront editor page failed to load");

  const profileGet = await api("/api/business/storefront-profile");
  result.steps.push({
    step: "get_profile",
    status: profileGet.status,
    ok: profileGet.status === 200,
    slug: profileGet.json?.store?.slug,
  });
  if (profileGet.status !== 200) throw new Error("GET storefront profile failed");

  const tagline = `Glow test ${Date.now().toString(36)}`;
  const patch = await api("/api/business/storefront-profile", {
    method: "PATCH",
    body: JSON.stringify({
      storefrontTheme: "WARM",
      accentColor: "#c9a87c",
      heroTagline: tagline,
      welcomeMessage: "Editor save test — free delivery this week",
      showContactButton: true,
      catalogLayout: "GRID",
    }),
  });
  result.steps.push({
    step: "save_storefront",
    status: patch.status,
    ok: patch.status === 200,
    savedTagline: patch.json?.profile?.heroTagline,
  });
  if (patch.status !== 200) throw new Error(patch.json?.error ?? "PATCH storefront profile failed");

  const live = await fetch(`${BASE}/glow-beauty`);
  const liveHtml = await live.text();
  result.steps.push({
    step: "live_storefront",
    status: live.status,
    ok: live.status === 200 && liveHtml.includes(tagline),
    taglineVisible: liveHtml.includes(tagline),
  });

  result.ok = result.steps.every((s) => s.ok);
} catch (e) {
  result.error = String(e.message ?? e);
} finally {
  await prisma.$disconnect();
}

writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);