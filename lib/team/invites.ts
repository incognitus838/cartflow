import "server-only";

import { createHash, randomBytes } from "crypto";
import type { MemberAccessPreset, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sendNotification } from "@/lib/notifications/send";
import { logStoreActivity } from "@/lib/team/activity";
import { assertCanAddTeamSeat } from "@/lib/team/members";
import type { MemberPermissions } from "@/lib/team/permissions-shared";
import { resolveMemberPermissions } from "@/lib/team/permissions-shared";

const INVITE_TTL_DAYS = 7;

function inviteToken() {
  return randomBytes(24).toString("hex");
}

export async function listPendingInvites(businessId: string) {
  return prisma.staffInvite.findMany({
    where: {
      businessId,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    include: {
      invitedBy: { select: { name: true, email: true } },
    },
  });
}

export async function createStaffInvite(input: {
  businessId: string;
  email: string;
  name?: string;
  accessPreset: MemberAccessPreset;
  permissions?: MemberPermissions | null;
  invitedById: string;
  invitedByName: string;
  storeName: string;
  appUrl: string;
}) {
  await assertCanAddTeamSeat(input.businessId);

  const email = input.email.toLowerCase().trim();
  if (!email.includes("@")) throw new Error("Enter a valid email address.");

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

  const existingPending = await prisma.staffInvite.findFirst({
    where: {
      businessId: input.businessId,
      email,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
  });
  if (existingPending) throw new Error("An invite is already pending for this email.");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);

  const permissionsJson =
    input.accessPreset === "CUSTOM" && input.permissions
      ? (input.permissions as Prisma.InputJsonValue)
      : undefined;

  const invite = await prisma.staffInvite.create({
    data: {
      businessId: input.businessId,
      email,
      name: input.name?.trim() || null,
      accessPreset: input.accessPreset,
      permissions: permissionsJson,
      token: inviteToken(),
      invitedById: input.invitedById,
      expiresAt,
    },
  });

  const inviteUrl = `${input.appUrl.replace(/\/$/, "")}/invite/${invite.token}`;

  await sendNotification({
    businessId: input.businessId,
    channel: "EMAIL",
    recipient: email,
    subject: `You're invited to ${input.storeName} on CartFlow`,
    body: [
      `Hi${input.name ? ` ${input.name}` : ""},`,
      "",
      `${input.invitedByName} invited you to help manage ${input.storeName} on CartFlow.`,
      `Access level: ${input.accessPreset}`,
      "",
      `Accept your invite: ${inviteUrl}`,
      "",
      `This link expires in ${INVITE_TTL_DAYS} days.`,
    ].join("\n"),
  });

  await logStoreActivity({
    businessId: input.businessId,
    action: "MEMBER_INVITED",
    actorUserId: input.invitedById,
    actorName: input.invitedByName,
    detail: `Invited ${email} as ${input.accessPreset}`,
    metadata: { inviteId: invite.id, email },
  });

  return { invite, inviteUrl };
}

export async function revokeStaffInvite(
  businessId: string,
  inviteId: string,
  actor: { userId: string; name: string },
) {
  const invite = await prisma.staffInvite.findFirst({
    where: { id: inviteId, businessId, status: "PENDING" },
  });
  if (!invite) throw new Error("Invite not found.");

  await prisma.staffInvite.update({
    where: { id: invite.id },
    data: { status: "REVOKED" },
  });

  await logStoreActivity({
    businessId,
    action: "INVITE_REVOKED",
    actorUserId: actor.userId,
    actorName: actor.name,
    detail: `Revoked invite for ${invite.email}`,
  });
}

export async function getInviteByToken(token: string) {
  const invite = await prisma.staffInvite.findUnique({
    where: { token },
    include: {
      business: { select: { id: true, name: true, slug: true, logoUrl: true } },
      invitedBy: { select: { name: true } },
    },
  });
  if (!invite) return null;
  if (invite.status !== "PENDING") return { invite, state: "inactive" as const };
  if (invite.expiresAt < new Date()) {
    await prisma.staffInvite.update({
      where: { id: invite.id },
      data: { status: "EXPIRED" },
    });
    return { invite: { ...invite, status: "EXPIRED" as const }, state: "expired" as const };
  }
  return { invite, state: "active" as const };
}

export async function acceptStaffInvite(input: {
  token: string;
  userId: string;
  userEmail: string;
  userName: string;
}) {
  const loaded = await getInviteByToken(input.token);
  if (!loaded || loaded.state !== "active") {
    throw new Error("This invite is invalid or has expired.");
  }

  const invite = loaded.invite;
  if (invite.email.toLowerCase() !== input.userEmail.toLowerCase()) {
    throw new Error("Sign in with the email address that received the invite.");
  }

  const existing = await prisma.businessMember.findUnique({
    where: { businessId_userId: { businessId: invite.businessId, userId: input.userId } },
  });
  if (existing) throw new Error("You already have access to this store.");

  const permissions = resolveMemberPermissions(
    invite.accessPreset as Parameters<typeof resolveMemberPermissions>[0],
    invite.permissions as Partial<MemberPermissions> | null,
  );

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.businessMember.create({
      data: {
        businessId: invite.businessId,
        userId: input.userId,
        role: "STAFF",
        accessPreset: invite.accessPreset,
        permissions:
          invite.accessPreset === "CUSTOM"
            ? (permissions as Prisma.InputJsonValue)
            : undefined,
        updatedAt: now,
      },
    });

    await tx.staffInvite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });

    await tx.user.update({
      where: { id: input.userId },
      data: { role: "STAFF" },
    });
  });

  await logStoreActivity({
    businessId: invite.businessId,
    action: "MEMBER_JOINED",
    actorUserId: input.userId,
    actorName: input.userName,
    detail: `${input.userName} joined as ${invite.accessPreset}`,
    metadata: { inviteId: invite.id },
  });

  return { businessId: invite.businessId, businessName: invite.business.name };
}

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}