import { redirect } from "next/navigation";
import { clearSession, getSession, updateSessionBusiness } from "@/lib/auth";
import { forceLogoutRedirect } from "@/lib/auth/force-logout-server";
import { canManageProducts, isLiveStore } from "@/lib/business/approval";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { resolveStoreAccessContext } from "@/lib/store-access";
import type { StoreAccessRole } from "@/lib/store-access-types";
import { listAccessibleStores } from "@/lib/team/stores";
import type { MemberPermissions } from "@/lib/team/permissions-shared";
import { resolveBusinessForSession } from "@/lib/tenant";

export async function getAuthContext() {
  const session = await getSession();
  if (!session || !isDatabaseConfigured()) {
    return {
      session: null,
      user: null,
      business: null,
      storeAccessRole: null,
      permissions: null,
      accessPreset: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      ownedBusinesses: { take: 1, orderBy: { createdAt: "asc" } },
      memberships: {
        take: 1,
        include: { business: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user || user.isSuspended) {
    return {
      session: null,
      user: null,
      business: null,
      storeAccessRole: null,
      permissions: null,
      accessPreset: null,
    };
  }

  let business = await resolveBusinessForSession(session);
  if (!business && !session.impersonatorId) {
    business =
      user.ownedBusinesses[0] ?? user.memberships[0]?.business ?? null;
  }

  const access = business
    ? await resolveStoreAccessContext(session, user.id, business.id)
    : null;

  return {
    session,
    user,
    business,
    storeAccessRole: access?.role ?? null,
    permissions: access?.permissions ?? null,
    accessPreset: access?.accessPreset ?? null,
  };
}

export async function requireAuth(redirectTo = "/login") {
  const session = await getSession();
  if (!session) {
    redirect(redirectTo);
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    await clearSession();
    redirect(redirectTo);
  }
  if (user.isSuspended) {
    await forceLogoutRedirect("suspended", redirectTo);
  }

  const ctx = await getAuthContext();
  if (!ctx.session || !ctx.user) {
    redirect(redirectTo);
  }
  return ctx as typeof ctx & { session: NonNullable<typeof ctx.session>; user: NonNullable<typeof ctx.user> };
}

export async function requireBusiness() {
  const ctx = await requireAuth();
  const userId = ctx.user.id;

  async function switchStoreOrLogout(): Promise<never> {
    const stores = await listAccessibleStores(userId);
    if (stores.length > 0) {
      await updateSessionBusiness(stores[0].id);
      redirect("/dashboard");
    }
    return forceLogoutRedirect("access_revoked");
  }

  if (!ctx.business || !ctx.storeAccessRole || !ctx.permissions) {
    return switchStoreOrLogout();
  }

  if (ctx.business.deletedAt) {
    return switchStoreOrLogout();
  }

  return {
    ...ctx,
    business: ctx.business,
    storeAccessRole: ctx.storeAccessRole,
    permissions: ctx.permissions,
  };
}

export async function requireStoreOwner(redirectTo = "/dashboard") {
  const ctx = await requireBusiness();
  if (ctx.storeAccessRole !== "owner") {
    redirect(redirectTo);
  }
  return ctx;
}

export async function requirePermission(
  permission: keyof MemberPermissions,
  redirectTo = "/dashboard",
) {
  const ctx = await requireBusiness();
  if (!ctx.permissions[permission]) {
    redirect(redirectTo);
  }
  return ctx;
}

export async function requireApprovedForProducts(redirectTo = "/dashboard/products") {
  const ctx = await requirePermission("products", redirectTo);
  if (!canManageProducts(ctx.business)) {
    redirect(redirectTo);
  }
  return ctx;
}

/** Products hub — list inventory and/or edit catalog structure. */
export async function requireProductsHub(redirectTo = "/dashboard") {
  const ctx = await requireBusiness();
  if (!ctx.permissions.products && !ctx.permissions.catalog) {
    redirect(redirectTo);
  }
  return ctx;
}

/** Pages/API for a live approved store (orders, promotions, analytics, etc.). */
export async function requireLiveStore(redirectTo = "/dashboard") {
  const ctx = await requireBusiness();
  if (!isLiveStore(ctx.business)) {
    redirect(redirectTo);
  }
  return ctx;
}

export async function requireLivePermission(
  permission: keyof MemberPermissions,
  redirectTo = "/dashboard",
) {
  const ctx = await requireLiveStore(redirectTo);
  if (!ctx.permissions[permission]) {
    redirect(redirectTo);
  }
  return ctx;
}

export async function requireAdmin() {
  const ctx = await requireAuth("/login");
  if (ctx.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return ctx;
}