import { NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      ownedBusinesses: { take: 1, orderBy: { createdAt: "asc" }, select: { id: true } },
      memberships: {
        take: 1,
        orderBy: { createdAt: "asc" },
        select: { businessId: true },
      },
    },
  });

  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  if (user.isSuspended) {
    return NextResponse.json(
      { error: "This account has been suspended. Contact CartFlow support." },
      { status: 403 },
    );
  }

  const businessId =
    user.ownedBusinesses[0]?.id ?? user.memberships[0]?.businessId ?? undefined;

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    businessId,
  });

  const redirectTo =
    user.role === "ADMIN"
      ? "/admin"
      : businessId
        ? "/dashboard"
        : "/onboarding";

  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    hasBusiness: Boolean(businessId),
    redirectTo,
  });
}