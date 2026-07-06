import { NextResponse } from "next/server";
import { createSession, getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (session.impersonatorId) {
    return NextResponse.json(
      { error: "Exit the current impersonation session first." },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const businessId = typeof body?.businessId === "string" ? body.businessId.trim() : "";
  if (!businessId) {
    return NextResponse.json({ error: "businessId is required." }, { status: 400 });
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { owner: true },
  });

  if (!business) {
    return NextResponse.json({ error: "Store not found." }, { status: 404 });
  }

  await createSession({
    userId: business.owner.id,
    email: business.owner.email,
    name: business.owner.name,
    role: business.owner.role,
    businessId: business.id,
    impersonatorId: session.userId,
  });

  return NextResponse.json({
    ok: true,
    redirectTo: "/dashboard",
    store: { name: business.name, slug: business.slug },
  });
}