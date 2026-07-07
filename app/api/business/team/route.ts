import { NextResponse } from "next/server";
import { requireApiStoreOwner } from "@/lib/api/require-business";
import { prisma } from "@/lib/db";
import { listStoreActivity } from "@/lib/team/activity";
import { listPendingInvites } from "@/lib/team/invites";
import { countTeamSeats, listTeamMembers } from "@/lib/team/members";
import { planAllowsStaff, staffSeatLimit, staffUpgradeMessage } from "@/lib/team/plan-limits";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireApiStoreOwner();
  if (auth.error) return auth.error;

  const { business } = auth;
  const [staffMembers, invites, activity, seatsUsed, owner] = await Promise.all([
    listTeamMembers(business.id),
    listPendingInvites(business.id),
    listStoreActivity(business.id, 40),
    countTeamSeats(business.id),
    prisma.user.findUnique({
      where: { id: business.ownerId },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const members = owner
    ? [
        {
          id: `owner-${owner.id}`,
          userId: owner.id,
          role: "OWNER",
          accessPreset: "OWNER",
          permissions: null,
          isSuspended: false,
          suspendedAt: null,
          createdAt: business.createdAt,
          user: owner,
          isOwner: true,
        },
        ...staffMembers.filter((m) => m.userId !== owner.id),
      ]
    : staffMembers;

  const seatLimit = staffSeatLimit(business.plan);
  const staffEnabled = planAllowsStaff(business.plan);

  return NextResponse.json({
    plan: business.plan,
    staffEnabled,
    upgradeMessage: staffUpgradeMessage(business.plan),
    seats: {
      used: seatsUsed,
      limit: seatLimit,
    },
    members,
    invites: invites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      name: invite.name,
      accessPreset: invite.accessPreset,
      status: invite.status,
      expiresAt: invite.expiresAt.toISOString(),
      createdAt: invite.createdAt.toISOString(),
      invitedBy: invite.invitedBy,
    })),
    activity: activity.map((entry) => ({
      id: entry.id,
      action: entry.action,
      actorName: entry.actorName,
      detail: entry.detail,
      createdAt: entry.createdAt.toISOString(),
    })),
  });
}