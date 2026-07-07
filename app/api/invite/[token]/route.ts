import { NextResponse } from "next/server";
import { getInviteByToken } from "@/lib/team/invites";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const loaded = await getInviteByToken(token);

  if (!loaded) {
    return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  }

  const { invite, state } = loaded;

  return NextResponse.json({
    state,
    invite: {
      email: invite.email,
      name: invite.name,
      accessPreset: invite.accessPreset,
      status: invite.status,
      expiresAt: invite.expiresAt.toISOString(),
      store: invite.business,
      invitedByName: invite.invitedBy.name,
    },
  });
}