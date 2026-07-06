import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET() {
  const ctx = await getAuthContext();

  if (!ctx.session || !ctx.user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
      role: ctx.user.role,
    },
    business: ctx.business
      ? {
          id: ctx.business.id,
          name: ctx.business.name,
          slug: ctx.business.slug,
          currency: ctx.business.currency,
          logoUrl: ctx.business.logoUrl,
        }
      : null,
  });
}