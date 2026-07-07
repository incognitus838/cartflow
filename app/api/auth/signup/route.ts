import { NextResponse } from "next/server";
import { createSession, hashPassword, updateSessionBusiness } from "@/lib/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { sendWelcomeOwnerEmail } from "@/lib/email/transactional";
import { acceptStaffInvite } from "@/lib/team/invites";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const inviteToken = typeof body?.inviteToken === "string" ? body.inviteToken.trim() : "";

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: inviteToken ? "STAFF" : "OWNER" },
  });

  let businessId: string | undefined;
  let redirectTo = "/onboarding";

  if (inviteToken) {
    try {
      const result = await acceptStaffInvite({
        token: inviteToken,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
      });
      businessId = result.businessId;
      redirectTo = "/dashboard";
    } catch (error) {
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid invite." },
        { status: 400 },
      );
    }
  } else {
    const ownedBusiness = await prisma.business.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });
    businessId = ownedBusiness?.id;
    redirectTo = ownedBusiness ? "/dashboard" : "/onboarding";
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    businessId,
  });

  if (businessId) {
    await updateSessionBusiness(businessId);
  }

  if (!inviteToken && user.role === "OWNER") {
    sendWelcomeOwnerEmail({ name: user.name, email: user.email });
  }

  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name },
    hasBusiness: Boolean(businessId),
    redirectTo,
  });
}