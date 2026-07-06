import type { BusinessPlan } from "@prisma/client";
import { prisma } from "@/lib/db";
import { computeReadiness, VALID_APPROVAL_PLANS } from "@/lib/business/approval";
import type { ApprovalReadiness } from "@/lib/business/approval";

export type PendingApprovalRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  currency: string;
  plan: BusinessPlan;
  phone: string | null;
  whatsapp: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  logoUrl: string | null;
  approvalPriority: "NORMAL" | "HIGH";
  submittedAt: string;
  createdAt: string;
  owner: { id: string; name: string; email: string; createdAt: string };
  _count: { products: number; orders: number; customers: number };
  readiness: ApprovalReadiness;
};

export type RecentApprovalDecision = {
  id: string;
  name: string;
  slug: string;
  approvalStatus: "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  approvalReviewedAt: string;
  owner: { id: string; name: string; email: string };
  _count: { products: number; orders: number };
};

export type ReviewStoreInput = {
  action: "approve" | "reject";
  adminUserId: string;
  rejectionReason?: string;
  approvalNotes?: string;
  resubmissionAllowed?: boolean;
  bankVerified?: boolean;
  catalogVerified?: boolean;
  contactVerified?: boolean;
  plan?: BusinessPlan;
  approvalPriority?: "NORMAL" | "HIGH";
};

export async function countPendingStoreApprovals() {
  return prisma.business.count({ where: { approvalStatus: "PENDING" } });
}

export async function listPendingStoreApprovals(take = 100): Promise<PendingApprovalRecord[]> {
  const stores = await prisma.business.findMany({
    where: { approvalStatus: "PENDING" },
    orderBy: [{ approvalPriority: "desc" }, { submittedAt: "asc" }, { createdAt: "asc" }],
    take,
    include: {
      owner: { select: { id: true, name: true, email: true, createdAt: true } },
      _count: { select: { products: true, orders: true, customers: true } },
    },
  });

  return stores.map((store): PendingApprovalRecord => ({
    id: store.id,
    name: store.name,
    slug: store.slug,
    description: store.description,
    currency: store.currency,
    plan: store.plan,
    phone: store.phone,
    whatsapp: store.whatsapp,
    bankName: store.bankName,
    bankAccountName: store.bankAccountName,
    bankAccountNumber: store.bankAccountNumber,
    logoUrl: store.logoUrl,
    approvalPriority: store.approvalPriority,
    submittedAt: (store.submittedAt ?? store.createdAt).toISOString(),
    createdAt: store.createdAt.toISOString(),
    owner: {
      id: store.owner.id,
      name: store.owner.name,
      email: store.owner.email,
      createdAt: store.owner.createdAt.toISOString(),
    },
    _count: store._count,
    readiness: computeReadiness({
      bankAccountNumber: store.bankAccountNumber,
      phone: store.phone,
      whatsapp: store.whatsapp,
      productCount: store._count.products,
      ownerEmail: store.owner.email,
      submittedAt: store.submittedAt,
      createdAt: store.createdAt,
    }),
  }));
}

export async function listRecentApprovalDecisions(take = 20): Promise<RecentApprovalDecision[]> {
  const stores = await prisma.business.findMany({
    where: { approvalStatus: { in: ["APPROVED", "REJECTED"] }, approvalReviewedAt: { not: null } },
    orderBy: { approvalReviewedAt: "desc" },
    take,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { products: true, orders: true } },
    },
  });

  return stores.map((store): RecentApprovalDecision => ({
    id: store.id,
    name: store.name,
    slug: store.slug,
    approvalStatus:
      store.approvalStatus === "REJECTED" ? "REJECTED" : "APPROVED",
    rejectionReason: store.rejectionReason,
    approvalReviewedAt: store.approvalReviewedAt!.toISOString(),
    owner: store.owner,
    _count: store._count,
  }));
}

export async function reviewStoreApplication(businessId: string, input: ReviewStoreInput) {
  const store = await prisma.business.findUnique({
    where: { id: businessId },
    include: { _count: { select: { products: true } } },
  });

  if (!store) throw new Error("Store not found.");

  if (input.action === "approve") {
    const plan =
      input.plan && VALID_APPROVAL_PLANS.includes(input.plan) ? input.plan : store.plan;

    return prisma.business.update({
      where: { id: businessId },
      data: {
        approvalStatus: "APPROVED",
        isActive: true,
        approvalReviewedAt: new Date(),
        approvalReviewedBy: input.adminUserId,
        rejectionReason: null,
        approvalNotes: input.approvalNotes?.trim() || null,
        resubmissionAllowed: true,
        bankVerified: input.bankVerified ?? Boolean(store.bankAccountNumber),
        catalogVerified: input.catalogVerified ?? store._count.products > 0,
        contactVerified: input.contactVerified ?? Boolean(store.phone || store.whatsapp),
        plan,
        planStartedAt: store.planStartedAt ?? new Date(),
        subscriptionStatus: "ACTIVE",
        approvalPriority: input.approvalPriority ?? store.approvalPriority,
      },
    });
  }

  const reason = input.rejectionReason?.trim();
  if (!reason) throw new Error("A rejection reason is required for sellers.");

  return prisma.business.update({
    where: { id: businessId },
    data: {
      approvalStatus: "REJECTED",
      isActive: false,
      approvalReviewedAt: new Date(),
      approvalReviewedBy: input.adminUserId,
      rejectionReason: reason,
      approvalNotes: input.approvalNotes?.trim() || null,
      resubmissionAllowed: input.resubmissionAllowed ?? false,
    },
  });
}