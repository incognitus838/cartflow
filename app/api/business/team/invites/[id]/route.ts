import { NextResponse } from "next/server";
import { requireApiStoreOwner } from "@/lib/api/require-business";
import { revokeStaffInvite } from "@/lib/team/invites";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireApiStoreOwner();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    await revokeStaffInvite(auth.business.id, id, {
      userId: auth.session.userId,
      name: auth.session.name,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not revoke invite." },
      { status: 400 },
    );
  }
}