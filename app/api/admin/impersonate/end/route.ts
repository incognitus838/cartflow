import { NextResponse } from "next/server";
import { createSession, getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST() {
  const session = await getSession();
  if (!session?.impersonatorId) {
    return NextResponse.json({ error: "Not in an impersonation session." }, { status: 400 });
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.impersonatorId },
  });

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin account not found." }, { status: 404 });
  }

  await createSession({
    userId: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  return NextResponse.json({ ok: true, redirectTo: "/admin" });
}