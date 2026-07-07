import { NextResponse } from "next/server";
import { createSession, getSession } from "@/lib/auth";
import { parseBankDetails } from "@/lib/business/bank";
import { createBusinessForOwner } from "@/lib/business/create";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { sendStoreSubmittedEmail } from "@/lib/email/transactional";
import { canUserCreateStore } from "@/lib/team/stores";
import { getBusinessForUser } from "@/lib/tenant";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const createCheck = await canUserCreateStore(session.userId);
  if (!createCheck.allowed) {
    return NextResponse.json({ error: createCheck.reason }, { status: 403 });
  }

  const ownedCount = await prisma.business.count({ where: { ownerId: session.userId } });
  const isAddStore = ownedCount > 0;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : undefined;
  const currency = typeof body?.currency === "string" ? body.currency : "NGN";
  const logoUrl = typeof body?.logoUrl === "string" ? body.logoUrl : undefined;
  const phone = typeof body?.phone === "string" ? body.phone : undefined;
  const whatsapp = typeof body?.whatsapp === "string" ? body.whatsapp : undefined;
  const description = typeof body?.description === "string" ? body.description : undefined;

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Business name is required." }, { status: 400 });
  }

  const bank = parseBankDetails(body ?? {}, true);
  if (typeof bank === "string") {
    return NextResponse.json({ error: bank }, { status: 400 });
  }
  if (!bank) {
    return NextResponse.json({ error: "Bank details are required." }, { status: 400 });
  }

  try {
    const business = await createBusinessForOwner({
      ownerId: session.userId,
      name,
      slug,
      currency,
      logoUrl,
      phone,
      whatsapp,
      description,
      bankName: bank.bankName,
      bankAccountName: bank.bankAccountName,
      bankAccountNumber: bank.bankAccountNumber,
    });

    await createSession({
      ...session,
      businessId: business.id,
    });

    const owner = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true },
    });
    if (owner) {
      sendStoreSubmittedEmail({
        ownerName: owner.name,
        ownerEmail: owner.email,
        storeName: business.name,
        storeSlug: business.slug,
        businessId: business.id,
      });
    }

    return NextResponse.json({
      ok: true,
      pendingApproval: business.approvalStatus === "PENDING",
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        currency: business.currency,
        approvalStatus: business.approvalStatus,
      },
      redirectTo: isAddStore ? "/dashboard/stores" : "/dashboard",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create store." },
      { status: 400 },
    );
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!session.businessId) {
    return NextResponse.json({ business: null });
  }

  const business = await getBusinessForUser(session.userId, session.businessId);
  if (!business) {
    return NextResponse.json({ business: null });
  }

  return NextResponse.json({
    business: {
      id: business.id,
      name: business.name,
      slug: business.slug,
      currency: business.currency,
      logoUrl: business.logoUrl,
      phone: business.phone,
      whatsapp: business.whatsapp,
    },
  });
}