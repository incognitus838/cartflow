import { NextResponse } from "next/server";
import { requireApiStoreOwner } from "@/lib/api/require-business";
import { resetTeamMemberPassword } from "@/lib/team/create-member";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireApiStoreOwner();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    const result = await resetTeamMemberPassword(auth.business.id, id, {
      userId: auth.session.userId,
      name: auth.session.name,
    });

    return NextResponse.json({
      ok: true,
      credentials: {
        email: result.email,
        name: result.name,
        password: result.password,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not reset password." },
      { status: 400 },
    );
  }
}