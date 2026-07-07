import { NextResponse } from "next/server";
import { getSession, updateSessionBusiness } from "@/lib/auth";
import { acceptStaffInvite } from "@/lib/team/invites";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to accept this invite." }, { status: 401 });
  }

  const { token } = await context.params;

  try {
    const result = await acceptStaffInvite({
      token,
      userId: session.userId,
      userEmail: session.email,
      userName: session.name,
    });

    await updateSessionBusiness(result.businessId);

    return NextResponse.json({
      ok: true,
      businessId: result.businessId,
      businessName: result.businessName,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not accept invite." },
      { status: 400 },
    );
  }
}