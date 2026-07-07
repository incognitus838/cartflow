import "server-only";

import { Prisma, type MemberAccessPreset } from "@prisma/client";
import { prisma } from "@/lib/db";
import { logStoreActivity } from "@/lib/team/activity";
import { permissionsForMember } from "@/lib/team/permissions";
import type { MemberPermissions } from "@/lib/team/permissions-shared";
import { planAllowsStaff, staffSeatLimit } from "@/lib/team/plan-limits";

export async function countTeamSeats(businessId: string) {
  const [members, pendingInvites] = await Promise.all([
    prisma.businessMember.count({
      where: { businessId, role: "STAFF", isSuspended: false },
    }),
    prisma.staffInvite.count({
      where: { businessId, status: "PENDING", expiresAt: { gt: new Date() } },
    }),
  ]);
  return members + pendingInvites;
}

export async function assertCanAddTeamSeat(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { plan: true },
  });
  if (!business) throw new Error("Store not found.");
  if (!planAllowsStaff(business.plan)) {
    throw new Error("Upgrade to Pro to invite team members.");
  }
  const limit = staffSeatLimit(business.plan);
  if (limit == null) return;
  const used = await countTeamSeats(businessId);
  if (used >= limit) {
    throw new Error(`Your plan allows up to ${limit} team seats. Remove a member or pending invite first.`);
  }
}

export async function listTeamMembers(businessId: string) {
  const members = await prisma.businessMember.findMany({
    where: { businessId },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    include: {
      user: { select: { id: true, name: true, email: true, role: true, isSuspended: true } },
    },
  });

  return members.map((member) => ({
    id: member.id,
    userId: member.userId,
    role: member.role,
    accessPreset: member.accessPreset,
    permissions: permissionsForMember(member),
    isSuspended: member.isSuspended,
    suspendedAt: member.suspendedAt,
    createdAt: member.createdAt,
    user: member.user,
    isOwner: member.role === "OWNER" || member.userId === undefined,
  }));
}

export async function removeTeamMember(
  businessId: string,
  memberId: string,
  actor: { userId: string; name: string },
) {
  const member = await prisma.businessMember.findFirst({
    where: { id: memberId, businessId },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!member) throw new Error("Team member not found.");
  if (member.role === "OWNER") throw new Error("Cannot remove the store owner.");

  await prisma.businessMember.delete({ where: { id: member.id } });
  await logStoreActivity({
    businessId,
    action: "MEMBER_REMOVED",
    actorUserId: actor.userId,
    actorName: actor.name,
    detail: `Removed ${member.user.name} (${member.user.email})`,
  });
}

export async function setMemberSuspended(
  businessId: string,
  memberId: string,
  suspended: boolean,
  actor: { userId: string; name: string },
) {
  const member = await prisma.businessMember.findFirst({
    where: { id: memberId, businessId, role: "STAFF" },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!member) throw new Error("Team member not found.");

  await prisma.businessMember.update({
    where: { id: member.id },
    data: {
      isSuspended: suspended,
      suspendedAt: suspended ? new Date() : null,
    },
  });

  await logStoreActivity({
    businessId,
    action: suspended ? "MEMBER_SUSPENDED" : "MEMBER_RESTORED",
    actorUserId: actor.userId,
    actorName: actor.name,
    detail: `${suspended ? "Suspended" : "Restored"} ${member.user.name}`,
  });
}

export async function updateMemberAccess(
  businessId: string,
  memberId: string,
  input: {
    accessPreset: MemberAccessPreset;
    permissions?: MemberPermissions | null;
  },
  actor: { userId: string; name: string },
) {
  const member = await prisma.businessMember.findFirst({
    where: { id: memberId, businessId, role: "STAFF" },
    include: { user: { select: { name: true } } },
  });
  if (!member) throw new Error("Team member not found.");

  const data: Prisma.BusinessMemberUpdateInput = {
    accessPreset: input.accessPreset,
    permissions:
      input.accessPreset === "CUSTOM" && input.permissions
        ? (input.permissions as Prisma.InputJsonValue)
        : Prisma.JsonNull,
  };

  await prisma.businessMember.update({ where: { id: member.id }, data });
  await logStoreActivity({
    businessId,
    action: "MEMBER_ACCESS_UPDATED",
    actorUserId: actor.userId,
    actorName: actor.name,
    detail: `Updated access for ${member.user.name} → ${input.accessPreset}`,
    metadata: { memberId: member.id, accessPreset: input.accessPreset },
  });
}