import "server-only";

import type { MemberAccessPreset, Prisma } from "@prisma/client";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logStoreActivity } from "@/lib/team/activity";
import { assertCanAddTeamSeat } from "@/lib/team/members";
import { generateTeamPassword } from "@/lib/team/passwords";
import type { MemberPermissions } from "@/lib/team/permissions-shared";
import { resolveMemberPermissions } from "@/lib/team/permissions-shared";

export async function createTeamMemberWithPassword(input: {
  businessId: string;
  email: string;
  name: string;
  accessPreset: MemberAccessPreset;
  permissions?: MemberPermissions | null;
  actor: { userId: string; name: string };
}) {
  await assertCanAddTeamSeat(input.businessId);

  const email = input.email.toLowerCase().trim();
  const name = input.name.trim();

  if (!email.includes("@")) throw new Error("Enter a valid email address.");
  if (!name || name.length < 2) throw new Error("Enter the team member's name.");

  const business = await prisma.business.findUnique({
    where: { id: input.businessId },
    select: { ownerId: true, owner: { select: { email: true } } },
  });
  if (!business) throw new Error("Store not found.");
  if (email === business.owner.email) {
    throw new Error("The store owner already has full access.");
  }

  const existingMember = await prisma.businessMember.findFirst({
    where: { businessId: input.businessId, user: { email } },
  });
  if (existingMember) throw new Error("This person is already on your team.");

  const permissions = resolveMemberPermissions(
    input.accessPreset,
    input.permissions ?? null,
  );

  const permissionsJson =
    input.accessPreset === "CUSTOM"
      ? (permissions as Prisma.InputJsonValue)
      : undefined;

  await prisma.staffInvite.updateMany({
    where: {
      businessId: input.businessId,
      email,
      status: "PENDING",
    },
    data: { status: "REVOKED" },
  });

  const password = generateTeamPassword();
  const passwordHash = await hashPassword(password);
  const now = new Date();

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (existingUser) {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: existingUser.id },
        data: { passwordHash, name },
      });

      await tx.businessMember.create({
        data: {
          businessId: input.businessId,
          userId: existingUser.id,
          role: "STAFF",
          accessPreset: input.accessPreset,
          permissions: permissionsJson,
          updatedAt: now,
        },
      });
    });
  } else {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "STAFF",
        },
      });

      await tx.businessMember.create({
        data: {
          businessId: input.businessId,
          userId: user.id,
          role: "STAFF",
          accessPreset: input.accessPreset,
          permissions: permissionsJson,
          updatedAt: now,
        },
      });
    });
  }

  await logStoreActivity({
    businessId: input.businessId,
    action: "MEMBER_JOINED",
    actorUserId: input.actor.userId,
    actorName: input.actor.name,
    detail: `Created login for ${name} (${email}) as ${input.accessPreset}`,
    metadata: { email, accessPreset: input.accessPreset },
  });

  return { email, name, password, accessPreset: input.accessPreset };
}

export async function resetTeamMemberPassword(
  businessId: string,
  memberId: string,
  actor: { userId: string; name: string },
) {
  const member = await prisma.businessMember.findFirst({
    where: { id: memberId, businessId, role: "STAFF" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!member) throw new Error("Team member not found.");

  const password = generateTeamPassword();
  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id: member.user.id },
    data: { passwordHash },
  });

  await logStoreActivity({
    businessId,
    action: "MEMBER_ACCESS_UPDATED",
    actorUserId: actor.userId,
    actorName: actor.name,
    detail: `Reset login password for ${member.user.name}`,
    metadata: { memberId: member.id, email: member.user.email },
  });

  return {
    email: member.user.email,
    name: member.user.name,
    password,
  };
}