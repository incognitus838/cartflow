import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { resolveBusinessForSession } from "@/lib/tenant";

export async function getAuthContext() {
  const session = await getSession();
  if (!session || !isDatabaseConfigured()) {
    return { session: null, user: null, business: null };
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
    return { session: null, user: null, business: null };
  }

  let business = await resolveBusinessForSession(session);
  if (!business && !session.impersonatorId) {
    business =
      user.ownedBusinesses[0] ?? user.memberships[0]?.business ?? null;
  }

  return { session, user, business };
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
  if (!ctx.business) {
    redirect("/onboarding");
  }
  return ctx as typeof ctx & { business: NonNullable<typeof ctx.business> };
}

export async function requireAdmin() {
  const ctx = await requireAuth();
  if (ctx.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return ctx;
}