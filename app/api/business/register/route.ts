import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { parseBankDetails } from "@/lib/business/bank";
import { resolveLogoFromBody } from "@/lib/business/resolve-logo";
import { registerOwnerWithStore } from "@/lib/business/register-owner";
import { isDatabaseConfigured } from "@/lib/db";
import { sendWelcomeOwnerEmail } from "@/lib/email/transactional";
import {
  getClientIp,
  pruneRateLimitBuckets,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/rate-limit";

export const runtime = "nodejs";

const REGISTER_LIMIT = 8;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  pruneRateLimitBuckets();
  const ip = getClientIp(request);
  const limited = rateLimit(`register:${ip}`, {
    limit: REGISTER_LIMIT,
    windowMs: REGISTER_WINDOW_MS,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many signup attempts from this network. Try again later." },
      { status: 429, headers: rateLimitHeaders(limited, REGISTER_LIMIT) },
    );
  }

  const body = await request.json().catch(() => null);
  const ownerName = typeof body?.ownerName === "string" ? body.ownerName.trim() : "";
  const ownerEmail = typeof body?.ownerEmail === "string" ? body.ownerEmail.toLowerCase().trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const currency = typeof body?.currency === "string" ? body.currency : "NGN";
  const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : undefined;
  const phone = typeof body?.phone === "string" ? body.phone : undefined;
  const whatsapp = typeof body?.whatsapp === "string" ? body.whatsapp : undefined;
  const description = typeof body?.description === "string" ? body.description : undefined;
  const sellTypeId =
    typeof body?.sellTypeId === "string" && body.sellTypeId.trim()
      ? body.sellTypeId.trim()
      : null;

  if (!ownerName || ownerName.length < 2) {
    return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
  }
  if (!ownerEmail || !ownerEmail.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
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
    const logoUrl = await resolveLogoFromBody(body, slug);
    const passwordHash = await hashPassword(password);
    const { user, business } = await registerOwnerWithStore({
      ownerName,
      ownerEmail,
      passwordHash,
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
      sellTypeId,
    });

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      businessId: business.id,
    });

    sendWelcomeOwnerEmail({ name: user.name, email: user.email });

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
      redirectTo: "/dashboard",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create your store." },
      { status: 400 },
    );
  }
}