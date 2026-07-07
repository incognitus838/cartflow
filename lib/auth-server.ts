import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { canManageProducts, isLiveStore } from "@/lib/business/approval";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { resolveStoreAccessContext } from "@/lib/store-access";
import type { StoreAccessRole } from "@/lib/store-access-types";
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

  if (!user) {
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
  const ctx = await getAuthContext();
  if (!ctx.session || !ctx.user) {
    redirect(redirectTo);
  }
  return ctx as typeof ctx & { session: NonNullable<typeof ctx.session>; user: NonNullable<typeof ctx.user> };
}

export async function requireBusiness() {
  const ctx = await requireAuth();
  if (!ctx.business || !ctx.storeAccessRole || !ctx.permissions) {
    redirect("/onboarding");
  }
  return ctx as typeof ctx & {
    business: NonNullable<typeof ctx.business>;
    storeAccessRole: StoreAccessRole;
    permissions: MemberPermissions;
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
  const ctx = await requireAuth();
  if (ctx.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return ctx;
}