/**
 * API + route smoke test for platform audit.
 * Run: npx dotenv-cli -e .env.local -- node scripts/audit-api-smoke.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "audit-api-smoke-result.json");

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
  return Array.from(jar.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function api(path, options = {}) {
  const headers = { ...(options.headers ?? {}) };
  const cookie = cookieHeader();
  if (cookie) headers.Cookie = cookie;
  if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  storeCookies(res);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 300) };
  }
  return { status: res.status, json, text };
}

async function page(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: cookieHeader() ? { Cookie: cookieHeader() } : {},
    redirect: "manual",
  });
  const text = await res.text();
  return {
    status: res.status,
    text,
    hasPrismaError: /PrismaClientValidationError|Unknown argument/.test(text),
    hasErrorBoundary: /Application error|Internal Server Error/i.test(text),
    title: text.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? null,
  };
}

const prisma = new PrismaClient();
const results = { ok: false, steps: [], routes: [] };

function step(name, status, ok, extra = {}) {
  results.steps.push({ step: name, status, ok, ...extra });
}

try {
  const health = await api("/api/health");
  step("health", health.status, health.status === 200 && health.json?.ok === true);

  const glow = await prisma.business.findUnique({ where: { slug: "glow-beauty" } });
  if (!glow) throw new Error("glow-beauty missing — run db:seed-beauty");

  const adminLogin = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@cartflow.app", password: "demo12345" }),
  });
  step("admin_login", adminLogin.status, adminLogin.status === 200);

  const approvals = await api("/api/admin/approvals");
  step("admin_approvals_api", approvals.status, approvals.status === 200, {
    pendingCount: approvals.json?.pendingCount,
  });

  const adminRoutes = [
    "/admin",
    "/admin/analytics",
    "/admin/approvals",
    "/admin/stores",
    "/admin/orders",
    "/admin/users",
    "/admin/customers",
  ];

  for (const route of adminRoutes) {
    const r = await page(route);
    const ok = (r.status === 200 || r.status === 307) && !r.hasPrismaError && !r.hasErrorBoundary;
    results.routes.push({ route, role: "admin", ...r, ok });
  }

  await api("/api/auth/logout", { method: "POST" });

  const sellerLogin = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "demo@cartflow.app", password: "demo12345" }),
  });
  step("seller_login", sellerLogin.status, sellerLogin.status === 200);

  const deliveryZonesPublic = await api("/api/storefront/glow-beauty/delivery-zones");
  step(
    "storefront_delivery_zones",
    deliveryZonesPublic.status,
    deliveryZonesPublic.status === 200 && Array.isArray(deliveryZonesPublic.json?.zones),
    { zoneCount: deliveryZonesPublic.json?.zones?.length },
  );

  const sellerRoutes = [
    "/dashboard",
    "/dashboard/storefront",
    "/dashboard/products",
    "/dashboard/orders",
    "/dashboard/settings",
  ];

  for (const route of sellerRoutes) {
    const r = await page(route);
    const ok = (r.status === 200 || r.status === 307) && !r.hasPrismaError && !r.hasErrorBoundary;
    results.routes.push({ route, role: "seller", ...r, ok });
  }

  const sellerZones = await api("/api/business/delivery-zones");
  step(
    "business_delivery_zones",
    sellerZones.status,
    sellerZones.status === 200 && Array.isArray(sellerZones.json?.zones),
    { zoneCount: sellerZones.json?.zones?.length },
  );

  const dbBusiness = await prisma.business.findFirst({
    where: { owner: { email: "demo@cartflow.app" } },
    orderBy: { createdAt: "asc" },
  });
  if (!dbBusiness) throw new Error("demo seller business missing");

  const settingsGet = await api("/api/business/settings");
  const settingsBiz = settingsGet.json?.business;
  const bankMatchesDb =
    settingsBiz?.bankName === dbBusiness.bankName &&
    settingsBiz?.bankAccountName === dbBusiness.bankAccountName &&
    settingsBiz?.bankAccountNumber === dbBusiness.bankAccountNumber;
  step(
    "business_settings_get_bank_sync",
    settingsGet.status,
    settingsGet.status === 200 && bankMatchesDb,
    {
      slug: dbBusiness.slug,
      hasBank: Boolean(dbBusiness.bankAccountNumber),
    },
  );

  const originalDescription = dbBusiness.description ?? "";
  const partialPatch = await api("/api/business/settings", {
    method: "PATCH",
    body: JSON.stringify({
      name: dbBusiness.name,
      slug: dbBusiness.slug,
      description: originalDescription,
      currency: dbBusiness.currency,
      deliveryFee: Number(dbBusiness.deliveryFee),
      phone: dbBusiness.phone ?? undefined,
      whatsapp: dbBusiness.whatsapp ?? undefined,
      autoDeductInventory: dbBusiness.autoDeductInventory,
      notifyOnNewOrder: dbBusiness.notifyOnNewOrder,
      notifyCustomerOnStatus: dbBusiness.notifyCustomerOnStatus,
    }),
  });
  const afterPartial = await prisma.business.findUnique({ where: { id: dbBusiness.id } });
  const bankPreserved =
    afterPartial?.bankName === dbBusiness.bankName &&
    afterPartial?.bankAccountName === dbBusiness.bankAccountName &&
    afterPartial?.bankAccountNumber === dbBusiness.bankAccountNumber;
  step(
    "business_settings_partial_patch_preserves_bank",
    partialPatch.status,
    partialPatch.status === 200 && bankPreserved,
  );

  const storefrontPage = await page(`/${dbBusiness.slug}`);
  const contact = dbBusiness.whatsapp || dbBusiness.phone;
  const contactDigits = contact ? contact.replace(/\D/g, "") : "";
  const expectsChatLink =
    Boolean(contactDigits) && dbBusiness.showContactButton !== false;
  const storefrontSynced =
    storefrontPage.text?.includes(dbBusiness.name) &&
    (!expectsChatLink || storefrontPage.text?.includes(`wa.me/${contactDigits}`));
  step(
    "storefront_seller_details_from_db",
    storefrontPage.status,
    storefrontPage.status === 200 && storefrontSynced,
    {
      slug: dbBusiness.slug,
      name: dbBusiness.name,
      expectsChatLink,
    },
  );

  const demoBankHardcoded =
    storefrontPage.text?.includes("0123456789") &&
    dbBusiness.bankAccountNumber !== "0123456789";
  step(
    "storefront_no_stale_demo_bank",
    storefrontPage.status,
    !demoBankHardcoded,
    { note: "Public HTML must not show seed demo account when DB differs" },
  );

  const planGet = await api("/api/business/plan");
  step("business_plan_get", planGet.status, planGet.status === 200);

  const planPatch = await api("/api/business/plan", {
    method: "PATCH",
    body: JSON.stringify({ plan: "PRO" }),
  });
  step("business_plan_patch_forbidden", planPatch.status, planPatch.status === 403);

  const analytics = await api("/api/analytics");
  step("business_analytics", analytics.status, analytics.status === 200);

  const catalog = await api("/api/catalog");
  step("business_catalog", catalog.status, catalog.status === 200);

  await api("/api/auth/logout", { method: "POST" });

  const publicRoutes = ["/", "/glow-beauty", "/ada-styles", "/login", "/signup"];
  for (const route of publicRoutes) {
    const r = await page(route);
    const ok = r.status === 200 && !r.hasPrismaError && !r.hasErrorBoundary;
    results.routes.push({ route, role: "public", ...r, ok });
  }

  const impersonate = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@cartflow.app", password: "demo12345" }),
  });
  if (impersonate.status === 200) {
    const imp = await api("/api/admin/impersonate", {
      method: "POST",
      body: JSON.stringify({ businessId: glow.id }),
    });
    step("impersonate", imp.status, imp.status === 200);

    const editor = await page("/dashboard/storefront");
    step("storefront_editor", editor.status, editor.status === 200 && !editor.hasPrismaError, editor);

    const profile = await api("/api/business/storefront-profile");
    step("storefront_profile_get", profile.status, profile.status === 200);
  }

  const routeFails = results.routes.filter((r) => !r.ok);
  const stepFails = results.steps.filter((s) => !s.ok);
  results.ok = routeFails.length === 0 && stepFails.length === 0;
  results.summary = {
    stepsPassed: results.steps.filter((s) => s.ok).length,
    stepsTotal: results.steps.length,
    routesPassed: results.routes.filter((r) => r.ok).length,
    routesTotal: results.routes.length,
    failures: [...stepFails.map((s) => s.step), ...routeFails.map((r) => r.route)],
  };
} catch (e) {
  results.error = String(e.message ?? e);
} finally {
  await prisma.$disconnect();
}

writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results.summary ?? { error: results.error }, null, 2));
process.exit(results.ok ? 0 : 1);