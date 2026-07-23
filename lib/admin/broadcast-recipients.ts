import "server-only";

import type { BusinessPlan, StoreApprovalStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export type BroadcastAudienceKind = "all_owners" | "plan" | "approval";

export type BroadcastAudienceInput = {
  audience: BroadcastAudienceKind;
  plan?: BusinessPlan;
  approvalStatus?: StoreApprovalStatus;
};

export type SellerRecipient = {
  email: string;
  name: string;
  storeName: string;
  businessId: string;
};

export async function listSellerRecipients(
  input: BroadcastAudienceInput,
): Promise<SellerRecipient[]> {
  const where: {
    deletedAt: null;
    plan?: BusinessPlan;
    approvalStatus?: StoreApprovalStatus;
  } = { deletedAt: null };

  if (input.audience === "plan" && input.plan) {
    where.plan = input.plan;
  }
  if (input.audience === "approval" && input.approvalStatus) {
    where.approvalStatus = input.approvalStatus;
  }

  const stores = await prisma.business.findMany({
    where,
    select: {
      id: true,
      name: true,
      owner: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const byEmail = new Map<string, SellerRecipient>();

  for (const store of stores) {
    const email = store.owner?.email?.trim().toLowerCase();
    if (!email || byEmail.has(email)) continue;
    byEmail.set(email, {
      email: store.owner.email.trim(),
      name: store.owner.name || "Seller",
      storeName: store.name,
      businessId: store.id,
    });
  }

  return Array.from(byEmail.values());
}

export async function countSellerRecipients(input: BroadcastAudienceInput) {
  const recipients = await listSellerRecipients(input);
  return recipients.length;
}
